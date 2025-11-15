import React from "react"
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native"
import { ThemedText } from "@/components/themed-text"

interface StatCardProps {
  icon: string
  label: string
  value: string | number
  unit: string
  highlighted?: boolean
  style?: StyleProp<ViewStyle>
}

export function StatCard({
  icon,
  label,
  value,
  unit,
  highlighted = false,
  style,
}: StatCardProps) {
  return (
    <View
      style={[
        styles.container,
        highlighted ? styles.highlighted : styles.normal,
        style,
      ]}
    >
      <View style={styles.header}>
        <ThemedText style={styles.icon}>{icon}</ThemedText>
        <ThemedText
          style={[
            styles.label,
            highlighted ? styles.labelHighlighted : styles.labelNormal,
          ]}
        >
          {label}
        </ThemedText>
      </View>
      <ThemedText
        style={[
          styles.value,
          highlighted ? styles.valueHighlighted : styles.valueNormal,
        ]}
      >
        {value}
      </ThemedText>
      <ThemedText
        style={[
          styles.unit,
          highlighted ? styles.unitHighlighted : styles.unitNormal,
        ]}
      >
        {unit}
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    minWidth: 155,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  highlighted: {
    backgroundColor: "#C9B59C",
  },
  normal: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9CFC7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 14,
  },
  labelHighlighted: {
    color: "#FFFFFF",
    opacity: 0.9,
  },
  labelNormal: {
    color: "#C9B59C",
  },
  value: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 4,
  },
  valueHighlighted: {
    color: "#FFFFFF",
  },
  valueNormal: {
    color: "#3A2F23",
  },
  unit: {
    fontSize: 16,
  },
  unitHighlighted: {
    color: "#FFFFFF",
    opacity: 0.9,
  },
  unitNormal: {
    color: "#C9B59C",
  },
})
