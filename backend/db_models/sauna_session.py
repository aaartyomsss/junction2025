from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class SaunaSession(SQLModel, table=True):
    """
    Sauna Session model
    
    Records sauna sessions with temperature data and duration.
    Tracks user activity and optionally links to a specific sauna location.
    """
    __tablename__ = "sauna_sessions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Session metrics
    duration_seconds: int = Field(ge=0, description="Length of the session in seconds")
    average_temperature: float = Field(description="Average temperature during the session in Celsius")
    max_temperature: float = Field(description="Maximum temperature reached during the session in Celsius")
    
    # Relationships
    user_id: int = Field(foreign_key="users.id", index=True, description="User who recorded this session")
    sauna_id: Optional[int] = Field(default=None, foreign_key="saunas.id", index=True, description="Sauna where session was recorded (optional)")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "duration_seconds": 1800,
                "average_temperature": 75.5,
                "max_temperature": 85.0,
                "user_id": 1,
                "sauna_id": 1
            }
        }
