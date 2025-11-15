"""
Harvia API Routes
Endpoints for authentication and device management with Harvia Cloud API
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

from services.harvia_api import harvia_service, HarviaAPIError
from schemas import (
    AuthRequest,
    AuthResponse,
    TokenRefreshRequest,
    DevicesResponse,
    DeviceStateResponse,
    TelemetryResponse,
    DeviceCommandRequest,
    DeviceTargetRequest,
    ErrorResponse,
    Device,
)

router = APIRouter(prefix="/harvia", tags=["Harvia API"])

# Security scheme for Swagger UI
security = HTTPBearer()


def _handle_api_error(error: HarviaAPIError) -> JSONResponse:
    """Handle Harvia API errors and return appropriate response"""
    status_code = error.status_code or 500
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "error": error.message,
            "statusCode": status_code
        }
    )


@router.post("/auth/login", response_model=AuthResponse)
async def login(auth_request: AuthRequest):
    """
    Authenticate with Harvia API using username and password.
    
    Returns JWT tokens for accessing the Harvia API.
    The idToken should be included in the Authorization header for subsequent requests.
    Tokens expire after 1 hour and can be refreshed using the refresh endpoint.
    """
    print(f"🔐 DEBUG: Login attempt for username: {auth_request.username}")
    try:
        tokens = await harvia_service.authenticate(
            auth_request.username,
            auth_request.password
        )
        print(f"✅ DEBUG: Authentication successful")
        return AuthResponse(
            success=True,
            idToken=tokens["idToken"],
            accessToken=tokens["accessToken"],
            refreshToken=tokens.get("refreshToken"),
            expiresIn=tokens["expiresIn"]
        )
    except HarviaAPIError as e:
        print(f"❌ DEBUG: HarviaAPIError - Status: {e.status_code}, Message: {e.message}")
        return _handle_api_error(e)
    except Exception as e:
        print(f"❌ DEBUG: Unexpected error: {type(e).__name__}: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": f"Internal server error: {str(e)}",
                "statusCode": 500
            }
        )


@router.post("/auth/refresh", response_model=AuthResponse)
async def refresh_token(refresh_request: TokenRefreshRequest):
    """
    Refresh authentication tokens using a refresh token.
    
    Use this endpoint when your ID token expires (after ~1 hour).
    Returns new ID and access tokens.
    """
    try:
        tokens = await harvia_service.refresh_token(
            refresh_request.refreshToken,
            refresh_request.email
        )
        return AuthResponse(
            success=True,
            idToken=tokens["idToken"],
            accessToken=tokens["accessToken"],
            refreshToken=None,  # Refresh tokens are not returned on refresh
            expiresIn=tokens["expiresIn"]
        )
    except HarviaAPIError as e:
        return _handle_api_error(e)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": f"Internal server error: {str(e)}",
                "statusCode": 500
            }
        )


@router.get("/devices", response_model=DevicesResponse)
async def get_devices(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get list of user's devices from Harvia API.
    
    Requires authentication token in the Authorization header.
    Click the 🔓 Authorize button at the top to enter your token.
    
    Note: You can use either idToken or accessToken - the endpoint will try both.
    """
    token = credentials.credentials
    print(f"🔑 DEBUG: Received token (first 30 chars): {token[:30]}...")
    
    try:
        print(f"🔍 DEBUG: Attempting to fetch devices...")
        devices_data = await harvia_service.get_devices(token)
        print(f"✅ DEBUG: Received devices data: {type(devices_data)}")

        print("devices_data", devices_data)
        
        # Parse devices data based on the actual API response structure
        # The actual structure may vary, so we handle different formats
        devices_list = []
        
        if isinstance(devices_data, dict):
            # If the response contains a 'devices' or 'data' key
            devices = devices_data.get("devices") or devices_data.get("data") or []
        elif isinstance(devices_data, list):
            devices = devices_data
        else:
            devices = []
        
        print(f"📊 DEBUG: Found {len(devices)} devices to process")
        
        # Convert to our Device schema and enhance with parsed attributes
        for device_data in devices:
            try:
                print(f"🔍 DEBUG: Raw device data: {device_data}")
                
                # Set id from name if not present
                if "id" not in device_data and "name" in device_data:
                    device_data["id"] = device_data["name"]
                
                # Handle displayName from GraphQL response (top-level field)
                if "displayName" in device_data and device_data["displayName"]:
                    print(f"✅ DEBUG: Found displayName at top level: {device_data['displayName']}")
                
                # Handle connection status from GraphQL (top-level field)
                if "connected" in device_data:
                    device_data["isConnected"] = device_data["connected"] if isinstance(device_data["connected"], bool) else device_data["connected"].lower() == "true"
                
                # Handle timestamps from GraphQL (top-level fields)
                timestamp_fields = ["lastActivity", "lastConnectionTime", "lastSeen", "updatedAt", "createdAt"]
                if not device_data.get("lastSeen"):
                    for field in timestamp_fields:
                        if field in device_data and device_data[field]:
                            device_data["lastSeen"] = device_data[field]
                            print(f"✅ DEBUG: Using {field} as lastSeen: {device_data[field]}")
                            break
                
                # Parse attr array to extract useful fields (for REST API responses)
                if "attr" in device_data and isinstance(device_data["attr"], list):
                    attrs = {item["key"]: item["value"] for item in device_data["attr"] if "key" in item and "value" in item}
                    print(f"📋 DEBUG: Parsed attributes for {device_data.get('name')}: {attrs}")
                    
                    # Extract display name from attrs if not already set
                    if not device_data.get("displayName"):
                        # Try different name fields in priority order
                        name_fields = ["displayName", "alias", "name", "serialNumber", "deviceName"]
                        for field in name_fields:
                            if field in attrs and attrs[field]:
                                device_data["displayName"] = attrs[field]
                                print(f"✅ DEBUG: Using {field} as displayName: {attrs[field]}")
                                break
                    
                    # Extract connection status from attrs if not already set
                    if "isConnected" not in device_data and "connected" in attrs:
                        device_data["isConnected"] = attrs["connected"].lower() == "true"
                    
                    # Extract timestamps from attrs if not already set
                    if not device_data.get("lastSeen"):
                        for field in timestamp_fields:
                            if field in attrs and attrs[field]:
                                device_data["lastSeen"] = attrs[field]
                                break
                
                device = Device(**device_data)
                devices_list.append(device)
            except Exception as e:
                # If parsing fails, log but continue
                print(f"⚠️ Warning: Could not parse device data: {e}")
                print(f"   Raw data was: {device_data}")
                continue
        

        
        return DevicesResponse(
            success=True,
            devices=devices_list,
            count=len(devices_list)
        )
    except HarviaAPIError as e:
        print(f"❌ DEBUG: Harvia API Error: {e.message} (status: {e.status_code})")
        return _handle_api_error(e)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": f"Internal server error: {str(e)}",
                "statusCode": 500
            }
        )


@router.get("/devices/{device_id}/state", response_model=DeviceStateResponse)
async def get_device_state(
    device_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get device state (shadow) from Harvia API.
    
    Requires authentication token. Use the 🔓 Authorize button at the top.
    """
    id_token = credentials.credentials
    
    try:
        state_data = await harvia_service.get_device_state(id_token, device_id)
        return DeviceStateResponse(
            success=True,
            deviceId=device_id,
            state=state_data
        )
    except HarviaAPIError as e:
        return _handle_api_error(e)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": f"Internal server error: {str(e)}",
                "statusCode": 500
            }
        )


@router.get("/devices/{device_id}/telemetry", response_model=TelemetryResponse)
async def get_device_telemetry(
    device_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get latest telemetry data for a device.
    
    Requires authentication token. Use the 🔓 Authorize button at the top.
    """
    id_token = credentials.credentials
    
    try:
        telemetry_data = await harvia_service.get_latest_telemetry(id_token, device_id)
        return TelemetryResponse(
            success=True,
            deviceId=device_id,
            data=telemetry_data
        )
    except HarviaAPIError as e:
        return _handle_api_error(e)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": f"Internal server error: {str(e)}",
                "statusCode": 500
            }
        )


@router.post("/devices/command")
async def send_device_command(
    command_request: DeviceCommandRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Send a command to a device.
    
    Requires authentication token. Use the 🔓 Authorize button at the top.
    """
    id_token = credentials.credentials
    
    try:
        result = await harvia_service.send_device_command(
            id_token,
            command_request.deviceId,
            command_request.command,
            command_request.parameters
        )
        return {
            "success": True,
            "data": result
        }
    except HarviaAPIError as e:
        return _handle_api_error(e)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": f"Internal server error: {str(e)}",
                "statusCode": 500
            }
        )


@router.patch("/devices/target")
async def set_device_target(
    target_request: DeviceTargetRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Set target temperature and/or humidity for a device.
    
    Requires authentication token. Use the 🔓 Authorize button at the top.
    """
    id_token = credentials.credentials
    
    try:
        result = await harvia_service.set_device_target(
            id_token,
            target_request.deviceId,
            target_request.temperature,
            target_request.humidity
        )
        return {
            "success": True,
            "data": result
        }
    except HarviaAPIError as e:
        return _handle_api_error(e)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": f"Internal server error: {str(e)}",
                "statusCode": 500
            }
        )

