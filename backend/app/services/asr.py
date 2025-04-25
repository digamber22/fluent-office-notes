import os
import logging
from typing import Optional, Tuple # Import Tuple
from sqlalchemy.orm import Session
import torch # Whisper uses torch, keep the check

# Import Whisper
try:
    import whisper
except ImportError:
    whisper = None
    logging.getLogger(__name__).error("OpenAI Whisper library not installed. Please install it: pip install openai-whisper")

from .. import models, schemas, crud
from ..config import settings # Keep settings if needed for model name or other configs

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Whisper Model Loading ---
whisper_model = None
if whisper:
    try:
        # Check for GPU availability
        if torch.cuda.is_available():
            device = 'cuda'
            logger.info("CUDA GPU detected. Whisper will run on GPU.")
        else:
            device = 'cpu'
            logger.warning("CUDA GPU not detected. Whisper will run on CPU.")

        # Load the Whisper model (e.g., 'tiny', 'base', 'small', 'medium', 'large')
        # Consider making the model name configurable via settings
        model_name = getattr(settings, 'WHISPER_MODEL', 'base') # Default to 'base' if not in settings
        logger.info(f"Loading Whisper ASR model: {model_name}...")
        whisper_model = whisper.load_model(model_name, device=device)
        logger.info(f"Whisper ASR model '{model_name}' loaded successfully.")

    except Exception as e:
        logger.error(f"Failed to load Whisper ASR model '{model_name}': {e}", exc_info=True)
        whisper_model = None
else:
    logger.error("OpenAI Whisper library not found.")


# --- Main Transcription Function ---
def transcribe_audio(db: Session, meeting_id: int) -> Optional[Tuple[str, str]]:
    """
    Transcribes the audio file associated with the meeting ID using OpenAI Whisper.
    Updates the meeting record with the transcript, detected language, or error status.
    Returns a tuple (transcript_text, detected_language) if successful, otherwise None.
    """
    if whisper_model is None:
        logger.error("Whisper ASR model is not loaded. Cannot transcribe.")
        crud.update_meeting_status(db, meeting_id, models.MeetingStatus.FAILED, error_message="ASR model not loaded")
        return None

    db_meeting = crud.get_meeting(db, meeting_id)
    if not db_meeting:
        logger.error(f"Meeting not found for ID: {meeting_id}")
        return None
    if not db_meeting.audio_file_path or not os.path.exists(db_meeting.audio_file_path):
        logger.error(f"Audio file path not found or invalid for meeting ID: {meeting_id}. Path: {db_meeting.audio_file_path}")
        crud.update_meeting_status(db, meeting_id, models.MeetingStatus.FAILED, error_message="Audio file not found")
        return None

    logger.info(f"Starting Whisper transcription for meeting {meeting_id} (file: {db_meeting.audio_file_path})...")
    crud.update_meeting_status(db, meeting_id, models.MeetingStatus.PROCESSING)

    try:
        # Perform transcription using Whisper
        # Perform transcription using Whisper
        # result is a dictionary containing the transcript and other info, including language
        result = whisper_model.transcribe(db_meeting.audio_file_path, fp16=torch.cuda.is_available()) 
        transcript_text = result.get("text", "")
        detected_language = result.get("language", "unknown") # Get detected language, default to 'unknown'

        logger.info(f"Whisper transcription complete for meeting {meeting_id}. Detected language: {detected_language}")

        # Update the meeting record with transcript and language
        meeting_update = schemas.MeetingUpdate(
            transcript=transcript_text,
            detected_language=detected_language
        )
        crud.update_meeting(db, meeting_id, meeting_update)
        # Don't set status to COMPLETED here, summarization step will do that
        # crud.update_meeting_status(db, meeting_id, models.MeetingStatus.COMPLETED) 
        
        return transcript_text, detected_language # Return both transcript and language

    except Exception as e:
        error_msg = f"Error during Whisper transcription for meeting {meeting_id}: {e}"
        logger.error(error_msg, exc_info=True)
        crud.update_meeting_status(db, meeting_id, models.MeetingStatus.FAILED, error_message=error_msg)
        return None
