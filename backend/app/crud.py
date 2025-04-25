import os 
import logging 
import json # Import json for serialization
from sqlalchemy.orm import Session
from . import models, schemas
from typing import List, Optional

# Configure logging for this module
logger = logging.getLogger(__name__)

# --- Meeting CRUD Operations ---

# _parse_action_items removed - TypeDecorator handles this now

def get_meeting(db: Session, meeting_id: int) -> Optional[models.Meeting]:
    """
    Retrieve a single meeting by its ID. TypeDecorator handles JSON parsing.
    """
    db_meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    # No need to call _parse_action_items
    return db_meeting


def get_meetings(db: Session, skip: int = 0, limit: int = 100) -> List[models.Meeting]:
    """
    Retrieve a list of meetings with pagination. TypeDecorator handles JSON parsing.
    """
    db_meetings = db.query(models.Meeting).offset(skip).limit(limit).all()
    # No need to call _parse_action_items
    return db_meetings

def create_meeting(db: Session, meeting: schemas.MeetingCreate) -> models.Meeting:
    """
    Create a new meeting record in the database.
    Initial status is typically PENDING.
    """
    db_meeting = models.Meeting(
        filename=meeting.filename,
        status=models.MeetingStatus.PENDING # Default status on creation
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting


def delete_meeting(db: Session, meeting_id: int) -> bool:
    """
    Deletes a meeting record from the database and its associated audio file.
    Returns True if deletion was successful, False otherwise.
    """
    db_meeting = get_meeting(db, meeting_id=meeting_id)
    if not db_meeting:
        return False # Meeting not found

    audio_path = db_meeting.audio_file_path

    try:
        # Delete the database record first
        db.delete(db_meeting)
        db.commit()
        logger.info(f"Deleted meeting record {meeting_id} from database.")

        # If DB deletion is successful, attempt to delete the audio file
        if audio_path and os.path.exists(audio_path):
            try:
                os.remove(audio_path)
                logger.info(f"Deleted associated audio file: {audio_path}")
            except OSError as e:
                # Log the error but consider the DB deletion successful
                logger.error(f"Error deleting audio file {audio_path} for meeting {meeting_id}: {e}", exc_info=True)
                # Depending on requirements, you might want to return False here
                # or have a separate mechanism for orphaned file cleanup.

        return True # Indicate successful deletion of the DB record

    except Exception as e:
        db.rollback() # Rollback DB changes if any error occurs
        logger.error(f"Error deleting meeting {meeting_id} from database: {e}", exc_info=True)
        return False

def update_meeting(db: Session, meeting_id: int, meeting_update: schemas.MeetingUpdate) -> Optional[models.Meeting]:
    """
    Update an existing meeting record.
    Handles serialization of action item lists to JSON strings.
    """
    db_meeting = get_meeting(db, meeting_id)
    if db_meeting:
        update_data = meeting_update.model_dump(exclude_unset=True) 
        
        # No need for manual JSON serialization here - TypeDecorator handles it
            
        for key, value in update_data.items():
            # The TypeDecorator will handle action_items_en/zh automatically
            setattr(db_meeting, key, value) 
            
        db.commit()
        db.refresh(db_meeting)
    return db_meeting

def update_meeting_status(db: Session, meeting_id: int, status: models.MeetingStatus, error_message: Optional[str] = None) -> Optional[models.Meeting]:
    """
    Helper function to specifically update the status and optional error message of a meeting,
    avoiding issues with flushing other potentially unsaved list attributes.
    """
    try:
        # Perform a targeted update query
        update_values = {"status": status}
        if error_message is not None: # Only include error_message if provided
             update_values["error_message"] = error_message
             
        result = db.query(models.Meeting)\
                   .filter(models.Meeting.id == meeting_id)\
                   .update(update_values, synchronize_session=False) # synchronize_session=False is often safer for targeted updates
                   
        if result == 0: # Check if any row was updated
             logger.warning(f"Meeting status update failed: No meeting found with ID {meeting_id}")
             return None
             
        db.commit()
        # Fetch the updated meeting to return it (optional, but good practice)
        # get_meeting no longer needs parsing, TypeDecorator handles it
        return get_meeting(db, meeting_id) 
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating meeting status for ID {meeting_id}: {e}", exc_info=True)
        return None

# --- Search Functionality (Basic Example) ---

def search_transcripts(db: Session, query: str, limit: int = 10) -> List[models.Meeting]:
    """
    Basic search within the transcript field using SQL LIKE.
    Returns meetings where the transcript contains the query string.
    Note: This is case-sensitive by default in SQLite unless configured otherwise.
          For more advanced search, consider full-text search extensions or dedicated search engines.
    """
    search_pattern = f"%{query}%"
    return db.query(models.Meeting)\
             .filter(models.Meeting.transcript.like(search_pattern))\
             .limit(limit)\
             .all()
