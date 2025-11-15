from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class Sauna(SQLModel, table=True):
    """
    Sauna model
    
    Represents a sauna location added by users to the platform.
    Includes location data, rating, and description.
    """
    __tablename__ = "saunas"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, max_length=255)
    latitude: float = Field(description="Latitude coordinate")
    longitude: float = Field(description="Longitude coordinate")
    rating: int = Field(ge=1, le=5, description="Rating from 1 to 5 stars")
    description: Optional[str] = Field(default=None, max_length=1000)
    
    # Foreign key to the user who added this sauna
    added_by_user_id: int = Field(foreign_key="users.id", index=True)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Junction Wellness Sauna",
                "latitude": 60.1695,
                "longitude": 24.9354,
                "rating": 5,
                "description": "Amazing traditional Finnish sauna with great atmosphere",
                "added_by_user_id": 1
            }
        }
