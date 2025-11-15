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
                
                # Set id from name if not present (for REST API responses where name is the device ID)
                if "id" not in device_data and "name" in device_data:
                    device_data["id"] = device_data["name"]
                    print(f"📝 DEBUG: Set id from name field: {device_data['id']}")
                
                # Set name from id if not present (GraphQL responses use id, not name)
                if "name" not in device_data and "id" in device_data:
                    device_data["name"] = device_data["id"]
                    print(f"📝 DEBUG: Set name from id field: {device_data['name']}")
                
                # Handle displayName from GraphQL response (top-level field) - rare but possible
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
                    print(f"📋 DEBUG: Parsed attributes for device {device_data.get('id') or device_data.get('name')}: {attrs}")
                    print(f"📋 DEBUG: All attr keys available: {list(attrs.keys())}")
                    
                    # Extract display name from attrs if not already set
                    # The display name is typically in the attr array with key "name"
                    # But we need to distinguish it from the device ID/name field
                    if not device_data.get("displayName"):
                        # Try different name fields in priority order
                        # "name" in attr array is typically the user-friendly display name
                        # We want to avoid using serial numbers or device IDs
                        name_fields = ["name", "displayName", "alias", "deviceName"]
                        for field in name_fields:
                            if field in attrs and attrs[field]:
                                attr_value = attrs[field]
                                # Skip if it looks like a serial number or device ID (contains dashes/underscores and is long)
                                if len(attr_value) > 20 and ('-' in attr_value or '_' in attr_value):
                                    print(f"⚠️ DEBUG: Skipping {field}='{attr_value}' as it looks like a device ID/serial")
                                    continue
                                device_data["displayName"] = attr_value
                                print(f"✅ DEBUG: Using attr['{field}']='{attr_value}' as displayName")
                                break
                        
                        # If we still don't have a displayName, create a user-friendly name from available data
                        # Note: The official Harvia dashboard shows names like "HypeMen", "MiniSaunaFenx"
                        # These are likely set via devicesUpdate mutation, but for now we'll create reasonable fallbacks
                        if not device_data.get("displayName"):
                            device_type = device_data.get("type", "Device")
                            city = attrs.get("city")
                            serial = attrs.get("serialNumber")
                            organization = attrs.get("organization", "")
                            
                            # Try to create a meaningful name
                            # Priority: Use city if available (most user-friendly)
                            if city:
                                # Format: "DeviceType City" (e.g., "Fenix Espoo")
                                device_data["displayName"] = f"{device_type} {city}"
                                print(f"✅ DEBUG: Created displayName from type and city: {device_data['displayName']}")
                            elif serial and len(serial) < 15 and not serial.startswith("simulated"):
                                # Only use serial if it's short and not a simulated device
                                # Format: "DeviceType Serial" (e.g., "SaunaSensor 25454C0021")
                                device_data["displayName"] = f"{device_type} {serial}"
                                print(f"✅ DEBUG: Created displayName from type and serial: {device_data['displayName']}")
                            else:
                                # Fallback: Use device type with a short ID suffix
                                short_id = device_data.get("id", "")[-8:] if device_data.get("id") else ""
                                if short_id:
                                    device_data["displayName"] = f"{device_type} {short_id}"
                                else:
                                    device_data["displayName"] = device_type
                                print(f"✅ DEBUG: Created displayName fallback: {device_data['displayName']}")
                    
                    # Extract connection status from attrs if not already set
                    if "isConnected" not in device_data and "connected" in attrs:
                        device_data["isConnected"] = attrs["connected"].lower() == "true"
                    
                    # Extract timestamps from attrs if not already set
                    if not device_data.get("lastSeen"):
                        for field in timestamp_fields:
                            if field in attrs and attrs[field]:
                                device_data["lastSeen"] = attrs[field]
                                break
                    
                    # Extract location information
                    if not device_data.get("location"):
                        location_data = {}
                        # Try to get location name from city or location attribute
                        if attrs.get("city"):
                            location_data["name"] = attrs["city"]
                        elif attrs.get("location"):
                            location_data["name"] = attrs["location"]
                        elif attrs.get("country"):
                            location_data["name"] = attrs["country"]
                        
                        # Extract coordinates - try GPS first, then WiFi-based as fallback
                        latitude = None
                        longitude = None
                        
                        # Try GPS coordinates first
                        if attrs.get("latitude"):
                            try:
                                latitude = float(attrs["latitude"])
                            except (ValueError, TypeError):
                                pass
                        if attrs.get("longitude"):
                            try:
                                longitude = float(attrs["longitude"])
                            except (ValueError, TypeError):
                                pass
                        
                        # If GPS coordinates not available, try WiFi-based coordinates
                        if latitude is None and attrs.get("w_latitude"):
                            try:
                                latitude = float(attrs["w_latitude"])
                            except (ValueError, TypeError):
                                pass
                        if longitude is None and attrs.get("w_longitude"):
                            try:
                                longitude = float(attrs["w_longitude"])
                            except (ValueError, TypeError):
                                pass
                        
                        # If we have at least coordinates, create location object
                        if latitude is not None and longitude is not None:
                            location_data["latitude"] = latitude
                            location_data["longitude"] = longitude
                            if not location_data.get("name"):
                                # Use city, country, or default
                                if attrs.get("city"):
                                    location_data["name"] = attrs["city"]
                                elif attrs.get("country"):
                                    location_data["name"] = attrs["country"]
                                else:
                                    location_data["name"] = "Unknown Location"
                            device_data["location"] = location_data
                            print(f"✅ DEBUG: Extracted location: {location_data}")
                    
                    # Extract battery level if available
                    if "batteryLevel" not in device_data:
                        battery_fields = ["batteryLevel", "battery", "batteryPercent", "batteryPercentage"]
                        for field in battery_fields:
                            if field in attrs:
                                try:
                                    device_data["batteryLevel"] = float(attrs[field])
                                    print(f"✅ DEBUG: Found battery level: {device_data['batteryLevel']}")
                                    break
                                except (ValueError, TypeError):
                                    continue
                    
                    # Extract signal strength if available
                    if "signalStrength" not in device_data:
                        signal_fields = ["signalStrength", "signal", "rssi", "wifiSignal", "wifiRSSI"]
                        for field in signal_fields:
                            if field in attrs:
                                try:
                                    device_data["signalStrength"] = float(attrs[field])
                                    print(f"✅ DEBUG: Found signal strength: {device_data['signalStrength']}")
                                    break
                                except (ValueError, TypeError):
                                    continue
                    
                    # Extract additional useful metadata
                    # Store brand, serial number, organization, etc. as extra fields
                    if attrs.get("brand"):
                        device_data["brand"] = attrs["brand"]
                    if attrs.get("serialNumber"):
                        device_data["serialNumber"] = attrs["serialNumber"]
                    if attrs.get("organization"):
                        device_data["organization"] = attrs["organization"]
                    if attrs.get("country"):
                        device_data["country"] = attrs["country"]
                    if attrs.get("city"):
                        device_data["city"] = attrs["city"]
                    if attrs.get("espChip"):
                        device_data["espChip"] = attrs["espChip"]
                    if attrs.get("firmwareVersion"):
                        device_data["firmwareVersion"] = attrs["firmwareVersion"]
                
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
        
        # If it's a 401/403, provide helpful message about permissions
        if e.status_code in [401, 403]:
            return JSONResponse(
                status_code=e.status_code,
                content={
                    "success": False,
                    "error": "Hackathon account does not have permissions to access Harvia device endpoints. "
                             "The GraphQL and REST API endpoints require elevated permissions that are not available "
                             "in the hackathon/demo account. Please use mock devices or contact Harvia support for API access.",
                    "statusCode": e.status_code,
                    "suggestion": "Try using the mock devices endpoint at /api/v1/devices instead"
                }
            )
        
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


@router.patch("/devices/{device_id}/name")
async def update_device_name(
    device_id: str,
    display_name: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Update device display name using devicesUpdate mutation.
    
    Requires authentication token. Use the 🔓 Authorize button at the top.
    
    This will set the "name" attribute in the device's attr array, which will then
    be used as the display name in the UI.
    """
    id_token = credentials.credentials
    
    try:
        result = await harvia_service.update_device_name(id_token, device_id, display_name)
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "device": result,
                "message": f"Device name updated to '{display_name}'"
            }
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

