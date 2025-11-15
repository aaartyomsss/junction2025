import React from "react"
import { View, StyleSheet, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { ThemedText } from "@/components/themed-text"

interface UpcomingSessionCardProps {
  hostName: string
  hostAvatar?: string
  saunaName: string
  dateTime: string
  attending: number
  status: "going" | "host"
}

export function UpcomingSessionCard({
  hostName,
  hostAvatar,
  saunaName,
  dateTime,
  attending,
  status,
}: UpcomingSessionCardProps) {
  const statusColors = {
    going: { bg: "#D1FAE5", text: "#008236" },
    host: { bg: "#DBEAFE", text: "#1447E6" },
  }

  const statusLabels = {
    going: "Going",
    host: "Host",
  }

  return (
    <LinearGradient
      colors={["#EFE9E3", "#D9CFC7"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {/* User and Status Row */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          {hostAvatar ? (
            <Image source={{ uri: hostAvatar }} style={styles.avatarImage} />
          ) : (
            <ThemedText style={styles.avatarPlaceholder}>👤</ThemedText>
          )}
        </View>

        <View style={styles.userInfo}>
          <ThemedText style={styles.hostName}>{hostName}</ThemedText>
          <View style={styles.locationRow}>
            <ThemedText style={styles.locationIcon}>📍</ThemedText>
            <ThemedText style={styles.saunaName}>{saunaName}</ThemedText>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColors[status].bg },
          ]}
        >
          <ThemedText
            style={[styles.statusText, { color: statusColors[status].text }]}
          >
            {statusLabels[status]}
          </ThemedText>
        </View>
      </View>

      {/* Date and Attending Info */}
      <View style={styles.footer}>
        <View style={styles.infoRow}>
          <ThemedText style={styles.icon}>🕐</ThemedText>
          <ThemedText style={styles.infoText}>{dateTime}</ThemedText>
        </View>

        <View style={styles.infoRow}>
          <ThemedText style={styles.icon}>👥</ThemedText>
          <ThemedText style={styles.infoText}>{attending} attending</ThemedText>
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9CFC7",
    padding: 18,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D9CFC7",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    fontSize: 20,
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  hostName: {
    fontSize: 16,
    color: "#3A2F23",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationIcon: {
    fontSize: 12,
  },
  saunaName: {
    fontSize: 12,
    color: "#C9B59C",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "400",
  },
  footer: {
    flexDirection: "row",
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  icon: {
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
    color: "#B8A58B",
  },
})
