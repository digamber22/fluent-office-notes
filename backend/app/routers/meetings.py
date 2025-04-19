from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import io
import logging

from .. import crud, models, schemas
from ..database import get_db
from ..config import settings
from ..services import asr, summarizer, pdf_generator # Import the services

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/meetings",
    tags=["Meetings"],
    responses={404: {"description": "Not found"}},
)

# --- Helper Function for Background Processing ---
def process_meeting_audio(db_session_factory, meeting_id: int):
    """
    Background task to run ASR and Summarization.
    Uses a session factory to create a new session for the background task.
    """
    db = db_session_factory() # Create a new session
    try:
        logger.info(f"Background task started for meeting {meeting_id}")
        # 1. Transcribe
        transcript = asr.transcribe_audio(db, meeting_id)

        if transcript is None:
            logger.error(f"Transcription failed for meeting {meeting_id}. Aborting further processing.")
            # Status is already set to FAILED by transcribe_audio
            return

        # 2. Summarize (only if transcription succeeded)
        summarization_result = summarizer.summarize_transcript(db, meeting_id, transcript)

        if summarization_result is None:
            logger.error(f"Summarization failed for meeting {meeting_id}.")
            # Status is already set to FAILED by summarize_transcript
            return

        logger.info(f"Background processing complete for meeting {meeting_id}")
        # Final status (COMPLETED) should be set by summarize_transcript

    except Exception as e:
        logger.error(f"Unhandled exception in background task for meeting {meeting_id}: {e}", exc_info=True)
        # Ensure status is marked as FAILED if an unexpected error occurs
        crud.update_meeting_status(db, meeting_id, models.MeetingStatus.FAILED, error_message=f"Background task error: {e}")
    finally:
        db.close() # Ensure the session is closed

# --- API Endpoints ---

@router.get("/", response_model=List[schemas.Meeting])
async def read_meetings(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of meetings.
    """
    meetings = crud.get_meetings(db, skip=skip, limit=limit)
    return meetings

@router.get("/{meeting_id}", response_model=schemas.Meeting)
async def read_meeting(meeting_id: int, db: Session = Depends(get_db)):
    """
    Retrieve details of a specific meeting by its ID.
    """
    db_meeting = crud.get_meeting(db, meeting_id=meeting_id)
    if db_meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return db_meeting

@router.post("/upload", response_model=schemas.UploadResponse)
async def upload_audio_meeting(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Handle audio file upload.
    Saves the file, creates a meeting record, and triggers background processing.
    """
    # Basic validation
    if not file.content_type or not file.content_type.startswith("audio/"):
        return schemas.UploadResponse(success=False, error="File must be an audio file")

    # Ensure upload directory exists (relative to backend root)
    upload_dir = settings.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)

    db_meeting = None # Initialize to handle potential errors before creation
    try:
        # 1. Create initial meeting record to get an ID
        meeting_create = schemas.MeetingCreate(filename=file.filename)
        db_meeting = crud.create_meeting(db=db, meeting=meeting_create)
        meeting_id = db_meeting.id

        # 2. Define safe filename and path
        # Use meeting ID to ensure uniqueness and avoid path traversal issues
        base_filename, file_extension = os.path.splitext(file.filename)
        safe_filename = f"meeting_{meeting_id}{file_extension}"
        file_path = os.path.join(upload_dir, safe_filename)

        # 3. Save the uploaded file
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            logger.info(f"Audio file saved for meeting {meeting_id} at {file_path}")
        except Exception as e:
             logger.error(f"Failed to save uploaded file for meeting {meeting_id}: {e}", exc_info=True)
             crud.update_meeting_status(db, meeting_id, models.MeetingStatus.FAILED, error_message=f"Failed to save file: {e}")
             return schemas.UploadResponse(success=False, error="Failed to save uploaded file.")
        finally:
            file.file.close() # Ensure file handle is closed

        # 4. Update meeting record with the file path
        crud.update_meeting(db, meeting_id, schemas.MeetingUpdate(audio_file_path=file_path))

        # 5. Add background task for processing
        # Pass the session factory, not the session itself
        from ..database import SessionLocal
        background_tasks.add_task(process_meeting_audio, SessionLocal, meeting_id)
        logger.info(f"Background processing task added for meeting {meeting_id}")

        # Return success response immediately
        return schemas.UploadResponse(success=True, meetingId=str(meeting_id))

    except Exception as e:
        logger.error(f"Error during upload endpoint processing: {e}", exc_info=True)
        # If meeting record was created, mark it as failed
        if db_meeting:
            crud.update_meeting_status(db, db_meeting.id, models.MeetingStatus.FAILED, error_message=f"Upload endpoint error: {e}")
        return schemas.UploadResponse(success=False, error=f"An unexpected error occurred during upload: {e}")


@router.get("/{meeting_id}/export/pdf", response_class=StreamingResponse)
async def export_meeting_pdf(meeting_id: int, db: Session = Depends(get_db)):
    """
    Endpoint to generate and stream a PDF export for a meeting.
    """
    db_meeting = crud.get_meeting(db, meeting_id=meeting_id)
    if db_meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")

    if db_meeting.status != models.MeetingStatus.COMPLETED:
         # Optionally allow exporting even if processing failed/pending, but indicate it
         logger.warning(f"Exporting PDF for meeting {meeting_id} which is not in COMPLETED state (status: {db_meeting.status.value})")
         # raise HTTPException(status_code=400, detail=f"Meeting processing not complete (status: {db_meeting.status.value}). Cannot export PDF yet.")

    try:
        pdf_bytes = pdf_generator.generate_meeting_pdf(db_meeting)
        if not pdf_bytes:
             raise HTTPException(status_code=500, detail="PDF generation failed.")

        # Create a streaming response
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=meeting_{meeting_id}_notes.pdf"}
        )
    except Exception as e:
        logger.error(f"Error preparing PDF stream for meeting {meeting_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate or stream PDF: {e}")


@router.get("/search/", response_model=List[schemas.Meeting])
async def search_meeting_transcripts(
    query: str = Query(..., min_length=1, description="Search query string"),
    db: Session = Depends(get_db)
):
    """
    Search for meetings based on keywords in their transcripts.
    """
    if not query:
        raise HTTPException(status_code=400, detail="Search query cannot be empty")

    results = crud.search_transcripts(db=db, query=query)
    return results # Returns empty list if no results
