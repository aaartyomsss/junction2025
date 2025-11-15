import React from "react"
import { View, StyleSheet, TouchableOpacity } from "react-native"
import { ThemedText } from "@/components/themed-text"

interface SectionHeaderProps {
  title: string
  count: number
  badgeColor: string
  isExpanded?: boolean
  onToggle?: () => void
}

export function SectionHeader({
  title,
  count,
  badgeColor,
  isExpanded = true,
  onToggle,
}: SectionHeaderProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <ThemedText style={styles.badgeText}>{count}</ThemedText>
        </View>
      </View>
      {onToggle && (
        <ThemedText style={styles.chevron}>{isExpanded ? "▼" : "▶"}</ThemedText>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3A2F23",
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: "center",
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  chevron: {
    fontSize: 12,
    color: "#C9B59C",
  },
})
