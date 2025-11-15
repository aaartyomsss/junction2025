import React, { useState } from "react"
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native"
import { ThemedText } from "@/components/themed-text"

interface SessionCardProps {
  locationName: string
  date: string
  duration: string
  avgTemp: string
  maxTemp: string
}

export function SessionCard({
  locationName,
  date,
  duration,
  avgTemp,
  maxTemp,
}: SessionCardProps) {
  const [scaleValue] = useState(new Animated.Value(1))

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start()
  }

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[styles.container, { transform: [{ scale: scaleValue }] }]}
      >
        <View style={styles.header}>
          <View style={styles.locationInfo}>
            <ThemedText style={styles.locationName}>{locationName}</ThemedText>
            <ThemedText style={styles.date}>{date}</ThemedText>
          </View>
          <ThemedText style={styles.duration}>{duration}</ThemedText>
        </View>

        <View style={styles.divider} />

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statIcon}>🌡️</ThemedText>
            <ThemedText style={styles.statText}>{avgTemp} avg</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statIcon}>🔥</ThemedText>
            <ThemedText style={styles.statText}>{maxTemp} max</ThemedText>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9CFC7",
    padding: 17,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    color: "#3A2F23",
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: "#C9B59C",
  },
  duration: {
    fontSize: 16,
    color: "#B8A58B",
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "#D9CFC7",
    marginBottom: 12,
  },
  stats: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statIcon: {
    fontSize: 16,
  },
  statText: {
    fontSize: 14,
    color: "#C9B59C",
  },
})
