import React from "react"
import { View, StyleSheet } from "react-native"
import { ThemedText } from "@/components/themed-text"

interface HealthMetricCardProps {
  icon: string
  label: string
  currentValue: string
  currentLabel: string
  recommendedValue: string
  status: "good" | "optimal" | "improve"
  statusLabel: string
}

const STATUS_COLORS = {
  good: "#00A63E",
  optimal: "#00A63E",
  improve: "#FF6900",
}

const STATUS_BG = {
  good: "#E6F4EC",
  optimal: "#E6F4EC",
  improve: "#FFF4E5",
}

export function HealthMetricCard({
  icon,
  label,
  currentValue,
  currentLabel,
  recommendedValue,
  status,
  statusLabel,
}: HealthMetricCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.header}>
          <ThemedText style={styles.icon}>{icon}</ThemedText>
          <View style={styles.labelContainer}>
            <ThemedText style={styles.label}>{label}</ThemedText>
            <ThemedText style={styles.currentLabel}>{currentLabel}</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.rightSection}>
        <ThemedText style={styles.recommendedValue}>
          {recommendedValue}
        </ThemedText>
        <View
          style={[styles.statusBadge, { backgroundColor: STATUS_BG[status] }]}
        >
          <ThemedText
            style={[styles.statusText, { color: STATUS_COLORS[status] }]}
          >
            {statusLabel}
          </ThemedText>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#D9CFC7",
  },
  leftSection: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    fontSize: 18,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: "#3A2F23",
    marginBottom: 4,
  },
  currentLabel: {
    fontSize: 16,
    color: "#C9B59C",
  },
  rightSection: {
    alignItems: "flex-end",
  },
  recommendedValue: {
    fontSize: 16,
    color: "#B8A58B",
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
})
