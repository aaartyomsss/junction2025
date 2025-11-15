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
        
        Tries GraphQL first (usersDevicesList) for better data including display names,
        falls back to REST API if GraphQL fails.
        
        Args:
            id_token: JWT token from authentication (idToken or accessToken)
        
        Returns:
            Dict containing devices list
        
        Raises:
            HarviaAPIError: If request fails
        """
        config = await self._get_api_configuration()
        
        # Try GraphQL first - usersDevicesList should work and has better data
        try:
            print("🔍 DEBUG: Attempting GraphQL usersDevicesList query first...")
            return await self._get_devices_graphql_users(id_token, config)
        except HarviaAPIError as e:
            print(f"⚠️ DEBUG: GraphQL failed: {e.message}, falling back to REST API...")
            # Fall back to REST API if GraphQL fails
            return await self._get_devices_rest(id_token, config)
    
    async def _get_devices_graphql_users(self, id_token: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get devices using GraphQL: 
        1. First get list using usersDevicesList
        2. Then query each device individually with devicesGet to get full details including display name
        """
        
        device_graphql_endpoint = config.get("GraphQL", {}).get("device", {}).get("https")
        
        if not device_graphql_endpoint:
            raise HarviaAPIError("GraphQL device endpoint not found in configuration")
        
        print(f"🌐 DEBUG: Using GraphQL device endpoint: {device_graphql_endpoint}")
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {id_token}",
                "Accept": "application/json",
            }
            
            # Step 1: Get list of devices using usersDevicesList
            list_query = """
            query ListMyDevices {
              usersDevicesList {
                devices {
                  id
                  type
                  attr {
                    key
                    value
                  }
                  roles
                  via
                }
                nextToken
              }
            }
            """
            
            print(f"🔑 DEBUG: Step 1 - Sending usersDevicesList query...")
            list_response = await client.post(
                device_graphql_endpoint,
                headers=headers,
                json={"query": list_query}
            )
            
            print(f"📡 DEBUG: GraphQL list response status: {list_response.status_code}")
            
            if list_response.status_code == 401:
                error_text = list_response.text
                print(f"❌ DEBUG: GraphQL 401: {error_text[:500]}")
                raise HarviaAPIError(f"GraphQL Unauthorized (401) - Token may not have GraphQL access", 401)
            elif list_response.status_code != 200:
                error_text = list_response.text
                print(f"❌ DEBUG: GraphQL error response: {error_text[:1000]}")
                raise HarviaAPIError(f"GraphQL request failed: {list_response.status_code}", list_response.status_code)
            
            list_result = list_response.json()
            
            # Extract device IDs from list
            if "data" in list_result and "usersDevicesList" in list_result["data"]:
                device_list = list_result["data"]["usersDevicesList"].get("devices", [])
                print(f"✅ DEBUG: Found {len(device_list)} devices in list")
            elif "errors" in list_result:
                error_msg = list_result["errors"][0].get("message", "Unknown GraphQL error")
                print(f"❌ DEBUG: GraphQL errors: {list_result['errors']}")
                raise HarviaAPIError(f"GraphQL error: {error_msg}")
            else:
                print(f"⚠️ DEBUG: Unexpected GraphQL response structure: {list_result}")
                raise HarviaAPIError("Unexpected GraphQL response structure")
            
            # Step 2: Query each device individually to get full details including display name
            # Also try to get device aliases/preferences from users service if available
            users_graphql_endpoint = config.get("GraphQL", {}).get("users", {}).get("https")
            enriched_devices = []
            
            for device_summary in device_list:
                device_id = device_summary.get("id")
                if not device_id:
                    print(f"⚠️ DEBUG: Skipping device without ID: {device_summary}")
                    continue
                
                print(f"🔍 DEBUG: Step 2 - Fetching full details for device: {device_id}")
                
                # Query individual device for full details
                device_query = f"""
                query GetDevice {{
                  devicesGet(deviceId: "{device_id}") {{
                    id
                    type
                    attr {{
                      key
                      value
                    }}
                    roles
                    via
                  }}
                }}
                """
                
                device_response = await client.post(
                    device_graphql_endpoint,
                    headers=headers,
                    json={"query": device_query}
                )
                
                device_data = None
                if device_response.status_code == 200:
                    device_result = device_response.json()
                    if "data" in device_result and "devicesGet" in device_result["data"]:
                        device_data = device_result["data"]["devicesGet"]
                        if device_data:  # devicesGet can return None if unauthorized
                            print(f"✅ DEBUG: Enriched device {device_id} with full details")
                        else:
                            print(f"⚠️ DEBUG: devicesGet returned None for {device_id} (may be unauthorized)")
                            device_data = device_summary
                    else:
                        print(f"⚠️ DEBUG: Unexpected response for device {device_id}, using summary")
                        device_data = device_summary
                else:
                    print(f"⚠️ DEBUG: Failed to get details for {device_id} (status {device_response.status_code}), using summary")
                    device_data = device_summary
                
                # Step 3: Try to get device alias/display name from users service if available
                # The display names like "HypeMen", "MiniSaunaFenx" might be stored as user preferences
                if device_data and users_graphql_endpoint:
                    try:
                        print(f"🔍 DEBUG: Step 3 - Checking users service for device alias: {device_id}")
                        # Try common queries for device preferences/aliases
                        users_queries = [
                            f"""
                            query GetDeviceAlias {{
                              deviceAlias(deviceId: "{device_id}")
                            }}
                            """,
                            f"""
                            query GetDevicePreference {{
                              devicePreference(deviceId: "{device_id}") {{
                                alias
                                displayName
                                name
                              }}
                            }}
                            """,
                            f"""
                            query GetUserDevice {{
                              userDevice(deviceId: "{device_id}") {{
                                alias
                                displayName
                                name
                              }}
                            }}
                            """
                        ]
                        
                        for users_query in users_queries:
                            try:
                                users_response = await client.post(
                                    users_graphql_endpoint,
                                    headers=headers,
                                    json={"query": users_query},
                                    timeout=5.0
                                )
                                if users_response.status_code == 200:
                                    users_result = users_response.json()
                                    # Try to extract alias/displayName from response
                                    if "data" in users_result:
                                        for key, value in users_result["data"].items():
                                            if value and isinstance(value, (str, dict)):
                                                if isinstance(value, str) and value:
                                                    # Direct string value (alias)
                                                    if not device_data.get("displayName"):
                                                        device_data["displayName"] = value
                                                        print(f"✅ DEBUG: Found alias from users service: {value}")
                                                        break
                                                elif isinstance(value, dict):
                                                    # Object with alias/displayName fields
                                                    alias = value.get("alias") or value.get("displayName") or value.get("name")
                                                    if alias and not device_data.get("displayName"):
                                                        device_data["displayName"] = alias
                                                        print(f"✅ DEBUG: Found alias from users service: {alias}")
                                                        break
                            except Exception as e:
                                # Continue to next query if this one fails
                                continue
                    except Exception as e:
                        print(f"⚠️ DEBUG: Could not query users service for alias: {e}")
                
                if device_data:
                    enriched_devices.append(device_data)
            
            print(f"✅ DEBUG: Returning {len(enriched_devices)} enriched devices")
            return {"devices": enriched_devices}
    
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
        """
        Get devices using REST API - tries multiple endpoints.
        The REST API might have the 'name' attribute in the attr array that GraphQL doesn't show.
        """
        
        # Try different endpoint combinations
        # Priority: device endpoint first (most likely to have name attribute per docs)
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
                    # Add query parameters for pagination
                    params = {"maxResults": 100}
                    response = await client.get(
                        url,
                        params=params,
                        headers={
                            "Content-Type": "application/json",
                            "Authorization": f"Bearer {id_token}"
                        }
                    )
                    
                    print(f"📡 DEBUG: Response status: {response.status_code}")
                    print(f"📡 DEBUG: Response body: {response.text[:500]}")
                    
                    if response.status_code == 200:
                        result = response.json()
                        print(f"✅ DEBUG: Successfully fetched devices from {endpoint_key} endpoint!")
                        # REST API might return devices with 'name' attribute in attr array
                        # Check if any device has a name attribute
                        devices = result.get("devices", [])
                        if devices:
                            for device in devices[:1]:  # Check first device
                                attrs = device.get("attr", [])
                                if attrs:
                                    attr_dict = {item.get("key"): item.get("value") for item in attrs if item.get("key")}
                                    if "name" in attr_dict:
                                        print(f"✅ DEBUG: REST API has 'name' attributes! Found: {attr_dict.get('name')}")
                        return result
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
    
    async def update_device_name(
        self,
        id_token: str,
        device_id: str,
        display_name: str
    ) -> Dict[str, Any]:
        """
        Update device display name using devicesUpdate mutation.
        
        Args:
            id_token: JWT ID token from authentication
            device_id: Device identifier
            display_name: The display name to set (will be stored as "name" attribute)
        
        Returns:
            Dict containing updated device
        """
        try:
            config = await self._get_api_configuration()
            device_graphql_endpoint = config.get("GraphQL", {}).get("device", {}).get("https")
            
            if not device_graphql_endpoint:
                raise HarviaAPIError("GraphQL device endpoint not found in configuration")
            
            # Use devicesUpdate mutation to set the "name" attribute
            mutation = f"""
            mutation UpdateDeviceName {{
              devicesUpdate(
                deviceId: "{device_id}"
                attributes: [
                  {{ key: "name", value: "{display_name}" }}
                ]
              ) {{
                id
                type
                attr {{
                  key
                  value
                }}
              }}
            }}
            """
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    device_graphql_endpoint,
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {id_token}"
                    },
                    json={"query": mutation}
                )
                
                if response.status_code == 401:
                    raise HarviaAPIError("Unauthorized - token may be expired", 401)
                
                if response.status_code != 200:
                    error_data = response.json() if response.text else {}
                    error_message = error_data.get("errors", [{}])[0].get("message", "Failed to update device name")
                    raise HarviaAPIError(error_message, response.status_code)
                
                result = response.json()
                if "errors" in result:
                    error_msg = result["errors"][0].get("message", "Unknown GraphQL error")
                    raise HarviaAPIError(f"GraphQL error: {error_msg}")
                
                return result.get("data", {}).get("devicesUpdate", {})
        except httpx.HTTPError as e:
            raise HarviaAPIError(f"Update device name request failed: {str(e)}")
    
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

