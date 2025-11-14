# 🔥 Saunsei - Sauna Session Tracker

A beautiful, intuitive mobile app for tracking and sharing your sauna sessions with real-time sensor integration.

## 📱 Features

### 🎯 Dashboard
- **Live Sensor Data**: Real-time temperature and humidity monitoring from Harvia Cloud devices
- **Device Status**: Connection status, battery level, and signal strength
- **Session Control**: Start/stop sessions with automatic duration tracking
- **Statistics Overview**: View your total sessions, time spent, averages, and personal records
- **Recent Activity**: Quick access to your latest sauna session

### 🗺️ Trips
- **Session History**: Browse all your recorded sauna sessions
- **Map View**: Visual representation of sauna locations you've visited
- **Detailed Analytics**: 
  - Temperature graphs showing how heat evolved during your session
  - Average and maximum temperature tracking
  - Humidity levels
  - Session duration and notes
- **Interactive Cards**: Expand sessions to see detailed temperature charts and statistics
- **Location Tracking**: Remember where each amazing sauna experience took place

### 👥 Social
- **Community Feed**: See what other sauna enthusiasts are enjoying
- **Session Sharing**: Share your public sessions with the community
- **Interactive**: Like and comment on others' sessions
- **Rich Details**: View temperatures, locations, durations, and personal notes
- **User Profiles**: See who's having the best sauna experiences

## 🌡️ Sensor Integration

The app is designed to work with **Harvia Cloud Devices**, which provide:
- Real-time temperature monitoring (in Celsius)
- Humidity percentage tracking
- Reliable Bluetooth/WiFi connectivity
- Battery-powered operation

### Sensor Data Structure
```typescript
interface SensorReading {
  temperature: number;  // in Celsius
  humidity: number;     // in percentage
  timestamp: Date;
}
```

## 🎨 Design Philosophy

- **Modern UI**: Clean, card-based design with smooth animations
- **Dark Mode**: Full support for light and dark themes
- **Intuitive Navigation**: Three-tab structure for easy access to all features
- **Visual Feedback**: Color-coded temperatures and haptic feedback
- **Accessibility**: Large touch targets and clear typography

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Run on your device**:
   - iOS: Press `i` or run `npm run ios`
   - Android: Press `a` or run `npm run android`
   - Web: Press `w` or run `npm run web`

## 📊 Mock Data

The app currently uses mock data for demonstration. To integrate with real Harvia Cloud sensors:

1. Implement the sensor API client in `services/sensorApi.ts`
2. Replace mock data calls with real API calls
3. Add authentication for Harvia Cloud
4. Implement real-time data streaming

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Language**: TypeScript
- **Styling**: StyleSheet API with theme support
- **State Management**: React Hooks

## 📱 App Structure

```
saunsei/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx       # Dashboard screen
│   │   ├── trips.tsx       # Trip history & map
│   │   └── social.tsx      # Social feed
│   └── _layout.tsx
├── types/
│   └── sauna.ts           # TypeScript interfaces
├── services/
│   └── mockData.ts        # Mock data for demo
├── components/
│   └── ...                # Reusable UI components
└── constants/
    └── theme.ts           # Color schemes
```

## 🎯 Future Enhancements

- [ ] Real Harvia Cloud API integration
- [ ] GPS-based automatic location detection
- [ ] Health app integration (heart rate, calories)
- [ ] Session recommendations based on history
- [ ] Social challenges and achievements
- [ ] Export session data
- [ ] Multi-device support
- [ ] Session reminders and scheduling

## 🤝 Contributing

This app was created for Junction 2025. Feel free to fork and improve!

## 📄 License

MIT License - feel free to use this code for your own projects.

---

**Made with ❤️ for sauna lovers everywhere** 🇫🇮
