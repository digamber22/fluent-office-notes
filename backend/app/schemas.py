import datetime
from pydantic import BaseModel, ConfigDict, Field # Import Field
from typing import Optional, List
from .models import MeetingStatus # Import the enum from models

# --- Meeting Schemas ---

class MeetingBase(BaseModel):
    """
    Base schema for Meeting, containing common fields.
    """
    filename: Optional[str] = None
    audio_file_path: Optional[str] = None 
    transcript: Optional[str] = None # Original transcript
    detected_language: Optional[str] = None # e.g., 'en', 'zh', 'es'
    
    # Language-specific fields
    summary_en: Optional[str] = None
    summary_zh: Optional[str] = None
    action_items_en: Optional[List[str]] = Field(default_factory=list) # Default to empty list
    action_items_zh: Optional[List[str]] = Field(default_factory=list) # Default to empty list
    
    status: MeetingStatus = MeetingStatus.PENDING
    error_message: Optional[str] = None
    
    # Remove old generic fields if replaced by language-specific ones
    # summary: Optional[str] = None 
    # action_items: Optional[str] = None 

class MeetingCreate(BaseModel):
    """
    Schema used when creating a new meeting record via upload.
    Initially, we only need the filename. Other fields are populated during processing.
    """
    filename: str

class MeetingUpdate(MeetingBase):
    """
    Schema for updating an existing meeting record.
    Allows updating status, transcript, summary, etc. after processing.
    """
    pass # Inherits all fields from MeetingBase, all are optional

class Meeting(MeetingBase):
    """
    Schema for representing a Meeting in API responses.
    Includes fields that should be returned to the client.
    """
    id: int
    upload_time: datetime.datetime

    # Pydantic V2 uses model_config instead of Config class
    model_config = ConfigDict(
        from_attributes=True # Enable ORM mode to map SQLAlchemy models
    )

# --- Upload Response Schema ---

class UploadResponse(BaseModel):
    """
    Schema for the response after uploading an audio file.
    Matches the structure expected by the frontend mock API.
    """
    success: bool
    meetingId: Optional[str] = None # Use str to match frontend mock
    error: Optional[str] = None

# --- Search Schema (Optional - for future use) ---
# class SearchQuery(BaseModel):
#     query: str

# class SearchResult(BaseModel):
#     meeting_id: int
#     filename: str
#     context: str # Snippet of text where the keyword was found
