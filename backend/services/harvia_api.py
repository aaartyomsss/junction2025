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
            print(f"🌐 DEBUG: Authenticating with Harvia API at: {rest_api_base}/auth/token")
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{rest_api_base}/auth/token",
                    headers={"Content-Type": "application/json"},
                    json={"username": username, "password": password}
                )
                
                print(f"📡 DEBUG: Harvia API response status: {response.status_code}")
                print(f"📡 DEBUG: Harvia API response headers: {dict(response.headers)}")
                
                if response.status_code != 200:
                    error_text = response.text
                    print(f"❌ DEBUG: Harvia API error response body: {error_text[:500]}")
                    try:
                        error_data = response.json() if error_text else {}
                        print(f"❌ DEBUG: Parsed error data: {error_data}")
                        error_message = error_data.get("message") or error_data.get("error") or error_data.get("Message") or "Authentication failed"
                    except Exception as parse_error:
                        print(f"⚠️ DEBUG: Could not parse error JSON: {parse_error}")
                        error_message = error_text[:200] if error_text else "Authentication failed"
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
        
        Uses REST API GET /devices endpoint (GraphQL returns 401 for hackathon account).
        
        Args:
            id_token: JWT token from authentication (idToken or accessToken)
        
        Returns:
            Dict containing devices list
        
        Raises:
            HarviaAPIError: If request fails
        """
        config = await self._get_api_configuration()
        
        # Use REST API directly - GraphQL requires special permissions that hackathon account doesn't have
        return await self._get_devices_rest(id_token, config)
    
    async def _get_devices_graphql(self, id_token: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Get devices using GraphQL API - should have displayName and more complete data"""
        
        # Try both device and users GraphQL endpoints (display names might be in users service)
        device_graphql_endpoint = config.get("GraphQL", {}).get("device", {}).get("https")
        users_graphql_endpoint = config.get("GraphQL", {}).get("users", {}).get("https")
        schema_url = config.get("GraphQL", {}).get("device", {}).get("schemaUrl")
        
        graphql_endpoint = device_graphql_endpoint
        
        if not graphql_endpoint:
            raise HarviaAPIError("GraphQL device endpoint not found in configuration")
        
        print(f"🌐 DEBUG: Device GraphQL endpoint: {graphql_endpoint}")
        print(f"🌐 DEBUG: Users GraphQL endpoint: {users_graphql_endpoint}")
        print(f"📋 DEBUG: GraphQL schema URL: {schema_url}")
        
        # Try introspection query first to see what's available
        introspection_query = """
        {
          __schema {
            queryType {
              fields {
                name
                description
              }
            }
          }
        }
        """
        
        # Standard query attempt - trying common patterns
        # Common GraphQL patterns: listDevices, getDevices, devices, listUserDevices
        query = """
        query GetDevices {
          listDevices {
            items {
              name
              type
              displayName
              attr {
                key
                value
              }
              connected
              lastActivity
              lastConnectionTime
              createdAt
              updatedAt
            }
          }
        }
        """
        
        print(f"🌐 DEBUG: Sending GraphQL query to: {graphql_endpoint}")
        print(f"📝 DEBUG: Query: {query.strip()}")
        
        # First try introspection to see available queries
        async with httpx.AsyncClient(timeout=15.0) as client:
            print(f"🔍 DEBUG: First attempting introspection query to see available queries...")
            
            # AWS AppSync might need additional headers
            intro_headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {id_token}",
                "Accept": "application/json",
            }
            
            intro_response = await client.post(
                graphql_endpoint,
                headers=intro_headers,
                json={"query": introspection_query}
            )
            
            print(f"📡 DEBUG: Introspection response status: {intro_response.status_code}")
            
            if intro_response.status_code == 200:
                intro_result = intro_response.json()
                print(f"✅ DEBUG: Introspection successful!")
                if "data" in intro_result and "__schema" in intro_result["data"]:
                    queries = intro_result["data"]["__schema"]["queryType"]["fields"]
                    print(f"📋 DEBUG: Available queries: {[q['name'] for q in queries[:10]]}")
            else:
                error_text = intro_response.text
                print(f"❌ DEBUG: Introspection failed with {intro_response.status_code}")
                print(f"❌ DEBUG: Error: {error_text[:500]}")
                
                # Check if it's an introspection-disabled error vs auth error
                if "introspection" in error_text.lower():
                    print(f"💡 DEBUG: GraphQL introspection is disabled on this endpoint")
                elif "401" in str(intro_response.status_code):
                    print(f"💡 DEBUG: Authentication issue - token may not have GraphQL permissions")
                    print(f"💡 DEBUG: Token type: JWT from Cognito")
                    print(f"💡 DEBUG: Trying with different auth approaches...")
        
        # Now try the actual query with multiple auth approaches
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Try approach 1: Standard Bearer token (same as REST API)
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {id_token}",
                "Accept": "application/json",
            }
            
            print(f"🔑 DEBUG: Attempt 1 - Using Bearer token (same as working REST API)")
            print(f"🔑 DEBUG: Token (first 30 chars): {id_token[:30]}...")
            
            response = await client.post(
                graphql_endpoint,
                headers=headers,
                json={"query": query}
            )
            
            # If that fails, try the users GraphQL endpoint (display names might be there)
            if response.status_code == 401 and users_graphql_endpoint:
                print(f"⚠️ DEBUG: Device endpoint returned 401, trying USERS GraphQL endpoint...")
                print(f"🌐 DEBUG: Trying users endpoint: {users_graphql_endpoint}")
                
                # Try a users-focused query
                users_query = """
                query GetUserDevices {
                  listUserDevices {
                    items {
                      deviceId
                      deviceName
                      displayName
                      alias
                      name
                    }
                  }
                }
                """
                
                response = await client.post(
                    users_graphql_endpoint,
                    headers=headers,
                    json={"query": users_query}
                )
                print(f"📡 DEBUG: Users endpoint response status: {response.status_code}")
            
            print(f"📡 DEBUG: GraphQL response status: {response.status_code}")
            print(f"📡 DEBUG: Response headers: {dict(response.headers)}")
            
            if response.status_code == 401:
                error_text = response.text
                print(f"❌ DEBUG: GraphQL 401 with Bearer prefix: {error_text[:500]}")
                print(f"💡 DEBUG: This might be a permissions issue with the hackathon account")
                print(f"💡 DEBUG: GraphQL endpoints may require elevated permissions not available in demo/hackathon tokens")
                raise HarviaAPIError(f"GraphQL Unauthorized (401) - Hackathon account may not have GraphQL access")
            elif response.status_code != 200:
                error_text = response.text
                print(f"❌ DEBUG: GraphQL error response: {error_text[:1000]}")
                raise HarviaAPIError(f"GraphQL request failed: {response.status_code}")
            
            result = response.json()
            print(f"✅ DEBUG: GraphQL response keys: {result.keys()}")
            
            # Extract devices from GraphQL response
            if "data" in result and "listDevices" in result["data"]:
                devices = result["data"]["listDevices"].get("items", [])
                print(f"✅ DEBUG: Found {len(devices)} devices from GraphQL")
                return {"devices": devices}
            elif "errors" in result:
                error_msg = result["errors"][0].get("message", "Unknown GraphQL error")
                print(f"❌ DEBUG: GraphQL errors: {result['errors']}")
                raise HarviaAPIError(f"GraphQL error: {error_msg}")
            else:
                print(f"⚠️ DEBUG: Unexpected GraphQL response structure: {result}")
            
            return {"devices": []}
    
    async def _get_devices_rest(self, id_token: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Get devices using REST API - tries multiple endpoints"""
        
        # Try different endpoint combinations
        endpoints_to_try = [
            ("device", "/devices"),
            ("users", "/users/devices"),  # Try users service for device preferences/names
            ("users", "/devices"),
            ("generics", "/devices"),
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

