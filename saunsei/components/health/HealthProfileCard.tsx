import React from "react"
import { View, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { ThemedText } from "@/components/themed-text"

interface HealthProfileCardProps {
  avgDuration: number
  avgTemp: number
  perWeek: number
}

export function HealthProfileCard({
  avgDuration,
  avgTemp,
  perWeek,
}: HealthProfileCardProps) {
  return (
    <LinearGradient
      colors={["#C9B59C", "#BDA78F"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View style={styles.header}>
        <ThemedText style={styles.headerIcon}>🎯</ThemedText>
        <ThemedText style={styles.headerTitle}>Your Health Profile</ThemedText>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <View style={styles.statHeader}>
            <ThemedText style={styles.statIcon}>⏱️</ThemedText>
            <ThemedText style={styles.statLabel}>Avg Duration</ThemedText>
          </View>
          <ThemedText style={styles.statValue}>{avgDuration}</ThemedText>
          <ThemedText style={styles.statUnit}>minutes</ThemedText>
        </View>

        <View style={styles.statItem}>
          <View style={styles.statHeader}>
            <ThemedText style={styles.statIcon}>🌡️</ThemedText>
            <ThemedText style={styles.statLabel}>Avg Temp</ThemedText>
          </View>
          <ThemedText style={styles.statValue}>{avgTemp}°C</ThemedText>
          <ThemedText style={styles.statUnit}>celsius</ThemedText>
        </View>

        <View style={styles.statItem}>
          <View style={styles.statHeader}>
            <ThemedText style={styles.statIcon}>📅</ThemedText>
            <ThemedText style={styles.statLabel}>Per Week</ThemedText>
          </View>
          <ThemedText style={styles.statValue}>{perWeek}</ThemedText>
          <ThemedText style={styles.statUnit}>sessions</ThemedText>
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    gap: 4,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    opacity: 0.9,
  },
  statIcon: {
    fontSize: 14,
  },
  statLabel: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  statValue: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "400",
  },
  statUnit: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.75,
  },
})
