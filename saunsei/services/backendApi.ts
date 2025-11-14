/**
 * Backend API Service
 * 
 * Connects to the local Go backend API for device management
 */

import { DeviceStatus, SensorReading } from '@/types/sauna';

// API Configuration - update this to your backend URL
const BACKEND_API_URL = 'http://localhost:8080/api/v1';

interface BackendDevice {
  id: string;
  name: string;
  type: string;
  isConnected: boolean;
  batteryLevel: number;
  signalStrength: number;
  lastSeen: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  currentReading?: {
    temperature: number;
    humidity: number;
    timestamp: string;
    heating: boolean;
    targetTemp: number;
  };
}

class BackendApiService {
  /**
   * Get all devices from backend
   */
  async getDevices(type?: 'fenix' | 'smart_sensor'): Promise<DeviceStatus[]> {
    try {
      const url = type 
        ? `${BACKEND_API_URL}/devices?type=${type}`
        : `${BACKEND_API_URL}/devices`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch devices: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch devices');
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
      }));
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      return [];
    }
  }

  /**
   * Get a specific device by ID
   */
  async getDevice(deviceId: string): Promise<BackendDevice | null> {
    try {
      const response = await fetch(`${BACKEND_API_URL}/devices/${deviceId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch device: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch device');
      }

      return result.data;
    } catch (error) {
      console.error('Failed to fetch device:', error);
      return null;
    }
  }

  /**
   * Get current sensor reading from a device
   */
  async getCurrentReading(deviceId: string): Promise<SensorReading | null> {
    try {
      const response = await fetch(`${BACKEND_API_URL}/devices/${deviceId}/reading`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reading: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        return null;
      }

      return {
        temperature: result.data.temperature,
        humidity: result.data.humidity,
        timestamp: new Date(result.data.timestamp),
      };
    } catch (error) {
      console.error('Failed to fetch reading:', error);
      return null;
    }
  }

  /**
   * Update target temperature for a device
   */
  async setTargetTemperature(deviceId: string, targetTemp: number): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_API_URL}/devices/${deviceId}/target`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetTemp }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update target: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to update target temperature:', error);
      return false;
    }
  }

  /**
   * Get device statistics
   */
  async getDeviceStats(): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_API_URL}/devices/stats`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch stats');
      }

      return result.data;
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      return null;
    }
  }

  /**
   * Check if backend is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:8080/health');
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const backendApi = new BackendApiService();
export { BACKEND_API_URL };


