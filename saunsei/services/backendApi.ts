/**
 * Backend API Service
 *
 * Comprehensive API client for the Junction Backend API
 * Supports device management, users, and ML models
 */

import { DeviceStatus, SensorReading } from "@/types/sauna"
import { API_CONFIG } from "./config"

// API Configuration - imported from config.ts
const BACKEND_BASE_URL = API_CONFIG.BACKEND_BASE_URL
const API_V1_URL = API_CONFIG.API_V1_URL
const API_URL = API_CONFIG.API_URL

// ============================================
// Type Definitions
// ============================================

export interface BackendDevice {
  id: string
  name: string
  type: string
  isConnected: boolean
  batteryLevel: number
  signalStrength: number
  lastSeen: string
  location: {
    name: string
    latitude: number
    longitude: number
  }
  currentReading?: {
    temperature: number
    humidity: number
    timestamp: string
    heating: boolean
    targetTemp: number
  }
}

export interface DeviceStats {
  totalDevices: number
  connectedDevices: number
  averageTemp: number
  maxTemp: number
  minTemp: number
}

export interface BackendUser {
  id: string
  name: string
  email: string
}

export interface DBUser {
  id?: number
  email: string
  username: string
  full_name?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface DBSauna {
  id?: number
  name: string
  latitude: number
  longitude: number
  rating: number
  description?: string
  added_by_user_id: number
  created_at?: string
  updated_at?: string
}

export interface SaunaCreateRequest {
  name: string
  latitude: number
  longitude: number
  rating: number
  description?: string
  added_by_user_id: number
}

export interface DBSaunaSession {
  id?: number
  duration_seconds: number
  average_temperature: number
  max_temperature: number
  user_id: number
  sauna_id?: number
  created_at?: string
  updated_at?: string
}

export interface HarviaAuthResponse {
  success: boolean
  idToken: string
  accessToken: string
  refreshToken?: string
  expiresIn: number
}

export interface HarviaAuthRequest {
  username: string
  password: string
}

export interface HarviaDevice {
  name: string
  type?: string
  id?: string
  isConnected?: boolean
  batteryLevel?: number
  signalStrength?: number
  lastSeen?: string
  location?: {
    name?: string
    latitude?: number
    longitude?: number
  }
  currentReading?: {
    temperature?: number
    humidity?: number
    timestamp?: string
    heating?: boolean
    targetTemp?: number
  }
}

// ============================================
// Main API Service Class
// ============================================

class BackendApiService {
  private baseUrl = BACKEND_BASE_URL
  private apiV1Url = API_V1_URL
  private apiUrl = API_URL

  // ============================================
  // HEALTH & STATUS
  // ============================================

  /**
   * Check if backend is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      console.log(`🔍 Checking backend health at: ${this.baseUrl}/health`)
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })
      console.log(
        `✓ Backend health check: ${response.ok ? "OK" : "FAILED"} (${
          response.status
        })`
      )
      return response.ok
    } catch (error: any) {
      console.error("❌ Backend health check failed:", error.message)
      console.error("   Backend URL:", this.baseUrl)
      console.error(
        "   Make sure backend is running: cd backend && uv run uvicorn main:app --host 0.0.0.0 --reload"
      )
      return false
    }
  }

  /**
   * Ping endpoint
   */
  async ping(): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(
      `${this.apiV1Url}/ping`
    )
    return response
  }

  // ============================================
  // HARVIA AUTHENTICATION
  // ============================================

  /**
   * Authenticate with Harvia API
   */
  async harviaLogin(
    username: string,
    password: string
  ): Promise<HarviaAuthResponse | null> {
    try {
      const response = await fetch(`${this.apiUrl}/harvia/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error || `Authentication failed: ${response.status}`
        )
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Harvia authentication failed:", error)
      return null
    }
  }

  /**
   * Refresh Harvia authentication token
   */
  async harviaRefreshToken(
    refreshToken: string,
    email: string
  ): Promise<HarviaAuthResponse | null> {
    try {
      const response = await fetch(`${this.apiUrl}/harvia/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken, email }),
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Token refresh failed:", error)
      return null
    }
  }

  /**
   * Get devices from Harvia API (requires authentication token)
   */
  async getHarviaDevices(token: string): Promise<DeviceStatus[]> {
    try {
      const response = await fetch(`${this.apiUrl}/harvia/devices`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error || `Failed to fetch Harvia devices: ${response.status}`
        )
      }

      const result = await response.json()

      if (!result.success || !result.devices) {
        return []
      }

      // Map Harvia devices to DeviceStatus format
      return result.devices.map((device: any) => ({
        isConnected: device.isConnected ?? false,
        deviceId: device.id || device.name,
        deviceName: device.displayName || device.name, // Use displayName if available, fallback to device ID
        batteryLevel: device.batteryLevel ?? 0,
        signalStrength: device.signalStrength ?? 0,
        deviceType: device.type || "unknown",
        location: device.location
          ? {
              name: device.location.name || "Unknown",
              latitude: device.location.latitude ?? 0,
              longitude: device.location.longitude ?? 0,
            }
          : undefined,
        lastSeen: device.lastSeen ? new Date(device.lastSeen) : undefined,
      }))
    } catch (error) {
      console.error("Failed to fetch Harvia devices:", error)
      return []
    }
  }

  // ============================================
  // DEVICE MANAGEMENT
  // ============================================

  /**
   * Get all devices from backend (mock devices - no auth required)
   */
  async getDevices(type?: "fenix" | "smart_sensor"): Promise<DeviceStatus[]> {
    try {
      const url = type
        ? `${this.apiV1Url}/devices?type=${type}`
        : `${this.apiV1Url}/devices`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch devices: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch devices")
      }

      // Map backend response to app format
      return result.data.map((device: BackendDevice) => ({
        isConnected: device.isConnected,
        deviceId: device.id,
        deviceName: device.name,
        batteryLevel: device.batteryLevel,
        signalStrength: device.signalStrength,
        deviceType: device.type,
        location: device.location,
        lastSeen: new Date(device.lastSeen),
      }))
    } catch (error) {
      console.error("Failed to fetch devices:", error)
      return []
    }
  }

  /**
   * Get a specific device by ID
   */
  async getDevice(deviceId: string): Promise<BackendDevice | null> {
    try {
      const response = await fetch(`${this.apiV1Url}/devices/${deviceId}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch device: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch device")
      }

      return result.data
    } catch (error) {
      console.error("Failed to fetch device:", error)
      return null
    }
  }

  /**
   * Get current sensor reading from a device
   */
  async getCurrentReading(deviceId: string): Promise<SensorReading | null> {
    try {
      const response = await fetch(
        `${this.apiV1Url}/devices/${deviceId}/reading`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch reading: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success || !result.data) {
        return null
      }

      return {
        temperature: result.data.temperature,
        humidity: result.data.humidity,
        timestamp: new Date(result.data.timestamp),
      }
    } catch (error) {
      console.error("Failed to fetch reading:", error)
      return null
    }
  }

  /**
   * Update target temperature for a device
   */
  async setTargetTemperature(
    deviceId: string,
    targetTemp: number
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiV1Url}/devices/${deviceId}/target`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ targetTemp }),
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to update target: ${response.status}`)
      }

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error("Failed to update target temperature:", error)
      return false
    }
  }

  /**
   * Get device statistics
   */
  async getDeviceStats(): Promise<DeviceStats | null> {
    try {
      const response = await fetch(`${this.apiV1Url}/devices/stats`)

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch stats")
      }

      return result.data
    } catch (error) {
      console.error("Failed to fetch stats:", error)
      return null
    }
  }

  // ============================================
  // USER MANAGEMENT (Simple API v1)
  // ============================================

  /**
   * Get all users (simple in-memory API)
   */
  async getUsers(): Promise<BackendUser[]> {
    const response = await this.request<{ data: BackendUser[] }>(
      `${this.apiV1Url}/users`
    )
    return response.data
  }

  /**
   * Get user by ID (simple in-memory API)
   */
  async getUser(userId: string): Promise<BackendUser> {
    const response = await this.request<{ data: BackendUser }>(
      `${this.apiV1Url}/users/${userId}`
    )
    return response.data
  }

  /**
   * Create new user (simple in-memory API)
   */
  async createUser(
    user: Omit<BackendUser, "id"> & { id: string }
  ): Promise<BackendUser> {
    return this.request<BackendUser>(`${this.apiV1Url}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    })
  }

  /**
   * Update user (simple in-memory API)
   */
  async updateUser(
    userId: string,
    user: Omit<BackendUser, "id">
  ): Promise<BackendUser> {
    const response = await this.request<{ data: BackendUser }>(
      `${this.apiV1Url}/users/${userId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      }
    )
    return response.data
  }

  /**
   * Delete user (simple in-memory API)
   */
  async deleteUser(userId: string): Promise<void> {
    await this.request(`${this.apiV1Url}/users/${userId}`, {
      method: "DELETE",
    })
  }

  // ============================================
  // USER MANAGEMENT (Database API)
  // ============================================

  /**
   * Get all users from database
   */
  async getDBUsers(skip: number = 0, limit: number = 100): Promise<DBUser[]> {
    return this.request<DBUser[]>(
      `${this.apiUrl}/users/?skip=${skip}&limit=${limit}`
    )
  }

  /**
   * Get database user by ID
   */
  async getDBUser(userId: number): Promise<DBUser> {
    return this.request<DBUser>(`${this.apiUrl}/users/${userId}`)
  }

  /**
   * Create new database user
   */
  async createDBUser(
    user: Omit<DBUser, "id" | "created_at" | "updated_at">
  ): Promise<DBUser> {
    return this.request<DBUser>(`${this.apiUrl}/users/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    })
  }

  /**
   * Delete database user
   */
  async deleteDBUser(userId: number): Promise<void> {
    await this.request(`${this.apiUrl}/users/${userId}`, {
      method: "DELETE",
    })
  }

  // ============================================
  // SAUNA MANAGEMENT
  // ============================================

  /**
   * Get all saunas from database
   */
  async getSaunas(
    skip: number = 0,
    limit: number = 100,
    rating?: number
  ): Promise<DBSauna[]> {
    let url = `${this.apiUrl}/saunas/?skip=${skip}&limit=${limit}`
    if (rating) {
      url += `&rating=${rating}`
    }
    console.log(`🌐 Fetching saunas from: ${url}`)
    return this.request<DBSauna[]>(url)
  }

  /**
   * Get sauna by ID
   */
  async getSauna(saunaId: number): Promise<DBSauna> {
    return this.request<DBSauna>(`${this.apiUrl}/saunas/${saunaId}`)
  }

  /**
   * Create new sauna
   */
  async createSauna(sauna: SaunaCreateRequest): Promise<DBSauna> {
    return this.request<DBSauna>(`${this.apiUrl}/saunas/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sauna),
    })
  }

  /**
   * Update sauna
   */
  async updateSauna(saunaId: number, sauna: DBSauna): Promise<DBSauna> {
    return this.request<DBSauna>(`${this.apiUrl}/saunas/${saunaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sauna),
    })
  }

  /**
   * Delete sauna
   */
  async deleteSauna(saunaId: number): Promise<void> {
    await this.request(`${this.apiUrl}/saunas/${saunaId}`, {
      method: "DELETE",
    })
  }

  // ============================================
  // SESSION MANAGEMENT
  // ============================================

  /**
   * Get all sauna sessions from database
   */
  async getSessions(
    skip: number = 0,
    limit: number = 100,
    userId?: number,
    saunaId?: number
  ): Promise<DBSaunaSession[]> {
    let url = `${this.apiUrl}/sessions/?skip=${skip}&limit=${limit}`
    if (userId) {
      url += `&user_id=${userId}`
    }
    if (saunaId) {
      url += `&sauna_id=${saunaId}`
    }
    console.log(`🌐 Fetching sessions from: ${url}`)
    return this.request<DBSaunaSession[]>(url)
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: number): Promise<DBSaunaSession> {
    return this.request<DBSaunaSession>(`${this.apiUrl}/sessions/${sessionId}`)
  }

  /**
   * Create new session
   */
  async createSession(
    session: Omit<DBSaunaSession, "id" | "created_at" | "updated_at">
  ): Promise<DBSaunaSession> {
    return this.request<DBSaunaSession>(`${this.apiUrl}/sessions/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session),
    })
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: number): Promise<void> {
    await this.request(`${this.apiUrl}/sessions/${sessionId}`, {
      method: "DELETE",
    })
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Generic request wrapper with error handling
   */
  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, options)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return {} as T
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${url}`, error)
      throw error
    }
  }
}

// Export singleton instance
export const backendApi = new BackendApiService()

// Export for testing or multiple instances
export { BackendApiService }
