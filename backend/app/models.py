import datetime
import json # Import json
from sqlalchemy import Column, Integer, String, DateTime, Text, Enum, TypeDecorator
from sqlalchemy.types import TEXT # Use TEXT explicitly for SQLite compatibility
from .database import Base
import enum

class MeetingStatus(str, enum.Enum):
    """
    Enum for the status of meeting processing.
    """
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

# Custom TypeDecorator for JSON-encoded lists
class JsonEncodedList(TypeDecorator):
    """Stores and retrieves Python lists as JSON strings in the database."""
    impl = TEXT # Use TEXT for SQLite compatibility
    cache_ok = True # Indicate that the type is cacheable

    def process_bind_param(self, value, dialect):
        if value is None:
            # Store None as SQL NULL, or '[]' if you prefer empty list default
            return None 
            # return '[]' 
        if not isinstance(value, list):
             raise TypeError("Value must be a list to store in JsonEncodedList")
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if value is None:
            # Return None if SQL NULL, or [] if you prefer empty list default
            return None
            # return [] 
        try:
            result = json.loads(value)
            if not isinstance(result, list):
                 # Handle cases where DB stores non-list JSON (e.g., "null")
                 # Depending on requirements, return [], None, or raise error
                 # For simplicity, let's return an empty list if it's not a list
                 return [] 
            return result
        except json.JSONDecodeError:
            # Handle cases where the stored value is not valid JSON
            # Return empty list or raise an error based on requirements
            return [] # Default to empty list on decode error

class Meeting(Base):
    """
    SQLAlchemy model representing a meeting record.
    """
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True) # Original filename of the uploaded audio
    audio_file_path = Column(String, nullable=True) # Path where the audio file is stored locally
    upload_time = Column(DateTime, default=datetime.datetime.utcnow)
    # Ensure default matches the new uppercase enum value
    status = Column(Enum(MeetingStatus), default=MeetingStatus.PENDING, nullable=False)
    transcript = Column(Text, nullable=True) # Original transcript text
    detected_language = Column(String, nullable=True) # Detected language code

    # Language-specific fields
    summary_en = Column(Text, nullable=True)
    summary_zh = Column(Text, nullable=True)
    # Use the custom type decorator
    action_items_en = Column(JsonEncodedList, nullable=True) # Let TypeDecorator handle default/None
    action_items_zh = Column(JsonEncodedList, nullable=True) # Let TypeDecorator handle default/None

    error_message = Column(String, nullable=True) # Store error if processing fails

    # Remove old generic fields if replaced
    # summary = Column(Text, nullable=True) 
    # action_items = Column(Text, nullable=True) 

    # Add other fields if needed, e.g.:
    # duration = Column(Float, nullable=True)

# If we need more granular transcript data later, we could add:
# class TranscriptSegment(Base):
#     __tablename__ = "transcript_segments"
#     id = Column(Integer, primary_key=True, index=True)
#     meeting_id = Column(Integer, ForeignKey("meetings.id"))
#     start_time = Column(Float)
#     end_time = Column(Float)
#     text = Column(Text)
#     speaker = Column(String, nullable=True) # Optional speaker label
#     meeting = relationship("Meeting", back_populates="segments")

# If using TranscriptSegment, add relationship to Meeting:
# Meeting.segments = relationship("TranscriptSegment", back_populates="meeting", cascade="all, delete-orphan")
