import React, { useState, useEffect } from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  RefreshControl, 
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { backendApi, HarviaAuthResponse } from '@/services/backendApi';
import { DeviceStatus } from '@/types/sauna';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';

// Simple token storage (in production, use expo-secure-store)
const TOKEN_KEY = 'harvia_token';
const REFRESH_TOKEN_KEY = 'harvia_refresh_token';
const EMAIL_KEY = 'harvia_email';

const getStoredToken = async (): Promise<string | null> => {
  try {
    // Using localStorage for web, or AsyncStorage for native
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(TOKEN_KEY);
    }
    return null;
  } catch {
    return null;
  }
};

const setStoredToken = async (token: string, refreshToken: string, email: string) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(TOKEN_KEY, token);
      window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      window.localStorage.setItem(EMAIL_KEY, email);
    }
  } catch (error) {
    console.error('Failed to store token:', error);
  }
};

const clearStoredTokens = async () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
      window.localStorage.removeItem(EMAIL_KEY);
    }
  } catch (error) {
    console.error('Failed to clear tokens:', error);
  }
};

// Device Card Component
interface DeviceCardProps {
  device: DeviceStatus;
  colors: typeof Colors.light;
  isExpanded: boolean;
  onPress: () => void;
  index: number;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, colors, isExpanded, onPress, index }) => {
  const getDeviceIcon = (type: string) => {
    return type === 'fenix' ? 'tune' : 'router';
  };

  const getStatusColor = (isConnected: boolean) => {
    return isConnected ? '#4CAF50' : '#f44336';
  };

  const statusColor = getStatusColor(device.isConnected);

  return (
    <TouchableOpacity
      style={[styles.deviceCard, { 
        backgroundColor: colors.card,
        borderColor: colors.border,
      }]}
      onPress={onPress}
      activeOpacity={0.7}>
      {/* Device Header */}
      <View style={styles.deviceHeader}>
        <View style={styles.deviceMainInfo}>
          <View style={[styles.deviceIconWrapper, { 
            backgroundColor: statusColor + '15' 
          }]}>
            <MaterialIcons 
              name={getDeviceIcon(device.deviceType || 'smart_sensor') as any} 
              size={26} 
              color={statusColor} 
            />
          </View>
          <View style={styles.deviceTextInfo}>
            <ThemedText type="defaultSemiBold" style={[styles.deviceName, { color: colors.text }]}>
              {device.deviceName}
            </ThemedText>
            <View style={styles.deviceLocationRow}>
              <MaterialIcons name="location-on" size={14} color={colors.textTertiary} />
              <ThemedText style={[styles.deviceLocation, { color: colors.textTertiary }]}>
                {device.location?.name || 'Unknown Location'}
              </ThemedText>
            </View>
          </View>
        </View>
        <View style={[styles.deviceStatusBadge, { backgroundColor: statusColor + '15' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <ThemedText style={[styles.deviceStatusText, { color: statusColor }]}>
            {device.isConnected ? 'Online' : 'Offline'}
          </ThemedText>
        </View>
      </View>

      {/* Device Metrics */}
      <View style={styles.deviceMetrics}>
        <View style={styles.metricRow}>
          <View style={styles.metricItemSimple}>
            <MaterialIcons name="power" size={16} color={statusColor} />
            <ThemedText style={[styles.metricValueSimple, { color: colors.text }]}>
              {device.isConnected ? 'Active' : 'Inactive'}
            </ThemedText>
          </View>
          
          {device.batteryLevel !== undefined && device.batteryLevel > 0 && (
            <View style={styles.metricItemSimple}>
              <MaterialIcons name="battery-full" size={16} color={colors.textTertiary} />
              <ThemedText style={[styles.metricValueSimple, { color: colors.text }]}>
                {Math.round(device.batteryLevel)}%
              </ThemedText>
            </View>
          )}
          
          {device.signalStrength !== undefined && device.signalStrength > 0 && (
            <View style={styles.metricItemSimple}>
              <MaterialIcons name="signal-cellular-alt" size={16} color={colors.textTertiary} />
              <ThemedText style={[styles.metricValueSimple, { color: colors.text }]}>
                {Math.round(device.signalStrength)}%
              </ThemedText>
            </View>
          )}
          
          <View style={styles.metricItemSimple}>
            <MaterialIcons name="schedule" size={16} color={colors.textTertiary} />
            <ThemedText style={[styles.metricValueSimple, { color: colors.text }]}>
              {device.isConnected 
                ? 'Now'
                : device.lastSeen 
                  ? (() => {
                      const lastSeenDate = new Date(device.lastSeen);
                      const now = new Date();
                      const diffMs = now.getTime() - lastSeenDate.getTime();
                      const diffMins = Math.floor(diffMs / 60000);
                      const diffHours = Math.floor(diffMins / 60);
                      const diffDays = Math.floor(diffHours / 24);
                      
                      if (diffMins < 1) return 'Just now';
                      if (diffMins < 60) return `${diffMins}m ago`;
                      if (diffHours < 24) return `${diffHours}h ago`;
                      if (diffDays < 7) return `${diffDays}d ago`;
                      return lastSeenDate.toLocaleDateString();
                    })()
                  : 'Unknown'}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Expanded Details */}
      {isExpanded && (
        <View style={styles.expandedDetails}>
          <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
          <ThemedText type="defaultSemiBold" style={[styles.detailSectionTitle, { color: colors.text }]}>
            Device Details
          </ThemedText>
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <ThemedText style={[styles.detailLabel, { color: colors.textTertiary }]}>
                Device ID
              </ThemedText>
              <ThemedText 
                type="defaultSemiBold" 
                style={[styles.detailValue, { color: colors.text }]}
                numberOfLines={1}
                ellipsizeMode="middle">
                {device.deviceId || 'Unknown'}
              </ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={[styles.detailLabel, { color: colors.textTertiary }]}>
                Device Name
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.detailValue, { color: colors.text }]}>
                {device.deviceName || 'Unknown'}
              </ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={[styles.detailLabel, { color: colors.textTertiary }]}>
                Type
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.detailValue, { color: colors.text }]}>
                {device.deviceType || 'Unknown'}
              </ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={[styles.detailLabel, { color: colors.textTertiary }]}>
                Brand
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.detailValue, { color: colors.text }]}>
                {device.brand || 'Unknown'}
              </ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={[styles.detailLabel, { color: colors.textTertiary }]}>
                Serial Number
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.detailValue, { color: colors.text }]}>
                {device.serialNumber || 'Unknown'}
              </ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={[styles.detailLabel, { color: colors.textTertiary }]}>
                Battery Level
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.detailValue, { color: colors.text }]}>
                {device.batteryLevel !== undefined && device.batteryLevel > 0 
                  ? `${Math.round(device.batteryLevel)}%` 
                  : 'N/A'}
              </ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={[styles.detailLabel, { color: colors.textTertiary }]}>
                Signal Strength
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.detailValue, { color: colors.text }]}>
                {device.signalStrength !== undefined && device.signalStrength > 0 
                  ? `${Math.round(device.signalStrength)}%` 
                  : 'N/A'}
              </ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={[styles.detailLabel, { color: colors.textTertiary }]}>
                Location
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.detailValue, { color: colors.text }]}>
                {device.location?.name || device.city || 'Unknown'}
              </ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={[styles.detailLabel, { color: colors.textTertiary }]}>
                City
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.detailValue, { color: colors.text }]}>
                {device.city || 'Unknown'}
              </ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={[styles.detailLabel, { color: colors.textTertiary }]}>
                Country
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.detailValue, { color: colors.text }]}>
                {device.country || 'Unknown'}
              </ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={[styles.detailLabel, { color: colors.textTertiary }]}>
                Coordinates
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.detailValue, { color: colors.text }]}>
                {device.location && device.location.latitude && device.location.longitude
                  ? `${device.location.latitude.toFixed(4)}, ${device.location.longitude.toFixed(4)}`
                  : 'N/A'}
              </ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={[styles.detailLabel, { color: colors.textTertiary }]}>
                Hardware
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.detailValue, { color: colors.text }]}>
                {device.espChip || 'Unknown'}
              </ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={[styles.detailLabel, { color: colors.textTertiary }]}>
                Firmware
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.detailValue, { color: colors.text }]}>
                {device.firmwareVersion || 'Unknown'}
              </ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={[styles.detailLabel, { color: colors.textTertiary }]}>
                Last Seen
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.detailValue, { color: colors.text }]}>
                {device.lastSeen 
                  ? new Date(device.lastSeen).toLocaleString()
                  : 'Unknown'}
              </ThemedText>
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function DevicesScreen() {
  // Force light theme to match other pages
  const colors = Colors.light;
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  
  // Harvia authentication state
  const [harviaToken, setHarviaToken] = useState<string | null>(null);
  const [useHarvia, setUseHarvia] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Load stored token on mount
  useEffect(() => {
    const loadToken = async () => {
      const token = await getStoredToken();
      if (token) {
        setHarviaToken(token);
        setUseHarvia(true);
      }
    };
    loadToken();
  }, []);

  const fetchDevices = async () => {
    try {
      // Check backend health
      const isHealthy = await backendApi.healthCheck();
      setBackendStatus(isHealthy ? 'online' : 'offline');

      if (!isHealthy) {
        setLoading(false);
        return;
      }

      let devicesData: DeviceStatus[] = [];

      if (useHarvia && harviaToken) {
        // Try to fetch real Harvia devices
        try {
          devicesData = await backendApi.getHarviaDevices(harviaToken);
          if (devicesData.length === 0) {
            // If no devices returned, token might be expired - try refresh
            console.log('No devices returned, token may be expired');
            // Fall back to mock devices for now
            devicesData = await backendApi.getDevices();
          }
        } catch (error) {
          console.error('Failed to fetch Harvia devices:', error);
          // Fall back to mock devices
          devicesData = await backendApi.getDevices();
        }
      } else {
        // Fetch mock devices
        devicesData = await backendApi.getDevices();
      }

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
  }, [useHarvia, harviaToken]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDevices();
  };

  const handleHarviaLogin = async () => {
    if (!loginEmail || !loginPassword) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoggingIn(true);
    try {
      const authResponse = await backendApi.harviaLogin(loginEmail, loginPassword);
      
      if (authResponse && authResponse.success) {
        await setStoredToken(
          authResponse.idToken,
          authResponse.refreshToken || '',
          loginEmail
        );
        setHarviaToken(authResponse.idToken);
        setUseHarvia(true);
        setShowLoginModal(false);
        setLoginEmail('');
        setLoginPassword('');
        Alert.alert('Success', 'Connected to Harvia!');
        fetchDevices();
      } else {
        Alert.alert('Error', 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to connect to Harvia. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await clearStoredTokens();
    setHarviaToken(null);
    setUseHarvia(false);
    fetchDevices();
    Alert.alert('Logged Out', 'Disconnected from Harvia');
  };

  const connectedDevices = devices.filter(d => d.isConnected).length;
  const offlineDevices = devices.filter(d => !d.isConnected).length;
  
  // Count unique device types
  const deviceTypes = devices.reduce((acc, d) => {
    const type = d.deviceType || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const totalTypes = Object.keys(deviceTypes).length;

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
          <MaterialIcons name="warning" size={64} color="#f44336" />
          <ThemedText type="title" style={styles.errorTitle}>Backend Offline</ThemedText>
          <ThemedText style={[styles.errorText, { color: colors.textTertiary }]}>
            Unable to connect to the backend API
          </ThemedText>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.tint }]}
            onPress={fetchDevices}>
            <ThemedText style={styles.retryButtonText}>Retry Connection</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />
        }>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
                Devices
              </ThemedText>
              <ThemedText style={[styles.subtitle, { color: colors.textTertiary }]}>
                {devices.length} device{devices.length !== 1 ? 's' : ''} • {connectedDevices} online
              </ThemedText>
            </View>
            <View style={[styles.statusIndicator, { 
              backgroundColor: backendStatus === 'online' ? '#4CAF5015' : '#f4433615',
            }]}>
              <View style={[styles.statusDot, { 
                backgroundColor: backendStatus === 'online' ? '#4CAF50' : '#f44336' 
              }]} />
              <ThemedText style={[styles.statusText, { 
                color: backendStatus === 'online' ? '#4CAF50' : '#f44336' 
              }]}>
                {backendStatus === 'online' ? 'Online' : 'Offline'}
              </ThemedText>
            </View>
          </View>

          {/* Harvia Connection */}
          <View style={styles.harviaSection}>
            {useHarvia ? (
              <TouchableOpacity 
                style={[styles.harviaConnectedCard, { backgroundColor: colors.card }]}
                onPress={handleLogout}
                activeOpacity={0.7}>
                <View style={styles.harviaConnectedContent}>
                  <View style={styles.harviaConnectedLeft}>
                    <View style={styles.harviaCheckmark}>
                      <Text style={styles.harviaCheckmarkText}>✓</Text>
                    </View>
                    <View>
                      <ThemedText style={[styles.harviaConnectedTitle, { color: colors.text }]}>
                        Connected to Harvia
                      </ThemedText>
                      <ThemedText style={[styles.harviaConnectedSubtitle, { color: colors.textTertiary }]}>
                        Live device data enabled
                      </ThemedText>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={handleLogout}
                    style={styles.disconnectButton}>
                    <ThemedText style={styles.disconnectText}>Disconnect</ThemedText>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.harviaConnectCard, { 
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }]}
                onPress={() => setShowLoginModal(true)}
                activeOpacity={0.7}>
                <View style={styles.harviaConnectContent}>
                  <MaterialIcons name="link" size={24} color={colors.tint} />
                  <View style={styles.harviaConnectText}>
                    <ThemedText style={[styles.harviaConnectTitle, { color: colors.text }]}>
                      Connect to Harvia
                    </ThemedText>
                    <ThemedText style={[styles.harviaConnectSubtitle, { color: colors.textTertiary }]}>
                      Access your real devices
                    </ThemedText>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={colors.tint} />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats Overview */}
        {devices.length > 0 && (
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.statIconWrapper, { backgroundColor: '#66BB6A15' }]}>
                <MaterialIcons name="check-circle" size={22} color="#4CAF50" />
              </View>
              <ThemedText type="title" style={[styles.statNumber, { color: colors.text }]}>
                {connectedDevices}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
                Online
              </ThemedText>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.statIconWrapper, { backgroundColor: '#f4433615' }]}>
                <MaterialIcons name="radio-button-unchecked" size={22} color="#f44336" />
              </View>
              <ThemedText type="title" style={[styles.statNumber, { color: colors.text }]}>
                {offlineDevices}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
                Offline
              </ThemedText>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.statIconWrapper, { backgroundColor: '#4ECDC415' }]}>
                <MaterialIcons name="build" size={22} color="#4ECDC4" />
              </View>
              <ThemedText type="title" style={[styles.statNumber, { color: colors.text }]}>
                {totalTypes}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
                Device Types
              </ThemedText>
            </View>
          </View>
        )}

        {/* Device List */}
        <View style={styles.devicesSection}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
              All Devices
            </ThemedText>
            {devices.length > 0 && (
              <ThemedText style={[styles.sectionCount, { color: colors.textTertiary }]}>
                {devices.length}
              </ThemedText>
            )}
          </View>
          
          {devices.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <MaterialIcons name="router" size={40} color={colors.textTertiary} />
              </View>
              <ThemedText type="subtitle" style={[styles.emptyTitle, { color: colors.text }]}>
                No devices found
              </ThemedText>
              <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
                {useHarvia 
                  ? 'No devices are currently available'
                  : 'Connect to Harvia to see your devices'}
              </ThemedText>
              {!useHarvia && (
                <TouchableOpacity 
                  style={[styles.emptyActionButton, { backgroundColor: colors.tint }]}
                  onPress={() => setShowLoginModal(true)}>
                  <ThemedText style={styles.emptyActionText}>Connect Now</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            devices.map((device, index) => (
              <DeviceCard
                key={device.deviceId}
                device={device}
                colors={colors}
                isExpanded={selectedDevice === device.deviceId}
                onPress={() => setSelectedDevice(
                  selectedDevice === device.deviceId ? null : device.deviceId
                )}
                index={index}
              />
            ))
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Harvia Login Modal */}
      <Modal
        visible={showLoginModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLoginModal(false)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowLoginModal(false)}
          />
          <View style={styles.modalContentWrapper}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <View>
                  <ThemedText type="title" style={[styles.modalTitle, { color: colors.text }]}>
                    Connect to Harvia
                  </ThemedText>
                  <ThemedText style={[styles.modalSubtitle, { color: colors.textTertiary }]}>
                    Sign in to access your devices
                  </ThemedText>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowLoginModal(false)}
                  style={styles.modalCloseButton}>
                  <MaterialIcons name="close" size={24} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.inputContainer}>
                  <ThemedText style={[styles.inputLabel, { color: colors.text }]}>Email</ThemedText>
                  <TextInput
                    style={[styles.input, { 
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      color: colors.text
                    }]}
                    placeholder="your@email.com"
                    placeholderTextColor={colors.textTertiary + '80'}
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <ThemedText style={[styles.inputLabel, { color: colors.text }]}>Password</ThemedText>
                  <TextInput
                    style={[styles.input, { 
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      color: colors.text
                    }]}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textTertiary + '80'}
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                    secureTextEntry
                    autoComplete="password"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.loginButton, { backgroundColor: colors.tint }]}
                  onPress={handleHarviaLogin}
                  disabled={loggingIn}
                  activeOpacity={0.8}>
                  {loggingIn ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <ThemedText style={styles.loginButtonText}>Connect</ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
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
  errorTitle: {
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Header Styles
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
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
  // Harvia Section
  harviaSection: {
    marginTop: 4,
  },
  harviaConnectCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  harviaConnectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  harviaConnectText: {
    flex: 1,
  },
  harviaConnectTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  harviaConnectSubtitle: {
    fontSize: 13,
  },
  harviaConnectedCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  harviaConnectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  harviaConnectedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  harviaCheckmark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  harviaCheckmarkText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  harviaConnectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  harviaConnectedSubtitle: {
    fontSize: 13,
  },
  disconnectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  disconnectText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f44336',
  },
  // Stats Section
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  // Devices Section
  devicesSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0EDE8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyActionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  // Device Card
  deviceCard: {
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    marginBottom: 0,
  },
  deviceMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  deviceIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceTextInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  deviceLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deviceLocation: {
    fontSize: 13,
    fontWeight: '400',
  },
  deviceStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  deviceStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Device Metrics
  deviceMetrics: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    alignItems: 'center',
  },
  metricItemSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricValueSimple: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Expanded Details
  expandedDetails: {
    marginTop: 16,
    paddingTop: 16,
  },
  detailDivider: {
    height: 1,
    marginBottom: 12,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#3A2F23',
  },
  detailGrid: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContentWrapper: {
    width: '100%',
    maxWidth: 500,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 14,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    gap: 20,
  },
  inputContainer: {
    gap: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  loginButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#C9B59C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

