import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Enum
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
    transcript = Column(Text, nullable=True) # Full transcript text
    summary = Column(Text, nullable=True) # Generated summary
    action_items = Column(Text, nullable=True) # Generated action items (e.g., as JSON string or simple text list)
    error_message = Column(String, nullable=True) # Store error if processing fails

    # Add other fields if needed, e.g.:
    # duration = Column(Float, nullable=True)
    # language = Column(String, nullable=True)

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
