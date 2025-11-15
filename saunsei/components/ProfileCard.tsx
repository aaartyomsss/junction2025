import React from "react"
import { View, StyleSheet, Image } from "react-native"
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
  return (
    <View style={styles.container}>
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
