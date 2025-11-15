# Quick Start Backend for Mobile Testing

# Start backend accessible from mobile devices
uv run uvicorn main:app --host 0.0.0.0 --port 8080 --reload

# The --host 0.0.0.0 flag allows connections from other devices on your network
# Without it, the backend only accepts connections from localhost
