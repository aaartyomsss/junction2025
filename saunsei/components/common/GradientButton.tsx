import React from "react"
import {
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  View,
} from "react-native"
import { ThemedText } from "@/components/themed-text"

interface GradientButtonProps {
  title: string
  icon?: string
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}

export function GradientButton({
  title,
  icon,
  onPress,
  style,
}: GradientButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {icon && <ThemedText style={styles.icon}>{icon}</ThemedText>}
        <ThemedText style={styles.title}>{title}</ThemedText>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#C9B59C",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  icon: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
})
