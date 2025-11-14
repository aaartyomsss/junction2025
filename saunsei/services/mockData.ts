import { SaunaSession, SensorReading, SaunaStats, DeviceStatus } from '@/types/sauna';

// Generate mock sensor readings for a session
export function generateMockReadings(duration: number): SensorReading[] {
  const readings: SensorReading[] = [];
  const now = new Date();
  const interval = 60000; // 1 minute
  
  for (let i = 0; i < duration; i++) {
    readings.push({
      temperature: 75 + Math.random() * 15 + (i / duration) * 10, // gradual increase
      humidity: 15 + Math.random() * 10,
      timestamp: new Date(now.getTime() - (duration - i) * interval),
    });
  }
  
  return readings;
}

// Mock current live sensor data
export const mockLiveSensorData: SensorReading = {
  temperature: 82.5,
  humidity: 18.3,
  timestamp: new Date(),
};

// Mock device status
export const mockDeviceStatus: DeviceStatus = {
  isConnected: true,
  deviceId: 'HARVIA-001',
  deviceName: 'Sauna Sensor Pro',
  batteryLevel: 87,
  signalStrength: 95,
};

// Mock past sessions
export const mockSessions: SaunaSession[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'You',
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
    duration: 45,
    averageTemp: 82,
    maxTemp: 92,
    averageHumidity: 20,
    location: {
      name: 'Home Sauna',
      latitude: 60.1695, 
      longitude: 24.9354,
    },
    sensorReadings: generateMockReadings(45),
    notes: 'Great session! Felt very relaxing.',
    isPublic: true,
    likes: 12,
    comments: [],
  },
  {
    id: '2',
    userId: 'user1',
    userName: 'You',
    startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    duration: 30,
    averageTemp: 78,
    maxTemp: 85,
    averageHumidity: 18,
    location: {
      name: 'Home Sauna',
      latitude: 60.1695,
      longitude: 24.9354,
    },
    sensorReadings: generateMockReadings(30),
    isPublic: false,
    likes: 0,
    comments: [],
  },
  {
    id: '3',
    userId: 'user1',
    userName: 'You',
    startTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
    duration: 60,
    averageTemp: 85,
    maxTemp: 95,
    averageHumidity: 22,
    location: {
      name: 'Helsinki Public Sauna',
      latitude: 60.1733,
      longitude: 24.9410,
    },
    sensorReadings: generateMockReadings(60),
    notes: 'Long session at the public sauna. Amazing!',
    isPublic: true,
    likes: 25,
    comments: [
      {
        id: 'c1',
        userId: 'user2',
        userName: 'Mika',
        text: 'Looks like a great session!',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ],
  },
];

// Mock social feed (other users' sessions)
export const mockSocialFeed: SaunaSession[] = [
  {
    id: 's1',
    userId: 'user2',
    userName: 'Mika Virtanen',
    userAvatar: '👨‍🦰',
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    duration: 50,
    averageTemp: 80,
    maxTemp: 88,
    averageHumidity: 19,
    location: {
      name: 'Löyly Helsinki',
      latitude: 60.1533,
      longitude: 24.9310,
    },
    sensorReadings: generateMockReadings(50),
    notes: 'Perfect evening sauna by the sea! 🌊',
    isPublic: true,
    likes: 34,
    comments: [
      {
        id: 'c2',
        userId: 'user3',
        userName: 'Anna',
        text: 'Löyly is the best! 😍',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: 's2',
    userId: 'user3',
    userName: 'Anna Korhonen',
    userAvatar: '👩',
    startTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 5.5 * 60 * 60 * 1000),
    duration: 35,
    averageTemp: 75,
    maxTemp: 82,
    averageHumidity: 17,
    location: {
      name: 'Kotiharju Sauna',
      latitude: 60.1825,
      longitude: 24.9525,
    },
    sensorReadings: generateMockReadings(35),
    notes: 'Traditional Finnish sauna experience ❤️',
    isPublic: true,
    likes: 28,
    comments: [],
  },
  {
    id: 's3',
    userId: 'user4',
    userName: 'Jukka Nieminen',
    userAvatar: '🧔',
    startTime: new Date(Date.now() - 12 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 11 * 60 * 60 * 1000),
    duration: 40,
    averageTemp: 88,
    maxTemp: 98,
    averageHumidity: 25,
    location: {
      name: 'Allas Sea Pool',
      latitude: 60.1650,
      longitude: 24.9560,
    },
    sensorReadings: generateMockReadings(40),
    notes: 'Hot sauna + cold sea = perfection! 🔥❄️',
    isPublic: true,
    likes: 45,
    comments: [
      {
        id: 'c3',
        userId: 'user2',
        userName: 'Mika',
        text: 'Need to try this place!',
        timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000),
      },
      {
        id: 'c4',
        userId: 'user5',
        userName: 'Sari',
        text: 'The best combo ever!',
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
      },
    ],
  },
];

// Mock statistics
export const mockStats: SaunaStats = {
  totalSessions: 47,
  totalDuration: 2180, // minutes
  averageSessionDuration: 46,
  averageTemp: 82,
  maxTempReached: 98,
  thisWeekSessions: 3,
  thisMonthSessions: 12,
};

