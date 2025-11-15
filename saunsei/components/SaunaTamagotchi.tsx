import React from "react"
import { View, StyleSheet } from "react-native"
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
        <View style={styles.character}>
          <ThemedText style={styles.emoji}>🔥</ThemedText>
        </View>
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
    backgroundColor: "linear-gradient(to bottom, #FFFFFF, #EFE9E3)",
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
    marginVertical: 16,
  },
  character: {
    width: 129,
    height: 129,
    borderRadius: 65,
    backgroundColor: "rgba(193, 119, 103, 0.13)",
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    fontSize: 20,
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
