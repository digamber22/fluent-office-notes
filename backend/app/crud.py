from sqlalchemy.orm import Session
from . import models, schemas
from typing import List, Optional

# --- Meeting CRUD Operations ---

def get_meeting(db: Session, meeting_id: int) -> Optional[models.Meeting]:
    """
    Retrieve a single meeting by its ID.
    """
    return db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()

def get_meetings(db: Session, skip: int = 0, limit: int = 100) -> List[models.Meeting]:
    """
    Retrieve a list of meetings with pagination.
    """
    return db.query(models.Meeting).offset(skip).limit(limit).all()

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

def update_meeting(db: Session, meeting_id: int, meeting_update: schemas.MeetingUpdate) -> Optional[models.Meeting]:
    """
    Update an existing meeting record.
    Allows updating status, transcript, summary, action items, error message.
    """
    db_meeting = get_meeting(db, meeting_id)
    if db_meeting:
        update_data = meeting_update.model_dump(exclude_unset=True) # Get only provided fields
        for key, value in update_data.items():
            setattr(db_meeting, key, value)
        db.commit()
        db.refresh(db_meeting)
    return db_meeting

def update_meeting_status(db: Session, meeting_id: int, status: models.MeetingStatus, error_message: Optional[str] = None) -> Optional[models.Meeting]:
    """
    Helper function to specifically update the status and optional error message of a meeting.
    """
    db_meeting = get_meeting(db, meeting_id)
    if db_meeting:
        db_meeting.status = status
        db_meeting.error_message = error_message
        db.commit()
        db.refresh(db_meeting)
    return db_meeting


# Optional: Delete function if needed
# def delete_meeting(db: Session, meeting_id: int) -> Optional[models.Meeting]:
#     """
#     Delete a meeting record by its ID.
#     """
#     db_meeting = get_meeting(db, meeting_id)
#     if db_meeting:
#         db.delete(db_meeting)
#         db.commit()
#     return db_meeting

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
