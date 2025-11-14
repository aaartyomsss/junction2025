import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { mockSessions } from '@/services/mockData';
import { SaunaSession } from '@/types/sauna';

const { width } = Dimensions.get('window');

export default function TripsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedSession, setSelectedSession] = useState<SaunaSession | null>(null);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTempColor = (temp: number) => {
    if (temp >= 90) return '#FF4444';
    if (temp >= 80) return '#FF8800';
    if (temp >= 70) return '#FFB800';
    return '#4CAF50';
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Your Sauna Trips</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
            {mockSessions.length} sessions recorded
          </ThemedText>
        </View>

        {/* Map Placeholder */}
        <View style={[styles.mapContainer, { backgroundColor: colors.background }]}>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapEmoji}>🗺️</Text>
            <ThemedText style={[styles.mapText, { color: colors.icon }]}>
              Map view of your sauna locations
            </ThemedText>
            <View style={styles.mapPins}>
              {mockSessions.map((session, index) => (
                <View
                  key={session.id}
                  style={[
                    styles.mapPin,
                    {
                      left: 50 + index * 80,
                      top: 60 + index * 20,
                    },
                  ]}>
                  <Text style={styles.pinIcon}>📍</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Sessions List */}
        <View style={styles.listHeader}>
          <ThemedText type="subtitle">All Sessions</ThemedText>
        </View>

        {mockSessions.map((session) => (
          <TouchableOpacity
            key={session.id}
            style={[styles.sessionCard, { backgroundColor: colors.background }]}
            onPress={() => setSelectedSession(selectedSession?.id === session.id ? null : session)}>
            <View style={styles.sessionHeader}>
              <View style={styles.sessionMain}>
                <ThemedText type="defaultSemiBold" style={styles.sessionLocation}>
                  📍 {session.location.name}
                </ThemedText>
                <ThemedText style={[styles.sessionDate, { color: colors.icon }]}>
                  {formatDate(session.startTime)} • {formatTime(session.startTime)}
                </ThemedText>
              </View>
              <View style={styles.sessionBadge}>
                <Text style={styles.sessionDuration}>{session.duration}m</Text>
              </View>
            </View>

            <View style={styles.sessionStats}>
              <View style={styles.statBadge}>
                <Text style={styles.statIcon}>🌡️</Text>
                <View>
                  <ThemedText style={styles.statLabel}>Avg Temp</ThemedText>
                  <ThemedText
                    type="defaultSemiBold"
                    style={[styles.statValue, { color: getTempColor(session.averageTemp) }]}>
                    {session.averageTemp}°C
                  </ThemedText>
                </View>
              </View>

              <View style={styles.statBadge}>
                <Text style={styles.statIcon}>🔥</Text>
                <View>
                  <ThemedText style={styles.statLabel}>Max Temp</ThemedText>
                  <ThemedText
                    type="defaultSemiBold"
                    style={[styles.statValue, { color: getTempColor(session.maxTemp) }]}>
                    {session.maxTemp}°C
                  </ThemedText>
                </View>
              </View>

              <View style={styles.statBadge}>
                <Text style={styles.statIcon}>💧</Text>
                <View>
                  <ThemedText style={styles.statLabel}>Humidity</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.statValue}>
                    {session.averageHumidity}%
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Expanded Details */}
            {selectedSession?.id === session.id && (
              <View style={styles.expandedSection}>
                <View style={styles.divider} />
                
                {/* Temperature Graph Representation */}
                <View style={styles.graphSection}>
                  <ThemedText type="defaultSemiBold" style={styles.graphTitle}>
                    Temperature Over Time
                  </ThemedText>
                  <View style={styles.miniGraph}>
                    {session.sensorReadings.slice(0, 20).map((reading, index) => {
                      const height = ((reading.temperature - 60) / 40) * 60;
                      return (
                        <View
                          key={index}
                          style={[
                            styles.graphBar,
                            {
                              height: Math.max(height, 10),
                              backgroundColor: getTempColor(reading.temperature),
                            },
                          ]}
                        />
                      );
                    })}
                  </View>
                  <View style={styles.graphLabels}>
                    <ThemedText style={[styles.graphLabel, { color: colors.icon }]}>Start</ThemedText>
                    <ThemedText style={[styles.graphLabel, { color: colors.icon }]}>
                      {session.duration}min
                    </ThemedText>
                  </View>
                </View>

                {session.notes && (
                  <View style={styles.notesSection}>
                    <ThemedText type="defaultSemiBold" style={styles.notesTitle}>
                      Notes
                    </ThemedText>
                    <ThemedText style={[styles.notesText, { color: colors.icon }]}>
                      {session.notes}
                    </ThemedText>
                  </View>
                )}

                {session.isPublic && (
                  <View style={styles.socialStats}>
                    <Text style={styles.socialIcon}>❤️ {session.likes}</Text>
                    <Text style={styles.socialIcon}>💬 {session.comments.length}</Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}

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
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  mapContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    height: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  mapText: {
    fontSize: 14,
  },
  mapPins: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  mapPin: {
    position: 'absolute',
  },
  pinIcon: {
    fontSize: 24,
  },
  listHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sessionCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sessionMain: {
    flex: 1,
  },
  sessionLocation: {
    fontSize: 16,
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 12,
  },
  sessionBadge: {
    backgroundColor: '#4ECDC420',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sessionDuration: {
    fontSize: 14,
    fontWeight: '600',
  },
  sessionStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    fontSize: 20,
  },
  statLabel: {
    fontSize: 10,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 14,
  },
  expandedSection: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#CCCCCC30',
    marginBottom: 16,
  },
  graphSection: {
    marginBottom: 16,
  },
  graphTitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  miniGraph: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    gap: 2,
    paddingHorizontal: 4,
  },
  graphBar: {
    flex: 1,
    borderRadius: 2,
    minHeight: 4,
  },
  graphLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  graphLabel: {
    fontSize: 10,
  },
  notesSection: {
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  socialStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  socialIcon: {
    fontSize: 14,
  },
});

