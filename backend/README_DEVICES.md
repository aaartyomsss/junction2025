# 🔥 Sauna Devices API

API endpoints for managing sauna devices (Fenix panels and Smart Sensors).

## Quick Start

```bash
cd backend
go run main.go
```

Server will start on http://localhost:8080

## Device Endpoints

### Get All Devices
```bash
GET /api/v1/devices

# Filter by type
GET /api/v1/devices?type=smart_sensor
GET /api/v1/devices?type=fenix
```

**Response:**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "id": "junction-sauna-1",
      "name": "Junction Main Sauna",
      "type": "smart_sensor",
      "isConnected": true,
      "batteryLevel": 87,
      "signalStrength": 95,
      "lastSeen": "2025-11-14T12:30:00Z",
      "location": {
        "name": "Junction Venue - Hall A",
        "latitude": 60.1695,
        "longitude": 24.9354
      },
      "currentReading": {
        "temperature": 82.5,
        "humidity": 18.3,
        "timestamp": "2025-11-14T12:30:00Z",
        "heating": true,
        "targetTemp": 85.0
      }
    }
  ]
}
```

### Get Single Device
```bash
GET /api/v1/devices/:id
```

### Get Device Reading
```bash
GET /api/v1/devices/:id/reading
```

**Response:**
```json
{
  "success": true,
  "data": {
    "temperature": 82.5,
    "humidity": 18.3,
    "timestamp": "2025-11-14T12:30:00Z",
    "heating": true,
    "targetTemp": 85.0
  }
}
```

### Update Target Temperature
```bash
PUT /api/v1/devices/:id/target
Content-Type: application/json

{
  "targetTemp": 90
}
```

### Get Device Statistics
```bash
GET /api/v1/devices/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDevices": 6,
    "connectedDevices": 5,
    "averageTemp": 81.2,
    "maxTemp": 88.5,
    "minTemp": 75.0
  }
}
```

## Mock Devices

The API includes 6 mock devices:

### Junction Venue Saunas (4)
- Junction Main Sauna
- Junction Wellness Sauna
- Junction Relaxation Sauna
- Junction Recovery Sauna

### Harvia Booth Demo Saunas (2)
- Harvia Booth Demo - Fenix
- Harvia Booth Demo - Mini

## Testing

```bash
# Get all devices
curl http://localhost:8080/api/v1/devices

# Get specific device
curl http://localhost:8080/api/v1/devices/junction-sauna-1

# Get device reading
curl http://localhost:8080/api/v1/devices/junction-sauna-1/reading

# Update target temperature
curl -X PUT http://localhost:8080/api/v1/devices/junction-sauna-1/target \
  -H "Content-Type: application/json" \
  -d '{"targetTemp": 90}'

# Get stats
curl http://localhost:8080/api/v1/devices/stats
```

## CORS

CORS is enabled for all origins to support React Native development.

## Next Steps

- Connect to real Harvia Cloud API
- Add authentication
- Implement WebSocket for real-time updates
- Add session history endpoints
- Database integration


