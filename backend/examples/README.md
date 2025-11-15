# Harvia API Examples

This directory contains example scripts demonstrating how to use the Harvia API integration.

## Running the Example

### Prerequisites

1. Make sure the backend server is running:
   ```bash
   cd backend
   uv run python -m uvicorn main:app --reload --port 8080
   ```

2. You need valid Harvia account credentials to test the real API integration.

### Run the Example Script

```bash
cd backend
python examples/harvia_api_example.py
```

The script will:
1. Prompt for your Harvia username and password
2. Authenticate with the Harvia API
3. Fetch and display your devices
4. Get device state and telemetry for the first device
5. Demonstrate token refresh capability

### Demo Mode

If you don't have Harvia credentials, you can run in demo mode to see available endpoints:

```bash
cd backend
python examples/harvia_api_example.py
# Enter 'demo' when prompted for username
```

## Security Note

⚠️ **Your credentials are never stored!**

The example script:
- Only uses credentials to obtain temporary tokens
- Tokens are stored in memory during the script execution
- All data is cleared when the script exits

This matches the backend implementation which does not store user credentials or tokens.

## Example Output

```
============================================================
Harvia API Integration Example
============================================================

⚠️  IMPORTANT: This example requires real Harvia credentials
The backend does NOT store your credentials - they're only
used to obtain temporary authentication tokens.

Enter your Harvia username/email: user@example.com
Enter your Harvia password: ********

============================================================
🔐 Authenticating with Harvia API...
============================================================
✅ Authentication successful!
Token expires in: 3600 seconds (~60 minutes)

============================================================
📱 Fetching devices from Harvia API...
============================================================
✅ Found 2 device(s)

Device 1:
  ID: device-123
  Name: Home Sauna
  Type: fenix
  Connected: True
  Current Temperature: 82.5°C
  Target Temperature: 85.0°C
  Humidity: 18.3%
  Heating: True
  Location: Home

Device 2:
  ID: device-456
  Name: Cabin Sauna
  Type: smart_sensor
  Connected: True
  Current Temperature: 78.0°C
  Target Temperature: 80.0°C
  Humidity: 16.5%
  Heating: False
  Location: Summer Cabin

============================================================
✅ Example completed successfully!
============================================================
```

## API Endpoints Demonstrated

The example script uses the following endpoints:

1. **POST** `/api/harvia/auth/login` - Authenticate with username/password
2. **POST** `/api/harvia/auth/refresh` - Refresh expired tokens
3. **GET** `/api/harvia/devices` - Get all user devices
4. **GET** `/api/harvia/devices/{device_id}/state` - Get device state
5. **GET** `/api/harvia/devices/{device_id}/telemetry` - Get telemetry data
6. **PATCH** `/api/harvia/devices/target` - Set device target (commented out)

## Using the Code

You can use the `HarviaAPIExample` class in your own scripts:

```python
from examples.harvia_api_example import HarviaAPIExample

# Create client
client = HarviaAPIExample()

# Login
client.login("user@example.com", "password")

# Get devices
devices = client.get_devices()

# Get device state
if devices:
    device_id = devices[0]["id"]
    state = client.get_device_state(device_id)
    
    # Set target temperature
    client.set_device_target(device_id, temperature=85.0)

# Refresh token when it expires
client.refresh_tokens()
```

## More Information

For complete API documentation, see:
- [HARVIA_API_GUIDE.md](../HARVIA_API_GUIDE.md) - Complete API guide
- [API_reference/api_reference.md](../API_reference/api_reference.md) - Official Harvia API reference
- FastAPI Docs: http://localhost:8080/docs (when server is running)

