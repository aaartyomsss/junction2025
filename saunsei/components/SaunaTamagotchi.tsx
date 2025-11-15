import React, { useEffect, useRef } from "react"
import { View, StyleSheet, Animated } from "react-native"
import { ThemedText } from "@/components/themed-text"

interface SaunaTamagotchiProps {
  name: string
  level: number
  status: string
  accessories?: string[]
}

export function SaunaTamagotchi({
  name,
  level,
  status,
  accessories = ["🥋", "😎", "👑"],
}: SaunaTamagotchiProps) {
  // Animated pulsing effect for fire emoji
  const pulseAnim = useRef(new Animated.Value(1)).current
  const glowAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Pulsing animation (reduced scale for mobile compatibility)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start()

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start()
  }, [])

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(193, 119, 103, 0.13)", "rgba(255, 107, 53, 0.3)"],
  })

  return (
    <View style={styles.container}>
      {/* Header with name and level */}
      <View style={styles.header}>
        <View style={styles.nameSection}>
          <ThemedText type="subtitle" style={styles.name}>
            {name}
          </ThemedText>
          <ThemedText style={styles.subtitle}>Saunamaster Entity</ThemedText>
        </View>
        <View style={styles.levelBadge}>
          <ThemedText style={styles.levelIcon}>⭐</ThemedText>
          <ThemedText style={styles.levelText}>Lvl {level}</ThemedText>
        </View>
      </View>

      {/* Character Display */}
      <View style={styles.characterContainer}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Animated.View
            style={[
              styles.character,
              { backgroundColor: glowColor },
            ]}
          >
            <ThemedText style={styles.emoji}>🔥</ThemedText>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Status Message */}
      <ThemedText style={styles.status}>{status}</ThemedText>

      {/* Accessories */}
      <View style={styles.accessories}>
        {accessories.map((accessory, index) => (
          <View key={index} style={styles.accessoryItem}>
            <ThemedText style={styles.accessoryEmoji}>{accessory}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9CFC7",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3A2F23",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#C9B59C",
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D9CFC7",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  levelIcon: {
    fontSize: 14,
  },
  levelText: {
    fontSize: 14,
    color: "#3A2F23",
    fontWeight: "600",
  },
  characterContainer: {
    alignItems: "center",
    marginVertical: 24,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  character: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  emoji: {
    fontSize: 60,
    lineHeight: 60,
    textAlign: "center",
  },
  status: {
    fontSize: 16,
    color: "#B8A58B",
    textAlign: "center",
    marginVertical: 16,
  },
  accessories: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#D9CFC7",
  },
  accessoryItem: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  accessoryEmoji: {
    fontSize: 20,
  },
})
