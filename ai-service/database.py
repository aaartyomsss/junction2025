from sqlmodel import SQLModel, create_engine, Session
from typing import Optional
import os

# Database URL - reads from environment variable or uses default
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user:password@localhost:5432/mydb"
)

# Create engine
# echo=True will log all SQL statements (useful for debugging)
engine = create_engine(DATABASE_URL, echo=True)


def create_db_and_tables():
    """Create all tables in the database"""
    SQLModel.metadata.create_all(engine)


def get_session():
    """Dependency to get database session"""
    with Session(engine) as session:
        yield session
