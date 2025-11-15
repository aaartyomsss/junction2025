import React from "react"
import { View, StyleSheet } from "react-native"
import { ThemedText } from "@/components/themed-text"

interface HealthBenefitCardProps {
  icon: string
  title: string
  description: string
  height?: "small" | "large"
}

export function HealthBenefitCard({
  icon,
  title,
  description,
  height = "large",
}: HealthBenefitCardProps) {
  return (
    <View
      style={[styles.container, height === "small" && styles.containerSmall]}
    >
      <ThemedText style={styles.icon}>{icon}</ThemedText>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.description}>{description}</ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9CFC7",
    padding: 16,
    gap: 8,
    minHeight: 138,
    justifyContent: "flex-start",
    width: "48%",
  },
  containerSmall: {
    minHeight: 114,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: 16,
    color: "#3A2F23",
    fontWeight: "400",
  },
  description: {
    fontSize: 16,
    color: "#C9B59C",
  },
})
