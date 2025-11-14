import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { mockLiveSensorData, mockDeviceStatus, mockStats, mockSessions } from '@/services/mockData';
import { SensorReading } from '@/types/sauna';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [liveData, setLiveData] = useState<SensorReading>(mockLiveSensorData);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  // Simulate live sensor updates
  useEffect(() => {
    if (!isSessionActive) return;
    
    const interval = setInterval(() => {
      setLiveData({
        temperature: 75 + Math.random() * 20,
        humidity: 15 + Math.random() * 10,
        timestamp: new Date(),
      });
      setSessionDuration((prev) => prev + 1);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isSessionActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const recentSession = mockSessions[0];
  const lastSessionDate = recentSession.startTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText type="title" style={styles.greeting}>
              Welcome back! 🔥
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
              Ready for your next session?
            </ThemedText>
          </View>
        </View>

        {/* Device Status Card */}
        <View style={[styles.card, styles.deviceCard, { backgroundColor: colors.background }]}>
          <View style={styles.cardHeader}>
            <View style={styles.deviceInfo}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: mockDeviceStatus.isConnected ? '#4CAF50' : '#f44336' },
                ]}
              />
              <View>
                <ThemedText type="defaultSemiBold" style={styles.deviceName}>
                  {mockDeviceStatus.deviceName}
                </ThemedText>
                <View style={styles.statusBadge}>
                  <ThemedText style={styles.statusText}>
                    {mockDeviceStatus.isConnected ? '✓ Connected' : '✗ Disconnected'}
                  </ThemedText>
                </View>
              </View>
            </View>
            <View style={styles.deviceStats}>
              <View style={styles.statPill}>
                <Text style={styles.statEmoji}>🔋</Text>
                <ThemedText style={styles.statPillText}>{mockDeviceStatus.batteryLevel}%</ThemedText>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statEmoji}>📶</Text>
                <ThemedText style={styles.statPillText}>{mockDeviceStatus.signalStrength}%</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Live Sensor Data */}
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Live Sensor Data
          </ThemedText>
          <View style={styles.sensorGrid}>
            <View style={[styles.sensorCard, styles.temperatureCard]}>
              <Text style={styles.sensorIcon}>🌡️</Text>
              <ThemedText type="title" style={styles.sensorValue}>
                {liveData.temperature.toFixed(1)}°C
              </ThemedText>
              <ThemedText style={styles.sensorLabel}>
                Temperature
              </ThemedText>
            </View>
            <View style={[styles.sensorCard, styles.humidityCard]}>
              <Text style={styles.sensorIcon}>💧</Text>
              <ThemedText type="title" style={styles.sensorValue}>
                {liveData.humidity.toFixed(1)}%
              </ThemedText>
              <ThemedText style={styles.sensorLabel}>
                Humidity
              </ThemedText>
            </View>
          </View>

          {/* Session Control */}
          <TouchableOpacity
            style={[
              styles.sessionButton,
              isSessionActive ? styles.stopButton : styles.startButton,
            ]}
            onPress={() => {
              setIsSessionActive(!isSessionActive);
              if (isSessionActive) {
                setSessionDuration(0);
              }
            }}>
            <Text style={styles.buttonIcon}>{isSessionActive ? '⏹' : '▶️'}</Text>
            <Text style={styles.buttonText}>
              {isSessionActive ? `Stop Session (${formatDuration(sessionDuration)})` : 'Start Session'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Your Statistics
          </ThemedText>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText type="title" style={styles.statValue}>
                {mockStats.totalSessions}
              </ThemedText>
              <ThemedText style={[styles.smallText, { color: colors.icon }]}>
                Total Sessions
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="title" style={styles.statValue}>
                {Math.floor(mockStats.totalDuration / 60)}h
              </ThemedText>
              <ThemedText style={[styles.smallText, { color: colors.icon }]}>
                Total Time
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="title" style={styles.statValue}>
                {mockStats.averageSessionDuration}
              </ThemedText>
              <ThemedText style={[styles.smallText, { color: colors.icon }]}>
                Avg. Minutes
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="title" style={styles.statValue}>
                {mockStats.maxTempReached}°C
              </ThemedText>
              <ThemedText style={[styles.smallText, { color: colors.icon }]}>
                Max Temp
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <View style={styles.cardHeader}>
            <ThemedText type="subtitle">Recent Session</ThemedText>
            <ThemedText style={[styles.smallText, { color: colors.icon }]}>
              {lastSessionDate}
            </ThemedText>
          </View>
          <View style={styles.recentSession}>
            <View style={styles.sessionRow}>
              <ThemedText style={{ color: colors.icon }}>📍 {recentSession.location.name}</ThemedText>
            </View>
            <View style={styles.sessionRow}>
              <ThemedText style={{ color: colors.icon }}>
                ⏱️ {recentSession.duration} minutes
              </ThemedText>
              <ThemedText style={{ color: colors.icon }}>
                🌡️ {recentSession.averageTemp}°C avg
              </ThemedText>
            </View>
            {recentSession.notes && (
              <ThemedText style={[styles.sessionNotes, { color: colors.icon }]}>
                "{recentSession.notes}"
              </ThemedText>
            )}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 16,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deviceCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  deviceName: {
    fontSize: 16,
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusBadge: {
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  deviceStats: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(78, 205, 196, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  statEmoji: {
    fontSize: 12,
  },
  statPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sensorGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  sensorCard: {
    flex: 1,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  temperatureCard: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF8787',
  },
  humidityCard: {
    backgroundColor: '#4ECDC4',
    borderColor: '#6EE7E0',
  },
  sensorIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  sensorValue: {
    marginBottom: 6,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sensorLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '600',
  },
  sessionButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#66BB6A',
  },
  stopButton: {
    backgroundColor: '#f44336',
    borderColor: '#FF6B6B',
  },
  buttonIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(78, 205, 196, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.2)',
  },
  statValue: {
    marginBottom: 6,
  },
  smallText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  recentSession: {
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  sessionNotes: {
    fontStyle: 'italic',
    fontSize: 14,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 107, 107, 0.2)',
  },
});
