// Sensor reading from Harvia Cloud device
export interface SensorReading {
  temperature: number; // in Celsius
  humidity: number; // in percentage
  timestamp: Date;
}

// A sauna session
export interface SaunaSession {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  averageTemp: number;
  maxTemp: number;
  averageHumidity: number;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  sensorReadings: SensorReading[];
  notes?: string;
  isPublic: boolean;
  likes: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: Date;
}

// Device connection status
export interface DeviceStatus {
  isConnected: boolean;
  deviceId: string;
  deviceName: string;
  batteryLevel?: number;
  signalStrength?: number;
}

// Statistics
export interface SaunaStats {
  totalSessions: number;
  totalDuration: number; // in minutes
  averageSessionDuration: number;
  averageTemp: number;
  maxTempReached: number;
  thisWeekSessions: number;
  thisMonthSessions: number;
}

