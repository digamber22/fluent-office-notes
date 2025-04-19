from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Create the SQLAlchemy engine
# For SQLite, connect_args is needed to allow usage in multiple threads (FastAPI runs requests in threads)
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} # Only needed for SQLite
)

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a base class for declarative class definitions
Base = declarative_base()

# Dependency to get DB session
def get_db():
    """
    FastAPI dependency that provides a SQLAlchemy database session.
    Ensures the session is closed after the request is finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to create database tables (call this on startup if needed)
# We might call this manually or use Alembic for migrations later
def create_database_tables():
    """
    Creates all database tables defined by models inheriting from Base.
    """
    # Import models here to ensure they are registered with Base
    # from . import models # Uncomment when models.py exists
    Base.metadata.create_all(bind=engine)
