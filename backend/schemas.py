from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any


# ============================================================================
# ML Model Schemas
# ============================================================================

class TrainRequest(BaseModel):
    """Request model for training ML models"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "X": [[1.0, 2.0], [2.0, 3.0], [3.0, 4.0], [4.0, 5.0]],
                "y": [0, 0, 1, 1]
            }
        }
    )
    
    X: List[List[float]] = Field(..., description="Training features (2D array)")
    y: List[int] = Field(..., description="Training labels (1D array)")


class PredictRequest(BaseModel):
    """Request model for making predictions"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "X": [[2.5, 3.5], [3.5, 4.5]]
            }
        }
    )
    
    X: List[List[float]] = Field(..., description="Features for prediction (2D array)")


class PredictResponse(BaseModel):
    """Response model for predictions"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "predictions": [0, 1],
                "model_type": "KNN"
            }
        }
    )
    
    predictions: List[int] = Field(..., description="Predicted class labels")
    model_type: str = Field(..., description="Type of model used")


class TrainResponse(BaseModel):
    """Response model for training"""
    message: str
    model_type: str
    samples_trained: int


# ============================================================================
# Harvia API Schemas
# ============================================================================

class AuthRequest(BaseModel):
    """Request model for authentication"""
    username: str = Field(..., description="User's username or email")
    password: str = Field(..., description="User's password")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "username": "user@example.com",
                "password": "your-password"
            }
        }
    }


class TokenRefreshRequest(BaseModel):
    """Request model for token refresh"""
    refreshToken: str = Field(..., description="Refresh token from initial authentication")
    email: str = Field(..., description="User's email")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "refreshToken": "eyJhbGci...",
                "email": "user@example.com"
            }
        }
    }


class AuthResponse(BaseModel):
    """Response model for authentication"""
    success: bool = Field(default=True, description="Whether authentication was successful")
    idToken: str = Field(..., description="JWT ID token for API access")
    accessToken: str = Field(..., description="Access token")
    refreshToken: Optional[str] = Field(None, description="Refresh token (only on initial auth)")
    expiresIn: int = Field(..., description="Token expiration time in seconds")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "success": True,
                "idToken": "eyJhbGci...",
                "accessToken": "eyJhbGci...",
                "refreshToken": "eyJhbGci...",
                "expiresIn": 3600
            }
        }
    }


class DeviceLocation(BaseModel):
    """Device location information"""
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class DeviceReading(BaseModel):
    """Current device reading"""
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    timestamp: Optional[str] = None
    heating: Optional[bool] = None
    targetTemp: Optional[float] = None


class Device(BaseModel):
    """Device information"""
    name: Optional[str] = None  # Harvia API uses 'name' as the device ID (optional, can use id instead)
    type: Optional[str] = None
    attr: Optional[List[Dict[str, str]]] = None  # Harvia uses attr array for properties
    
    # Computed/optional fields for compatibility
    id: Optional[str] = None
    displayName: Optional[str] = None  # User-friendly display name
    isConnected: Optional[bool] = None
    batteryLevel: Optional[float] = None
    signalStrength: Optional[float] = None
    lastSeen: Optional[str] = None
    location: Optional[DeviceLocation] = None
    currentReading: Optional[DeviceReading] = None
    
    # Additional metadata fields
    brand: Optional[str] = None
    serialNumber: Optional[str] = None
    organization: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    espChip: Optional[str] = None
    firmwareVersion: Optional[str] = None
    
    class Config:
        # Allow extra fields that might come from API
        extra = "allow"


class DevicesResponse(BaseModel):
    """Response model for devices list"""
    success: bool = Field(default=True, description="Whether request was successful")
    devices: List[Device] = Field(default_factory=list, description="List of devices")
    count: Optional[int] = Field(None, description="Number of devices")


class DeviceStateResponse(BaseModel):
    """Response model for device state"""
    success: bool = Field(default=True, description="Whether request was successful")
    deviceId: str = Field(..., description="Device identifier")
    state: Dict[str, Any] = Field(..., description="Device state data")


class TelemetryResponse(BaseModel):
    """Response model for telemetry data"""
    success: bool = Field(default=True, description="Whether request was successful")
    deviceId: str = Field(..., description="Device identifier")
    data: Dict[str, Any] = Field(..., description="Telemetry data")


class DeviceCommandRequest(BaseModel):
    """Request model for device command"""
    deviceId: str = Field(..., description="Device identifier")
    command: str = Field(..., description="Command to send")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Optional command parameters")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "deviceId": "device-123",
                "command": "turn_on",
                "parameters": {"duration": 3600}
            }
        }
    }


class DeviceTargetRequest(BaseModel):
    """Request model for setting device target"""
    deviceId: str = Field(..., description="Device identifier")
    temperature: Optional[float] = Field(None, description="Target temperature", ge=0, le=120)
    humidity: Optional[float] = Field(None, description="Target humidity", ge=0, le=100)
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "deviceId": "device-123",
                "temperature": 85.0,
                "humidity": 20.0
            }
        }
    }


class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool = Field(default=False, description="Always false for errors")
    error: str = Field(..., description="Error message")
    statusCode: Optional[int] = Field(None, description="HTTP status code")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "success": False,
                "error": "Authentication failed",
                "statusCode": 401
            }
        }
    }
