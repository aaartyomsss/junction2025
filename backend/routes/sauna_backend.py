from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Query
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field

router = APIRouter(prefix="/api/v1", tags=["Sauna Backend"])


def _timestamp(minutes_ago: int = 0) -> datetime:
    """Return a UTC timestamp helper."""
    return datetime.now(timezone.utc) - timedelta(minutes=minutes_ago)


devices: List[Dict[str, Any]] = [
    {
        "id": "junction-sauna-1",
        "name": "Junction Main Sauna",
        "type": "smart_sensor",
        "isConnected": True,
        "batteryLevel": 87,
        "signalStrength": 95,
        "lastSeen": _timestamp(),
        "location": {
            "name": "Junction Venue - Hall A",
            "latitude": 60.1695,
            "longitude": 24.9354,
        },
        "currentReading": {
            "temperature": 82.5,
            "humidity": 18.3,
            "timestamp": _timestamp(),
            "heating": True,
            "targetTemp": 85.0,
        },
    },
    {
        "id": "junction-sauna-2",
        "name": "Junction Wellness Sauna",
        "type": "smart_sensor",
        "isConnected": True,
        "batteryLevel": 92,
        "signalStrength": 88,
        "lastSeen": _timestamp(5),
        "location": {
            "name": "Junction Venue - Hall B",
            "latitude": 60.1699,
            "longitude": 24.9358,
        },
        "currentReading": {
            "temperature": 78.0,
            "humidity": 16.5,
            "timestamp": _timestamp(),
            "heating": False,
            "targetTemp": 80.0,
        },
    },
    {
        "id": "junction-sauna-3",
        "name": "Junction Relaxation Sauna",
        "type": "smart_sensor",
        "isConnected": True,
        "batteryLevel": 78,
        "signalStrength": 91,
        "lastSeen": _timestamp(2),
        "location": {
            "name": "Junction Venue - Hall C",
            "latitude": 60.1693,
            "longitude": 24.9351,
        },
        "currentReading": {
            "temperature": 85.2,
            "humidity": 20.1,
            "timestamp": _timestamp(),
            "heating": True,
            "targetTemp": 90.0,
        },
    },
    {
        "id": "junction-sauna-4",
        "name": "Junction Recovery Sauna",
        "type": "smart_sensor",
        "isConnected": False,
        "batteryLevel": 15,
        "signalStrength": 42,
        "lastSeen": _timestamp(30),
        "location": {
            "name": "Junction Venue - Hall D",
            "latitude": 60.1697,
            "longitude": 24.9356,
        },
        "currentReading": None,
    },
    {
        "id": "harvia-booth-demo-1",
        "name": "Harvia Booth Demo - Fenix",
        "type": "fenix",
        "isConnected": True,
        "batteryLevel": 100,
        "signalStrength": 98,
        "lastSeen": _timestamp(),
        "location": {
            "name": "Harvia Booth - Demo Area 1",
            "latitude": 60.17,
            "longitude": 24.936,
        },
        "currentReading": {
            "temperature": 75.0,
            "humidity": 15.0,
            "timestamp": _timestamp(),
            "heating": True,
            "targetTemp": 85.0,
        },
    },
    {
        "id": "harvia-booth-demo-2",
        "name": "Harvia Booth Demo - Mini",
        "type": "fenix",
        "isConnected": True,
        "batteryLevel": 100,
        "signalStrength": 97,
        "lastSeen": _timestamp(),
        "location": {
            "name": "Harvia Booth - Demo Area 2",
            "latitude": 60.1702,
            "longitude": 24.9362,
        },
        "currentReading": {
            "temperature": 88.5,
            "humidity": 22.3,
            "timestamp": _timestamp(),
            "heating": False,
            "targetTemp": 85.0,
        },
    },
]

users: List[Dict[str, str]] = [
    {"id": "1", "name": "John Doe", "email": "john@example.com"},
    {"id": "2", "name": "Jane Smith", "email": "jane@example.com"},
]


class TargetUpdate(BaseModel):
    targetTemp: float = Field(
        ...,
        ge=60,
        le=100,
        description="Desired target temperature for the sauna",
    )


class UserPayload(BaseModel):
    id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)
    email: EmailStr


class UserUpdate(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr


def _find_device(device_id: str) -> Optional[Dict[str, Any]]:
    return next((device for device in devices if device["id"] == device_id), None)


def _calculate_device_stats() -> Dict[str, float]:
    connected = 0
    temperatures: List[float] = []

    for device in devices:
        if device["isConnected"]:
            connected += 1
        reading = device.get("currentReading")
        if reading:
            temperatures.append(reading["temperature"])

    avg_temp = sum(temperatures) / len(temperatures) if temperatures else 0.0
    max_temp = max(temperatures) if temperatures else 0.0
    min_temp = min(temperatures) if temperatures else 0.0

    return {
        "totalDevices": len(devices),
        "connectedDevices": connected,
        "averageTemp": round(avg_temp, 2),
        "maxTemp": round(max_temp, 2),
        "minTemp": round(min_temp, 2),
    }


@router.get("/ping")
async def ping():
    """Simple ping endpoint compatible with the original Go backend."""
    return {"message": "pong"}


@router.get("/devices")
async def list_devices(device_type: Optional[str] = Query(None, alias="type")):
    """Return all devices, optionally filtered by type."""
    filtered = (
        [device for device in devices if device["type"] == device_type]
        if device_type
        else devices
    )

    return {
        "success": True,
        "count": len(filtered),
        "data": jsonable_encoder(filtered),
    }


@router.get("/devices/stats")
async def get_device_stats():
    data = _calculate_device_stats()
    return {"success": True, "data": data}


@router.get("/devices/{device_id}")
async def get_device(device_id: str):
    device = _find_device(device_id)
    if not device:
        return JSONResponse(
            status_code=404,
            content={"success": False, "error": "Device not found"},
        )

    return {"success": True, "data": jsonable_encoder(device)}


@router.get("/devices/{device_id}/reading")
async def get_device_reading(device_id: str):
    device = _find_device(device_id)
    if not device:
        return JSONResponse(
            status_code=404,
            content={"success": False, "error": "Device not found"},
        )

    reading = device.get("currentReading")
    if not reading:
        return {
            "success": False,
            "error": "Device is offline or has no readings",
        }

    return {"success": True, "data": jsonable_encoder(reading)}


@router.put("/devices/{device_id}/target")
async def update_device_target(device_id: str, payload: TargetUpdate):
    device = _find_device(device_id)
    if not device:
        return JSONResponse(
            status_code=404,
            content={"success": False, "error": "Device not found"},
        )

    reading = device.get("currentReading")
    if not reading:
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": "Device has no readings available"},
        )

    reading["targetTemp"] = payload.targetTemp
    reading["heating"] = reading["temperature"] < payload.targetTemp

    return {
        "success": True,
        "message": "Target temperature updated",
        "data": jsonable_encoder(device),
    }


@router.get("/users")
async def list_users():
    return {"data": users}


@router.get("/users/{user_id}")
async def get_user(user_id: str):
    for user in users:
        if user["id"] == user_id:
            return {"data": user}

    return JSONResponse(status_code=404, content={"error": "User not found"})


@router.post("/users", status_code=201)
async def create_user(user: UserPayload):
    payload = user.model_dump()
    users.append(payload)
    return {"data": payload}


@router.put("/users/{user_id}")
async def update_user(user_id: str, update: UserUpdate):
    for index, user in enumerate(users):
        if user["id"] == user_id:
            users[index] = {"id": user_id, **update.model_dump()}
            return {"data": users[index]}

    return JSONResponse(status_code=404, content={"error": "User not found"})


@router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    for index, user in enumerate(users):
        if user["id"] == user_id:
            users.pop(index)
            return {"message": "User deleted successfully"}

    return JSONResponse(status_code=404, content={"error": "User not found"})



