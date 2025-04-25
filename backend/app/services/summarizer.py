from sqlalchemy.orm import Session
from langchain_ollama import OllamaLLM # Corrected import name
from langchain.prompts import PromptTemplate
# LLMChain is deprecated, replaced by LCEL below
import logging
from typing import Optional, List # Import List

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
1. A concise summary of the key discussion points and decisions made. **Do NOT include specific action items or task assignments in the summary section.**
2. A list of specific action items assigned, including who is responsible if mentioned.

Transcript:
{transcript}

Please format your response clearly with headings:

Summary:
[Your summary here - focus only on discussion points and decisions, not action items]

Action Items:
[Output a JSON list of strings representing the action items. Example: ["Action item 1", "Follow up with Jane Doe"]. If no action items are found, output an empty JSON list: []]
"""

prompt = PromptTemplate(template=prompt_template_text, input_variables=["transcript"])

import json # Import json for storing list as string in DB

# Create the summarization chain using LCEL
if llm:
    # LangChain Expression Language (LCEL) replaces LLMChain
    summarization_chain = prompt | llm
else:
    summarization_chain = None

# --- Placeholder Translation Function ---
# In a real application, this would call an external translation API
def translate_text(text: str, target_language: str) -> str:
    logger.info(f"Placeholder: Translating text to {target_language}. Returning original.")
    # Simulate translation by returning original text
    # Replace with actual translation call, e.g., Google Translate, DeepL, etc.
    if not text:
        return ""
    return text

def translate_action_items(items: List[str], target_language: str) -> List[str]:
    logger.info(f"Placeholder: Translating action items to {target_language}. Returning original.")
    # Simulate translation by returning original items
    # Replace with actual translation call for each item
    if not items:
        return []
    return [translate_text(item, target_language) for item in items]
# --- End Placeholder ---


def summarize_transcript(db: Session, meeting_id: int, transcript: str, detected_language: str) -> Optional[dict]:
    """
    Summarizes the transcript using LangChain and Ollama.
    Generates English and Mandarin versions (using placeholders for translation).
    Updates the meeting record with summaries, action items, and COMPLETED status.
    Returns a dictionary with EN summary and action items if successful, otherwise None.
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
        action_items_part = None # Initialize to None


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
            # Fallback if the expected headings are missing (Corrected Indentation)
            logger.warning(f"Could not find 'Summary:' heading in LLM response for meeting {meeting_id}. Using full response as summary.")
            summary_text = raw_result # Use the whole response as summary if parsing fails
            action_items_text = "Could not parse action items from response." # Keep this for logging if needed

        # --- Improved Action Item JSON Parsing ---
        action_items_list = [] # Default to empty list
        if action_items_part: # Only attempt parsing if we found the section
            try:
                # Attempt to find and parse a JSON list within the action items part
                # This regex looks for patterns like [...] or ['...'] or ["..."]
                import re
                match = re.search(r'\[.*?\]', action_items_part, re.DOTALL)
                if match:
                    json_str = match.group(0)
                    parsed_json = json.loads(json_str)
                    if isinstance(parsed_json, list):
                        # Ensure all items in the list are strings
                        action_items_list = [str(item) for item in parsed_json]
                        logger.info(f"Successfully parsed JSON action items for meeting {meeting_id}.")
                    else:
                        logger.warning(f"Parsed JSON for action items is not a list for meeting {meeting_id}. Content: {json_str}")
                else:
                    logger.warning(f"Could not find JSON list pattern in action items section for meeting {meeting_id}. Content: {action_items_part}")
            except json.JSONDecodeError:
                logger.warning(f"Failed to decode JSON from action items section for meeting {meeting_id}. Content: {action_items_part}")
            except Exception as parse_err:
                 logger.error(f"Unexpected error parsing action items JSON for meeting {meeting_id}: {parse_err}", exc_info=True)
        else:
              logger.info(f"Action items section was empty or not found for meeting {meeting_id}.")
        # --- End Improved Parsing ---

        # --- Clean up summary text to remove any trailing action items section ---
        # This ensures the summary field only contains the summary, even if the LLM included action items there.
        if "Action Items:" in summary_text:
            summary_text = summary_text.split("Action Items:", 1)[0].strip()
            logger.info(f"Cleaned 'Action Items:' section from summary text for meeting {meeting_id}.")
        # --- End Summary Cleanup ---


        logger.info(f"Summarization and parsing complete for meeting {meeting_id}. Found {len(action_items_list)} action items.")

        # --- Generate English and Mandarin Versions (with Placeholder Translation) ---
        # Assume the LLM primarily outputs English based on the prompt
        summary_en = summary_text # Use the cleaned summary text
        action_items_en = action_items_list

        # Placeholder: Translate to Mandarin
        summary_zh = translate_text(summary_en, "zh")
        action_items_zh = translate_action_items(action_items_en, "zh")
        # --- End Generation ---


        # Update the meeting record with language-specific fields
        # Store action item lists as JSON strings in the database
        meeting_update = schemas.MeetingUpdate(
            summary_en=summary_en,
            summary_zh=summary_zh,
            action_items_en=action_items_en, # Schema expects List[str]
            action_items_zh=action_items_zh, # Schema expects List[str]
            status=models.MeetingStatus.COMPLETED # Final status
        )
        # The crud update function needs to handle converting the list to JSON string before saving
        crud.update_meeting(db, meeting_id, meeting_update) 

        # Return the English versions for potential immediate use (though currently unused by caller)
        return {"summary": summary_en, "action_items": action_items_en}

    except Exception as e:
        logger.error(f"Error during LangChain/Ollama summarization for meeting {meeting_id}: {e}", exc_info=True)
        crud.update_meeting_status(db, meeting_id, models.MeetingStatus.FAILED, error_message=f"Summarization failed: {e}")
        return None
