from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import create_database_tables, engine # Import engine if needed elsewhere, and the create function
from . import models # Import models to ensure they are registered with Base before creating tables

# Import the meetings router
from .routers import meetings

# Create database tables on startup
# Note: For production, Alembic migrations are recommended.
# This approach is simpler for local development/MVP.
models.Base.metadata.create_all(bind=engine)
# Alternatively, call the function: create_database_tables()


app = FastAPI(
    title="Fluent Office Notes API",
    description="API for the multilingual note-taking agent.",
    version="0.1.0",
)

# Configure CORS
origins = [
    "http://localhost:5173",  # Default Vite dev server port
    "http://localhost:3000",  # Common React dev server port
    # Add other origins if needed (e.g., production frontend URL)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Root"])
async def read_root():
    """
    Root endpoint to check if the API is running.
    """
    return {"message": "Welcome to the Fluent Office Notes API!"}

# Include the meetings router
app.include_router(meetings.router, prefix="/api")

# Add other app configurations or startup events if needed
# Example startup event:
# @app.on_event("startup")
# async def startup_event():
#     create_database_tables() # Call table creation here instead if preferred
