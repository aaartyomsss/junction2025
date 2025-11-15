import React from "react"
import { View, StyleSheet, Image, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { ThemedText } from "@/components/themed-text"

interface FeedSessionCardProps {
  userName: string
  userAvatar?: string
  dateTime: string
  saunaName: string
  duration: number
  currentTemp: number
  avgTemp: number
  maxTemp: number
  calories: number
  kudos: number
  comments: number
  onKudos?: () => void
  onComment?: () => void
}

export function FeedSessionCard({
  userName,
  userAvatar,
  dateTime,
  saunaName,
  duration,
  currentTemp,
  avgTemp,
  maxTemp,
  calories,
  kudos,
  comments,
  onKudos,
  onComment,
}: FeedSessionCardProps) {
  return (
    <View style={styles.container}>
      {/* User Header */}
      <View style={styles.userHeader}>
        <View style={styles.avatar}>
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
          ) : (
            <ThemedText style={styles.avatarPlaceholder}>👤</ThemedText>
          )}
        </View>

        <View style={styles.userInfo}>
          <ThemedText style={styles.userName}>{userName}</ThemedText>
          <ThemedText style={styles.dateTime}>{dateTime}</ThemedText>
        </View>
      </View>

      {/* Session Details Card */}
      <LinearGradient
        colors={["#EFE9E3", "#D9CFC7"]}
        style={styles.detailsCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Sauna Name and Current Temp */}
        <View style={styles.titleRow}>
          <View style={styles.titleInfo}>
            <ThemedText style={styles.saunaName}>{saunaName}</ThemedText>
            <View style={styles.durationRow}>
              <ThemedText style={styles.durationIcon}>⏱️</ThemedText>
              <ThemedText style={styles.durationText}>
                {duration} minutes
              </ThemedText>
            </View>
          </View>

          <View style={styles.currentTempBadge}>
            <View style={styles.tempRow}>
              <ThemedText style={styles.tempIcon}>🌡️</ThemedText>
              <ThemedText style={styles.currentTempText}>
                {currentTemp}°C
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <ThemedText style={styles.statIconSmall}>🌡️</ThemedText>
              <ThemedText style={styles.statLabel}>Avg Temp</ThemedText>
            </View>
            <ThemedText style={styles.statValue}>{avgTemp}°C</ThemedText>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <ThemedText style={styles.statIconSmall}>🔥</ThemedText>
              <ThemedText style={styles.statLabel}>Max Temp</ThemedText>
            </View>
            <ThemedText style={styles.statValue}>{maxTemp}°C</ThemedText>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <ThemedText style={styles.statIconSmall}> </ThemedText>
              <ThemedText style={styles.statLabel}>Calories</ThemedText>
            </View>
            <ThemedText style={styles.statValue}>{calories}</ThemedText>
          </View>
        </View>
      </LinearGradient>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onKudos}>
          <ThemedText style={styles.actionIcon}>❤️</ThemedText>
          <ThemedText style={styles.actionText}>{kudos} kudos</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onComment}>
          <ThemedText style={styles.actionIcon}>💬</ThemedText>
          <ThemedText style={styles.actionText}>
            {comments} comments
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#D9CFC7",
    padding: 24,
    gap: 16,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#D9CFC7",
    overflow: "hidden",
    backgroundColor: "#F9F8F6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 16,
    color: "#3A2F23",
  },
  dateTime: {
    fontSize: 16,
    color: "#C9B59C",
  },
  detailsCard: {
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleInfo: {
    flex: 1,
    gap: 4,
  },
  saunaName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3A2F23",
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  durationIcon: {
    fontSize: 16,
  },
  durationText: {
    fontSize: 16,
    color: "#B8A58B",
  },
  currentTempBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tempRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tempIcon: {
    fontSize: 18,
  },
  currentTempText: {
    fontSize: 14,
    color: "#C9B59C",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statIconSmall: {
    fontSize: 9,
  },
  statLabel: {
    fontSize: 12,
    color: "#C9B59C",
  },
  statValue: {
    fontSize: 16,
    color: "#3A2F23",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    fontSize: 16,
    color: "#C9B59C",
  },
})
