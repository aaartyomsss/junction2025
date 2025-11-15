from sqlmodel import SQLModel, create_engine, Session
from typing import Optional
import os
import logging

logger = logging.getLogger(__name__)

# Database URL - reads from environment variable or uses default
# Note: Using port 5433 to avoid conflict with local PostgreSQL service on 5433
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user:password@127.0.0.1:5433/mydb"
)

# Create engine
# echo=True will log all SQL statements (useful for debugging)
engine = create_engine(DATABASE_URL, echo=True)


def create_db_and_tables():
    """Create all tables in the database. Returns True if successful, False otherwise."""
    try:
        SQLModel.metadata.create_all(engine)
        logger.info("Database tables created successfully")
        return True
    except Exception as e:
        logger.warning(f"Database initialization skipped: {e}")
        logger.info("App will continue without database. /api/v1 endpoints work without DB.")
        return False


def get_session():
    """Dependency to get database session"""
    with Session(engine) as session:
        yield session
