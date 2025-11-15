# API Connection Guide

## Quick Fix for "Network request failed"

The app is trying to connect to the backend but can't reach it. Here's how to fix it:

### Step 1: Make sure the backend is running

```powershell
cd backend
uv run uvicorn main:app --reload
```

You should see: `Uvicorn running on http://127.0.0.1:8080`

### Step 2: Update the backend URL based on your device

Edit `saunsei/services/config.ts` and change `BACKEND_HOST`:

#### Testing on Web Browser

```typescript
const BACKEND_HOST = "localhost" // ✓ This works
```

#### Testing on iOS Simulator

```typescript
const BACKEND_HOST = "localhost" // ✓ This works
```

#### Testing on Android Emulator

```typescript
const BACKEND_HOST = "10.0.2.2" // ✓ Use this special Android address
```

#### Testing on Physical Device (iPhone/Android)

1. Find your computer's IP address:

   ```powershell
   ipconfig
   ```

   Look for "IPv4 Address" (e.g., `192.168.1.100`)

2. Update config:

   ```typescript
   const BACKEND_HOST = "192.168.1.100" // ✓ Use your actual IP
   ```

3. Make sure your phone and computer are on the **same WiFi network**

### Step 3: Restart the app

After changing the config, restart your Expo app:

- Press `r` in the Expo terminal to reload

## Fallback Behavior

If the backend is not available, the app will:

- ✓ Show a warning banner
- ✓ Use mock data so you can still test the UI
- ✓ Continue working normally

## Testing Backend Connection

Open your browser and go to:

- http://localhost:8080/docs (if testing on same computer)
- http://YOUR_IP:8080/docs (if testing from another device)

You should see the FastAPI documentation page.

## Common Issues

### Issue: "Network request failed"

- **Solution**: Backend not running → Start it with `uv run uvicorn main:app --reload`
- **Solution**: Wrong IP address → Update `config.ts` with correct IP
- **Solution**: Firewall blocking → Allow Python through Windows Firewall

### Issue: Works on web but not on phone

- **Solution**: Change `localhost` to your computer's IP address in `config.ts`
- **Solution**: Ensure phone and computer are on same WiFi

### Issue: Android emulator can't connect

- **Solution**: Use `10.0.2.2` instead of `localhost` in `config.ts`
