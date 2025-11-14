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
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <View style={styles.cardHeader}>
            <View style={styles.deviceInfo}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: mockDeviceStatus.isConnected ? '#4CAF50' : '#f44336' },
                ]}
              />
              <View>
                <ThemedText type="defaultSemiBold">{mockDeviceStatus.deviceName}</ThemedText>
                <ThemedText style={[styles.smallText, { color: colors.icon }]}>
                  {mockDeviceStatus.isConnected ? 'Connected' : 'Disconnected'}
                </ThemedText>
              </View>
            </View>
            <View style={styles.deviceStats}>
              <Text style={[styles.smallText, { color: colors.icon }]}>
                🔋 {mockDeviceStatus.batteryLevel}%
              </Text>
              <Text style={[styles.smallText, { color: colors.icon }]}>
                📶 {mockDeviceStatus.signalStrength}%
              </Text>
            </View>
          </View>
        </View>

        {/* Live Sensor Data */}
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Live Sensor Data
          </ThemedText>
          <View style={styles.sensorGrid}>
            <View style={[styles.sensorCard, { backgroundColor: '#FF6B6B20' }]}>
              <Text style={styles.sensorIcon}>🌡️</Text>
              <ThemedText type="title" style={styles.sensorValue}>
                {liveData.temperature.toFixed(1)}°C
              </ThemedText>
              <ThemedText style={[styles.smallText, { color: colors.icon }]}>
                Temperature
              </ThemedText>
            </View>
            <View style={[styles.sensorCard, { backgroundColor: '#4ECDC420' }]}>
              <Text style={styles.sensorIcon}>💧</Text>
              <ThemedText type="title" style={styles.sensorValue}>
                {liveData.humidity.toFixed(1)}%
              </ThemedText>
              <ThemedText style={[styles.smallText, { color: colors.icon }]}>
                Humidity
              </ThemedText>
            </View>
          </View>

          {/* Session Control */}
          <TouchableOpacity
            style={[
              styles.sessionButton,
              {
                backgroundColor: isSessionActive ? '#f44336' : colors.tint,
              },
            ]}
            onPress={() => {
              setIsSessionActive(!isSessionActive);
              if (isSessionActive) {
                setSessionDuration(0);
              }
            }}>
            <ThemedText type="defaultSemiBold" style={styles.buttonText}>
              {isSessionActive ? `Stop Session (${formatDuration(sessionDuration)})` : 'Start Session'}
            </ThemedText>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  deviceStats: {
    alignItems: 'flex-end',
    gap: 4,
  },
  sensorGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  sensorCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  sensorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  sensorValue: {
    marginBottom: 4,
  },
  sessionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
  },
  statValue: {
    marginBottom: 4,
  },
  smallText: {
    fontSize: 12,
    textAlign: 'center',
  },
  recentSession: {
    gap: 12,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionNotes: {
    fontStyle: 'italic',
    fontSize: 14,
    marginTop: 8,
  },
});
