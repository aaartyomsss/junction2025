/**
 * API Configuration
 *
 * Update BACKEND_HOST based on your environment:
 * - For iOS Simulator: "localhost" or "127.0.0.1"
 * - For Android Emulator: "10.0.2.2" (special alias for host machine)
 * - For Physical Device: Your computer's local IP (e.g., "192.168.1.100")
 *
 * To find your IP on Windows: Run `ipconfig` in PowerShell and look for IPv4 Address
 * To find your IP on Mac/Linux: Run `ifconfig` or `ip addr`
 */

// Change this to your computer's IP address if testing on a physical device
// For Android Emulator, use "10.0.2.2"
// For iOS Simulator or web, use "localhost"
const BACKEND_HOST = "localhost"
const BACKEND_PORT = "8080"

export const API_CONFIG = {
  BACKEND_BASE_URL: `http://${BACKEND_HOST}:${BACKEND_PORT}`,
  API_V1_URL: `http://${BACKEND_HOST}:${BACKEND_PORT}/api/v1`,
  API_URL: `http://${BACKEND_HOST}:${BACKEND_PORT}/api`,
}

// Helper to check if backend is likely accessible
export const isLikelyAccessible = () => {
  // On web, localhost should work
  if (typeof window !== "undefined" && window.location) {
    return true
  }
  // For mobile, localhost won't work - user should update the config
  return BACKEND_HOST !== "localhost"
}
