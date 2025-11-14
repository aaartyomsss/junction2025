import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { backendApi } from '@/services/backendApi';
import { DeviceStatus } from '@/types/sauna';

export default function DevicesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  const fetchDevices = async () => {
    try {
      // Check backend health
      const isHealthy = await backendApi.healthCheck();
      setBackendStatus(isHealthy ? 'online' : 'offline');

      if (!isHealthy) {
        setLoading(false);
        return;
      }

      const devicesData = await backendApi.getDevices();
      setDevices(devicesData);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      setBackendStatus('offline');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDevices();
  };

  const getDeviceIcon = (type: string) => {
    return type === 'fenix' ? '🎛️' : '📡';
  };

  const getStatusColor = (isConnected: boolean) => {
    return isConnected ? '#4CAF50' : '#f44336';
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText style={styles.loadingText}>Loading devices...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (backendStatus === 'offline') {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <ThemedText type="title" style={styles.errorTitle}>Backend Offline</ThemedText>
          <ThemedText style={[styles.errorText, { color: colors.icon }]}>
            Unable to connect to the backend API
          </ThemedText>
          <ThemedText style={[styles.errorSubtext, { color: colors.icon }]}>
            Make sure the Go server is running on http://localhost:8080
          </ThemedText>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.tint }]}
            onPress={fetchDevices}>
            <ThemedText style={styles.retryButtonText}>Retry Connection</ThemedText>
          </TouchableOpacity>
          <View style={styles.instructionsBox}>
            <ThemedText type="defaultSemiBold" style={styles.instructionsTitle}>
              Start the backend:
            </ThemedText>
            <View style={styles.codeBox}>
              <ThemedText style={styles.codeText}>cd backend</ThemedText>
              <ThemedText style={styles.codeText}>go run main.go</ThemedText>
            </View>
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText type="title">Sauna Devices 🔥</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
              {devices.length} device{devices.length !== 1 ? 's' : ''} available
            </ThemedText>
          </View>
          <View style={[styles.backendBadge, { backgroundColor: '#4CAF5020', borderColor: '#4CAF50' }]}>
            <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
            <ThemedText style={styles.backendText}>Backend Online</ThemedText>
          </View>
        </View>

        {/* Device Count by Type */}
        <View style={styles.typeStats}>
          <View style={[styles.typeCard, { backgroundColor: colors.background }]}>
            <Text style={styles.typeIcon}>📡</Text>
            <ThemedText type="title" style={styles.typeCount}>
              {devices.filter(d => d.deviceType === 'smart_sensor').length}
            </ThemedText>
            <ThemedText style={[styles.typeLabel, { color: colors.icon }]}>
              Smart Sensors
            </ThemedText>
          </View>
          <View style={[styles.typeCard, { backgroundColor: colors.background }]}>
            <Text style={styles.typeIcon}>🎛️</Text>
            <ThemedText type="title" style={styles.typeCount}>
              {devices.filter(d => d.deviceType === 'fenix').length}
            </ThemedText>
            <ThemedText style={[styles.typeLabel, { color: colors.icon }]}>
              Fenix Panels
            </ThemedText>
          </View>
        </View>

        {/* Device List */}
        <View style={styles.devicesSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>All Devices</ThemedText>
          
          {devices.map((device) => (
            <TouchableOpacity
              key={device.deviceId}
              style={[styles.deviceCard, { backgroundColor: colors.background }]}
              onPress={() => setSelectedDevice(
                selectedDevice === device.deviceId ? null : device.deviceId
              )}>
              {/* Device Header */}
              <View style={styles.deviceHeader}>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceIcon}>{getDeviceIcon(device.deviceType || 'smart_sensor')}</Text>
                  <View style={styles.deviceDetails}>
                    <ThemedText type="defaultSemiBold" style={styles.deviceName}>
                      {device.deviceName}
                    </ThemedText>
                    <ThemedText style={[styles.deviceLocation, { color: colors.icon }]}>
                      📍 {device.location?.name || 'Unknown Location'}
                    </ThemedText>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(device.isConnected) + '20' }
                  ]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(device.isConnected) }]} />
                  <ThemedText style={[styles.statusText, { color: getStatusColor(device.isConnected) }]}>
                    {device.isConnected ? 'Online' : 'Offline'}
                  </ThemedText>
                </View>
              </View>

              {/* Device Stats */}
              <View style={styles.deviceStats}>
                <View style={styles.statBadge}>
                  <Text style={styles.statIcon}>🔋</Text>
                  <ThemedText style={styles.statText}>{device.batteryLevel}%</ThemedText>
                </View>
                <View style={styles.statBadge}>
                  <Text style={styles.statIcon}>📶</Text>
                  <ThemedText style={styles.statText}>{device.signalStrength}%</ThemedText>
                </View>
                <View style={styles.statBadge}>
                  <Text style={styles.statIcon}>🕐</Text>
                  <ThemedText style={styles.statText}>
                    {device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </ThemedText>
                </View>
              </View>

              {/* Expanded Details */}
              {selectedDevice === device.deviceId && (
                <View style={styles.expandedSection}>
                  <View style={styles.divider} />
                  <View style={styles.detailRow}>
                    <ThemedText style={{ color: colors.icon }}>Device ID:</ThemedText>
                    <ThemedText type="defaultSemiBold">{device.deviceId}</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={{ color: colors.icon }}>Type:</ThemedText>
                    <ThemedText type="defaultSemiBold">{device.deviceType}</ThemedText>
                  </View>
                  {device.location && (
                    <View style={styles.detailRow}>
                      <ThemedText style={{ color: colors.icon }}>Coordinates:</ThemedText>
                      <ThemedText type="defaultSemiBold">
                        {device.location.latitude.toFixed(4)}, {device.location.longitude.toFixed(4)}
                      </ThemedText>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 32,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  instructionsBox: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
    width: '100%',
  },
  instructionsTitle: {
    marginBottom: 12,
  },
  codeBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#4ECDC4',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  backendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  backendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  typeStats: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  typeCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  typeIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  typeCount: {
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  devicesSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  deviceCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  deviceIcon: {
    fontSize: 32,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    marginBottom: 4,
  },
  deviceLocation: {
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deviceStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: 'rgba(78, 205, 196, 0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.2)',
  },
  statIcon: {
    fontSize: 14,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expandedSection: {
    marginTop: 12,
    gap: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#CCCCCC30',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
});

