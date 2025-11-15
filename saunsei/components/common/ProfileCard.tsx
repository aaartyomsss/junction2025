import React, { useState } from "react"
import { View, StyleSheet, Image, TouchableOpacity, Animated } from "react-native"
import { ThemedText } from "@/components/themed-text"

interface ProfileCardProps {
  name: string
  sessionCount: number
  avatarUrl?: string
}

export function ProfileCard({
  name,
  sessionCount,
  avatarUrl,
}: ProfileCardProps) {
  const [scaleValue] = useState(new Animated.Value(1))

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
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
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <ThemedText style={styles.avatarText}>
                {name.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          )}
        </View>
        <View style={styles.infoContainer}>
          <ThemedText type="title" style={styles.name}>
            {name}
          </ThemedText>
          <ThemedText style={styles.sessions}>{sessionCount} sessions</ThemedText>
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
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#D9CFC7",
  },
  avatarPlaceholder: {
    backgroundColor: "#C9B59C",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#C9B59C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    color: "#3A2F23",
    marginBottom: 4,
  },
  sessions: {
    fontSize: 16,
    color: "#C9B59C",
  },
})
