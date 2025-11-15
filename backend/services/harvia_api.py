"""
Harvia API Service
Handles authentication and device operations with the Harvia Cloud API
"""

import httpx
from typing import Dict, Any, Optional
from datetime import datetime, timedelta


class HarviaAPIError(Exception):
    """Custom exception for Harvia API errors"""
    def __init__(self, message: str, status_code: Optional[int] = None):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class HarviaAPIService:
    """Service for interacting with Harvia Cloud API"""
    
    ENDPOINTS_URL = "https://prod.api.harvia.io/endpoints"
    
    def __init__(self):
        self.endpoints_config: Optional[Dict[str, Any]] = None
        self.config_fetched_at: Optional[datetime] = None
    
    async def _get_api_configuration(self) -> Dict[str, Any]:
        """
        Fetch API configuration from Harvia endpoints.
        Caches the configuration for 1 hour to reduce unnecessary requests.
        """
        # Return cached config if less than 1 hour old
        if (
            self.endpoints_config 
            and self.config_fetched_at 
            and datetime.now() - self.config_fetched_at < timedelta(hours=1)
        ):
            return self.endpoints_config
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(self.ENDPOINTS_URL)
                response.raise_for_status()
                
                data = response.json()
                self.endpoints_config = data.get("endpoints", {})
                self.config_fetched_at = datetime.now()
                
                return self.endpoints_config
        except httpx.HTTPError as e:
            raise HarviaAPIError(f"Failed to fetch API configuration: {str(e)}")
    
    async def authenticate(self, username: str, password: str) -> Dict[str, Any]:
        """
        Authenticate with Harvia API using username and password.
        Returns tokens including idToken, accessToken, refreshToken, and expiresIn.
        
        Args:
            username: User's username/email
            password: User's password
        
        Returns:
            Dict containing tokens and expiration info
        
        Raises:
            HarviaAPIError: If authentication fails
        """
        try:
            # Get API configuration
            config = await self._get_api_configuration()
            rest_api_base = config.get("RestApi", {}).get("generics", {}).get("https")
            
            if not rest_api_base:
                raise HarviaAPIError("REST API endpoint not found in configuration")
            
            # Authenticate with Harvia API
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{rest_api_base}/auth/token",
                    headers={"Content-Type": "application/json"},
                    json={"username": username, "password": password}
                )
                
                if response.status_code != 200:
                    error_data = response.json() if response.text else {}
                    error_message = error_data.get("message", "Authentication failed")
                    raise HarviaAPIError(error_message, response.status_code)
                
                tokens = response.json()
                return {
                    "idToken": tokens.get("idToken"),
                    "accessToken": tokens.get("accessToken"),
                    "refreshToken": tokens.get("refreshToken"),
                    "expiresIn": tokens.get("expiresIn", 3600),
                }
        except httpx.HTTPError as e:
            raise HarviaAPIError(f"Authentication request failed: {str(e)}")
    
    async def refresh_token(self, refresh_token: str, email: str) -> Dict[str, Any]:
        """
        Refresh authentication tokens using a refresh token.
        
        Args:
            refresh_token: The refresh token from initial authentication
            email: User's email
        
        Returns:
            Dict containing new tokens
        
        Raises:
            HarviaAPIError: If token refresh fails
        """
        try:
            config = await self._get_api_configuration()
            rest_api_base = config.get("RestApi", {}).get("generics", {}).get("https")
            
            if not rest_api_base:
                raise HarviaAPIError("REST API endpoint not found in configuration")
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{rest_api_base}/auth/refresh",
                    headers={"Content-Type": "application/json"},
                    json={"refreshToken": refresh_token, "email": email}
                )
                
                if response.status_code != 200:
                    error_data = response.json() if response.text else {}
                    error_message = error_data.get("message", "Token refresh failed")
                    raise HarviaAPIError(error_message, response.status_code)
                
                tokens = response.json()
                return {
                    "idToken": tokens.get("idToken"),
                    "accessToken": tokens.get("accessToken"),
                    "expiresIn": tokens.get("expiresIn", 3600),
                }
        except httpx.HTTPError as e:
            raise HarviaAPIError(f"Token refresh request failed: {str(e)}")
    
    async def get_devices(self, id_token: str) -> Dict[str, Any]:
        """
        Get list of user's devices from Harvia API.
        
        Args:
            id_token: JWT token from authentication (idToken or accessToken)
        
        Returns:
            Dict containing devices list
        
        Raises:
            HarviaAPIError: If request fails
        """
        # GraphQL requires special auth we don't have, so use REST API directly
        config = await self._get_api_configuration()
        return await self._get_devices_rest(id_token, config)
    
    async def _get_devices_rest(self, id_token: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Get devices using REST API - tries multiple endpoints"""
        
        # Try different endpoint combinations
        endpoints_to_try = [
            ("device", "/devices"),
            ("generics", "/devices"),
            ("users", "/devices"),
        ]
        
        last_error = None
        
        for endpoint_key, path in endpoints_to_try:
            api_base = config.get("RestApi", {}).get(endpoint_key, {}).get("https")
            
            if not api_base:
                print(f"⚠️ DEBUG: '{endpoint_key}' endpoint not found in config, skipping...")
                continue
            
            url = f"{api_base}{path}"
            print(f"🌐 DEBUG: Trying REST API: {url}")
            
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    response = await client.get(
                        url,
                        headers={
                            "Content-Type": "application/json",
                            "Authorization": f"Bearer {id_token}"
                        }
                    )
                    
                    print(f"📡 DEBUG: Response status: {response.status_code}")
                    print(f"📡 DEBUG: Response body: {response.text[:500]}")
                    
                    if response.status_code == 200:
                        print(f"✅ DEBUG: Successfully fetched devices from {endpoint_key} endpoint!")
                        return response.json()
                    elif response.status_code in [401, 403]:
                        error_data = response.json() if response.text else {}
                        error_message = error_data.get("message", error_data.get("Message", f"HTTP {response.status_code}"))
                        last_error = f"{endpoint_key}: {error_message}"
                        print(f"⚠️ DEBUG: {last_error}")
                        continue
                    else:
                        error_data = response.json() if response.text else {}
                        error_message = error_data.get("message", error_data.get("Message", "Failed to fetch devices"))
                        last_error = error_message
                        continue
            except Exception as e:
                print(f"❌ DEBUG: Exception calling {endpoint_key}: {str(e)}")
                last_error = str(e)
                continue
        
        # If we get here, all endpoints failed
        raise HarviaAPIError(
            f"All REST API endpoints failed. Last error: {last_error}. "
            f"Note: The REST /devices endpoint may have restricted access in the hackathon API. "
            f"You may need to use the Harvia mobile app or contact Harvia support for API access.",
            403
        )
    
    async def get_device_state(self, id_token: str, device_id: str) -> Dict[str, Any]:
        """
        Get device state (shadow) from Harvia API.
        
        Args:
            id_token: JWT ID token from authentication
            device_id: Device identifier
        
        Returns:
            Dict containing device state
        
        Raises:
            HarviaAPIError: If request fails
        """
        try:
            config = await self._get_api_configuration()
            device_api_base = config.get("RestApi", {}).get("device", {}).get("https")
            
            if not device_api_base:
                raise HarviaAPIError("Device API endpoint not found in configuration")
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{device_api_base}/devices/state",
                    params={"deviceId": device_id},
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {id_token}"
                    }
                )
                
                if response.status_code == 401:
                    raise HarviaAPIError("Unauthorized - token may be expired", 401)
                
                if response.status_code != 200:
                    error_data = response.json() if response.text else {}
                    error_message = error_data.get("message", "Failed to fetch device state")
                    raise HarviaAPIError(error_message, response.status_code)
                
                return response.json()
        except httpx.HTTPError as e:
            raise HarviaAPIError(f"Device state request failed: {str(e)}")
    
    async def get_latest_telemetry(self, id_token: str, device_id: str) -> Dict[str, Any]:
        """
        Get latest telemetry data for a device.
        
        Args:
            id_token: JWT ID token from authentication
            device_id: Device identifier
        
        Returns:
            Dict containing latest telemetry data
        
        Raises:
            HarviaAPIError: If request fails
        """
        try:
            config = await self._get_api_configuration()
            data_api_base = config.get("RestApi", {}).get("data", {}).get("https")
            
            if not data_api_base:
                raise HarviaAPIError("Data API endpoint not found in configuration")
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{data_api_base}/data/latest-data",
                    params={"deviceId": device_id},
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {id_token}"
                    }
                )
                
                if response.status_code == 401:
                    raise HarviaAPIError("Unauthorized - token may be expired", 401)
                
                if response.status_code != 200:
                    error_data = response.json() if response.text else {}
                    error_message = error_data.get("message", "Failed to fetch telemetry data")
                    raise HarviaAPIError(error_message, response.status_code)
                
                return response.json()
        except httpx.HTTPError as e:
            raise HarviaAPIError(f"Telemetry request failed: {str(e)}")
    
    async def send_device_command(
        self, 
        id_token: str, 
        device_id: str, 
        command: str,
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Send a command to a device.
        
        Args:
            id_token: JWT ID token from authentication
            device_id: Device identifier
            command: Command to send
            parameters: Optional command parameters
        
        Returns:
            Dict containing command response
        
        Raises:
            HarviaAPIError: If request fails
        """
        try:
            config = await self._get_api_configuration()
            device_api_base = config.get("RestApi", {}).get("device", {}).get("https")
            
            if not device_api_base:
                raise HarviaAPIError("Device API endpoint not found in configuration")
            
            payload = {
                "deviceId": device_id,
                "command": command
            }
            if parameters:
                payload["parameters"] = parameters
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{device_api_base}/devices/command",
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {id_token}"
                    },
                    json=payload
                )
                
                if response.status_code == 401:
                    raise HarviaAPIError("Unauthorized - token may be expired", 401)
                
                if response.status_code != 200:
                    error_data = response.json() if response.text else {}
                    error_message = error_data.get("message", "Failed to send command")
                    raise HarviaAPIError(error_message, response.status_code)
                
                return response.json()
        except httpx.HTTPError as e:
            raise HarviaAPIError(f"Command request failed: {str(e)}")
    
    async def set_device_target(
        self,
        id_token: str,
        device_id: str,
        temperature: Optional[float] = None,
        humidity: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Set target temperature and/or humidity for a device.
        
        Args:
            id_token: JWT ID token from authentication
            device_id: Device identifier
            temperature: Target temperature (optional)
            humidity: Target humidity (optional)
        
        Returns:
            Dict containing response
        
        Raises:
            HarviaAPIError: If request fails
        """
        try:
            config = await self._get_api_configuration()
            device_api_base = config.get("RestApi", {}).get("device", {}).get("https")
            
            if not device_api_base:
                raise HarviaAPIError("Device API endpoint not found in configuration")
            
            payload = {"deviceId": device_id}
            if temperature is not None:
                payload["temperature"] = temperature
            if humidity is not None:
                payload["humidity"] = humidity
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.patch(
                    f"{device_api_base}/devices/target",
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {id_token}"
                    },
                    json=payload
                )
                
                if response.status_code == 401:
                    raise HarviaAPIError("Unauthorized - token may be expired", 401)
                
                if response.status_code not in [200, 204]:
                    error_data = response.json() if response.text else {}
                    error_message = error_data.get("message", "Failed to set target")
                    raise HarviaAPIError(error_message, response.status_code)
                
                return response.json() if response.text else {"success": True}
        except httpx.HTTPError as e:
            raise HarviaAPIError(f"Set target request failed: {str(e)}")


# Global service instance
harvia_service = HarviaAPIService()

