import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file in the backend directory
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=dotenv_path)

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    DATABASE_URL: str = "sqlite:///./default.db" # Default fallback
    UPLOAD_DIR: str = "uploads" # Directory to store uploaded audio files relative to backend root

    # NeMo ASR settings
    NEMO_ASR_MODEL: str = "QuartzNet15x5Base-En" # Example pre-trained NeMo model

    # Ollama settings
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "deepseek-r1:1.5b" # Changed default model

    # Add other settings if needed

    class Config:
        env_file = dotenv_path
        env_file_encoding = 'utf-8'
        extra = 'ignore' # Ignore extra fields from env file

# Create a single instance of the settings
settings = Settings()

# You can access settings like this:
# from .config import settings
# db_url = settings.DATABASE_URL
