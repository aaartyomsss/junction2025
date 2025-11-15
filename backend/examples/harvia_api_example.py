"""
Example script demonstrating how to use the Harvia API integration

This script shows:
1. Authentication with Harvia API
2. Fetching devices
3. Getting device state and telemetry
4. Token refresh

Note: Replace the username and password with actual credentials to test.
"""

import requests
import json
import sys
from typing import Optional


BASE_URL = "http://localhost:8080/api/harvia"


class HarviaAPIExample:
    """Example client for Harvia API integration"""
    
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.id_token: Optional[str] = None
        self.refresh_token: Optional[str] = None
        self.username: Optional[str] = None
    
    def login(self, username: str, password: str) -> dict:
        """
        Authenticate with Harvia API
        
        Returns the authentication tokens
        """
        print(f"\n{'='*60}")
        print("🔐 Authenticating with Harvia API...")
        print(f"{'='*60}")
        
        response = requests.post(
            f"{self.base_url}/auth/login",
            json={"username": username, "password": password}
        )
        
        if response.status_code == 200:
            data = response.json()
            self.id_token = data["idToken"]
            self.refresh_token = data.get("refreshToken")
            self.username = username
            
            print("✅ Authentication successful!")
            print(f"Token expires in: {data['expiresIn']} seconds (~{data['expiresIn']//60} minutes)")
            print(f"ID Token (first 50 chars): {self.id_token[:50]}...")
            
            return data
        else:
            error = response.json() if response.text else {"error": "Unknown error"}
            print(f"❌ Authentication failed: {error.get('error')}")
            print(f"Status code: {response.status_code}")
            sys.exit(1)
    
    def refresh_tokens(self) -> dict:
        """
        Refresh authentication tokens
        
        Returns new tokens
        """
        if not self.refresh_token or not self.username:
            print("❌ No refresh token or username available")
            return {}
        
        print(f"\n{'='*60}")
        print("🔄 Refreshing authentication tokens...")
        print(f"{'='*60}")
        
        response = requests.post(
            f"{self.base_url}/auth/refresh",
            json={"refreshToken": self.refresh_token, "email": self.username}
        )
        
        if response.status_code == 200:
            data = response.json()
            self.id_token = data["idToken"]
            
            print("✅ Token refresh successful!")
            print(f"New token expires in: {data['expiresIn']} seconds")
            
            return data
        else:
            error = response.json() if response.text else {"error": "Unknown error"}
            print(f"❌ Token refresh failed: {error.get('error')}")
            return {}
    
    def get_devices(self) -> list:
        """
        Get all devices from Harvia API
        
        Returns list of devices
        """
        if not self.id_token:
            print("❌ Not authenticated. Please login first.")
            return []
        
        print(f"\n{'='*60}")
        print("📱 Fetching devices from Harvia API...")
        print(f"{'='*60}")
        
        response = requests.get(
            f"{self.base_url}/devices",
            headers={"Authorization": f"Bearer {self.id_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            devices = data.get("devices", [])
            count = data.get("count", len(devices))
            
            print(f"✅ Found {count} device(s)")
            print()
            
            for i, device in enumerate(devices, 1):
                print(f"Device {i}:")
                print(f"  ID: {device.get('id')}")
                print(f"  Name: {device.get('name')}")
                print(f"  Type: {device.get('type')}")
                print(f"  Connected: {device.get('isConnected')}")
                
                reading = device.get('currentReading')
                if reading:
                    print(f"  Current Temperature: {reading.get('temperature')}°C")
                    print(f"  Target Temperature: {reading.get('targetTemp')}°C")
                    print(f"  Humidity: {reading.get('humidity')}%")
                    print(f"  Heating: {reading.get('heating')}")
                
                location = device.get('location')
                if location:
                    print(f"  Location: {location.get('name')}")
                
                print()
            
            return devices
        elif response.status_code == 401:
            print("❌ Unauthorized - Token may have expired")
            print("💡 Try refreshing the token or re-authenticating")
            return []
        else:
            error = response.json() if response.text else {"error": "Unknown error"}
            print(f"❌ Failed to fetch devices: {error.get('error')}")
            return []
    
    def get_device_state(self, device_id: str) -> dict:
        """
        Get device state (shadow)
        
        Returns device state data
        """
        if not self.id_token:
            print("❌ Not authenticated. Please login first.")
            return {}
        
        print(f"\n{'='*60}")
        print(f"🔍 Fetching state for device: {device_id}")
        print(f"{'='*60}")
        
        response = requests.get(
            f"{self.base_url}/devices/{device_id}/state",
            headers={"Authorization": f"Bearer {self.id_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            state = data.get("state", {})
            
            print("✅ Device state retrieved")
            print(f"State data:\n{json.dumps(state, indent=2)}")
            
            return state
        else:
            error = response.json() if response.text else {"error": "Unknown error"}
            print(f"❌ Failed to fetch device state: {error.get('error')}")
            return {}
    
    def get_device_telemetry(self, device_id: str) -> dict:
        """
        Get device telemetry data
        
        Returns telemetry data
        """
        if not self.id_token:
            print("❌ Not authenticated. Please login first.")
            return {}
        
        print(f"\n{'='*60}")
        print(f"📊 Fetching telemetry for device: {device_id}")
        print(f"{'='*60}")
        
        response = requests.get(
            f"{self.base_url}/devices/{device_id}/telemetry",
            headers={"Authorization": f"Bearer {self.id_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            telemetry = data.get("data", {})
            
            print("✅ Telemetry data retrieved")
            print(f"Telemetry:\n{json.dumps(telemetry, indent=2)}")
            
            return telemetry
        else:
            error = response.json() if response.text else {"error": "Unknown error"}
            print(f"❌ Failed to fetch telemetry: {error.get('error')}")
            return {}
    
    def set_device_target(self, device_id: str, temperature: float, humidity: Optional[float] = None) -> dict:
        """
        Set device target temperature and/or humidity
        
        Returns response from API
        """
        if not self.id_token:
            print("❌ Not authenticated. Please login first.")
            return {}
        
        print(f"\n{'='*60}")
        print(f"🎯 Setting target for device: {device_id}")
        print(f"{'='*60}")
        
        payload = {"deviceId": device_id, "temperature": temperature}
        if humidity is not None:
            payload["humidity"] = humidity
        
        response = requests.patch(
            f"{self.base_url}/devices/target",
            headers={
                "Authorization": f"Bearer {self.id_token}",
                "Content-Type": "application/json"
            },
            json=payload
        )
        
        if response.status_code in [200, 204]:
            data = response.json() if response.text else {"success": True}
            
            print("✅ Target set successfully")
            print(f"New temperature target: {temperature}°C")
            if humidity is not None:
                print(f"New humidity target: {humidity}%")
            
            return data
        else:
            error = response.json() if response.text else {"error": "Unknown error"}
            print(f"❌ Failed to set target: {error.get('error')}")
            return {}


def main():
    """Main function to run the example"""
    
    print("="*60)
    print("Harvia API Integration Example")
    print("="*60)
    print()
    print("⚠️  IMPORTANT: This example requires real Harvia credentials")
    print("The backend does NOT store your credentials - they're only")
    print("used to obtain temporary authentication tokens.")
    print()
    
    # Get credentials from user
    username = input("Enter your Harvia username/email (or 'demo' to skip): ").strip()
    
    if username.lower() == 'demo':
        print("\n📝 Demo mode - showing available endpoints only")
        print("\nAvailable endpoints:")
        print("  POST   /api/harvia/auth/login")
        print("  POST   /api/harvia/auth/refresh")
        print("  GET    /api/harvia/devices")
        print("  GET    /api/harvia/devices/{device_id}/state")
        print("  GET    /api/harvia/devices/{device_id}/telemetry")
        print("  POST   /api/harvia/devices/command")
        print("  PATCH  /api/harvia/devices/target")
        print("\nSee HARVIA_API_GUIDE.md for detailed documentation.")
        return
    
    password = input("Enter your Harvia password: ").strip()
    
    if not username or not password:
        print("❌ Username and password are required")
        return
    
    # Create client and run examples
    client = HarviaAPIExample()
    
    # 1. Authenticate
    client.login(username, password)
    
    # 2. Get devices
    devices = client.get_devices()
    
    if devices:
        # 3. Get state and telemetry for first device
        first_device_id = devices[0].get("id")
        
        client.get_device_state(first_device_id)
        client.get_device_telemetry(first_device_id)
        
        # 4. Optionally set target (commented out to avoid changing settings)
        # client.set_device_target(first_device_id, temperature=85.0)
    
    # 5. Demonstrate token refresh
    print("\n💡 You can refresh tokens using:")
    print(f"   client.refresh_tokens()")
    
    print(f"\n{'='*60}")
    print("✅ Example completed successfully!")
    print(f"{'='*60}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

