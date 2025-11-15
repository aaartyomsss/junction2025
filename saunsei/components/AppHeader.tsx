import React from "react"
import { View, StyleSheet, TouchableOpacity } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ThemedText } from "@/components/themed-text"

interface AppHeaderProps {
  notificationCount?: number
  onFindSaunaPress?: () => void
  onNotificationPress?: () => void
}

export function AppHeader({
  notificationCount = 0,
  onFindSaunaPress,
  onNotificationPress,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.titleSection}>
        <ThemedText type="title" style={styles.title}>
          saunsAI
        </ThemedText>
        <ThemedText style={styles.subtitle}>powered by Harvia</ThemedText>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.findButton}
          onPress={onFindSaunaPress}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.findIcon}>📍</ThemedText>
          <ThemedText style={styles.findText}>Find Sauna</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.notificationIcon}>🔔</ThemedText>
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>
                {notificationCount}
              </ThemedText>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#D9CFC7",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#B8A58B",
  },
  subtitle: {
    fontSize: 10,
    color: "#52493E",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  findButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(229, 229, 229, 0.3)",
    borderWidth: 1,
    borderColor: "#D9CFC7",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  findIcon: {
    fontSize: 16,
  },
  findText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3A2F23",
  },
  notificationButton: {
    backgroundColor: "rgba(229, 229, 229, 0.3)",
    borderWidth: 1,
    borderColor: "#D9CFC7",
    borderRadius: 8,
    padding: 8,
    width: 38,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationIcon: {
    fontSize: 16,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FB2C36",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9CFC7",
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
  },
})
