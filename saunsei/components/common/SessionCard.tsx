import React, { useState } from "react"
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native"
import { Image } from "expo-image"
import { ThemedText } from "@/components/themed-text"

// Local sauna images
const saunaImages = [
  require('@/pics/saunas/saun1.jpg'),
  require('@/pics/saunas/saun2.jpg'),
  require('@/pics/saunas/saun3.jpg'),
  require('@/pics/saunas/saun4.jpg'),
  require('@/pics/saunas/saun5.jpg'),
]

// Helper function to get a consistent sauna image based on location name
// Uses a better hash function for more even distribution
const getSaunaImage = (name: string) => {
  // Create a better hash using prime number multiplication
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  // Use absolute value and modulo to get index 0-4
  const index = Math.abs(hash) % saunaImages.length
  return saunaImages[index]
}

interface SessionCardProps {
  locationName: string
  date: string
  duration: string
  avgTemp: string
  maxTemp: string
  imageIndex?: number // Optional index for round-robin image distribution
}

export function SessionCard({
  locationName,
  date,
  duration,
  avgTemp,
  maxTemp,
  imageIndex,
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
        <View style={styles.imageContainer}>
          <Image
            source={imageIndex !== undefined ? saunaImages[imageIndex % saunaImages.length] : getSaunaImage(locationName)}
            style={styles.sessionImage}
            placeholder={{ blurhash: "LKO2?U%2Tw=w]~RBVZRi};RPxuwH" }}
            contentFit="cover"
          />
        </View>
        <View style={styles.content}>
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
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: "100%",
    height: 140,
    overflow: "hidden",
  },
  sessionImage: {
    width: "100%",
    height: "100%",
  },
  content: {
    padding: 17,
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
