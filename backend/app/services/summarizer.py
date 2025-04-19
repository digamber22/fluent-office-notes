from sqlalchemy.orm import Session
from langchain_ollama import OllamaLLM # Corrected import name
from langchain.prompts import PromptTemplate
# LLMChain is deprecated, replaced by LCEL below
import logging
from typing import Optional

from .. import models, schemas, crud
from ..config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Ollama LLM
try:
    logger.info(f"Initializing Ollama LLM: model={settings.OLLAMA_MODEL}, base_url={settings.OLLAMA_BASE_URL}")
    llm = OllamaLLM( # Corrected class name
        model=settings.OLLAMA_MODEL,
        base_url=settings.OLLAMA_BASE_URL
        # Add other parameters like temperature if needed
        # temperature=0.7
    )
    # Simple test invoke to check connection (optional, might slow down startup)
    # llm.invoke("Hi")
    logger.info("Ollama LLM initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize Ollama LLM: {e}", exc_info=True)
    llm = None

# Define the prompt template
# This template instructs the LLM on the desired output format.
# Adjust the instructions based on the specific LLM's capabilities.
prompt_template_text = """
You are an expert meeting assistant. Please analyze the following meeting transcript and provide:
1. A concise summary of the key discussion points and decisions made.
2. A list of specific action items assigned, including who is responsible if mentioned.

Transcript:
{transcript}

Please format your response clearly with headings:

Summary:
[Your summary here]

Action Items:
[List action items here, one per line, e.g., "- John Doe to follow up on budget report."]
"""

prompt = PromptTemplate(template=prompt_template_text, input_variables=["transcript"])

# Create the summarization chain using LCEL
if llm:
    # LangChain Expression Language (LCEL) replaces LLMChain
    summarization_chain = prompt | llm
else:
    summarization_chain = None

def summarize_transcript(db: Session, meeting_id: int, transcript: str) -> Optional[dict]:
    """
    Summarizes the transcript using LangChain and Ollama.
    Updates the meeting record with summary, action items, and COMPLETED status.
    Returns a dictionary with summary and action items if successful, otherwise None.
    """
    if not summarization_chain:
        logger.error("Summarization chain/LLM not initialized. Cannot summarize.")
        crud.update_meeting_status(db, meeting_id, models.MeetingStatus.FAILED, error_message="Summarization LLM not loaded")
        return None

    if not transcript:
        logger.warning(f"Transcript is empty for meeting {meeting_id}. Skipping summarization.")
        # Update status to completed as there's nothing to summarize
        crud.update_meeting_status(db, meeting_id, models.MeetingStatus.COMPLETED)
        return {"summary": "Transcript was empty.", "action_items": "N/A"}

    logger.info(f"Starting summarization for meeting {meeting_id}...")
    # Status should already be PROCESSING from ASR step

    try:
        # Run the summarization chain
        # For LCEL chains (prompt | llm), the input is passed directly,
        # and the output is typically the raw string response from the LLM.
        raw_result = summarization_chain.invoke({"transcript": transcript})

        logger.info(f"Raw LLM response received for meeting {meeting_id}.")

        # --- Parse the LLM response ---
        # This parsing logic assumes the LLM follows the prompt's formatting instructions.
        # It might need adjustments based on actual LLM output.
        summary_text = "Summary not found in response."
        action_items_text = "Action items not found in response."

        if "Summary:" in raw_result:
            parts = raw_result.split("Action Items:", 1)
            summary_part = parts[0].split("Summary:", 1)[1].strip()
            summary_text = summary_part

            if len(parts) > 1:
                action_items_part = parts[1].strip()
                action_items_text = action_items_part
            else:
                 # Handle case where "Action Items:" heading might be missing but summary is present
                 logger.warning(f"Could not find 'Action Items:' heading in LLM response for meeting {meeting_id}")
                 action_items_text = "Action items section missing in LLM response."

        else:
            # Fallback if the expected headings are missing
            logger.warning(f"Could not find 'Summary:' heading in LLM response for meeting {meeting_id}. Using full response as summary.")
            summary_text = raw_result # Use the whole response as summary if parsing fails
            action_items_text = "Could not parse action items from response."
        # --- End Parsing ---


        logger.info(f"Summarization complete for meeting {meeting_id}.")

        # Update the meeting record
        meeting_update = schemas.MeetingUpdate(
            summary=summary_text,
            action_items=action_items_text,
            status=models.MeetingStatus.COMPLETED # Final status
        )
        crud.update_meeting(db, meeting_id, meeting_update)

        return {"summary": summary_text, "action_items": action_items_text}

    except Exception as e:
        logger.error(f"Error during LangChain/Ollama summarization for meeting {meeting_id}: {e}", exc_info=True)
        crud.update_meeting_status(db, meeting_id, models.MeetingStatus.FAILED, error_message=f"Summarization failed: {e}")
        return None
