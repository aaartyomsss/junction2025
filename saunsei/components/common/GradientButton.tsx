import React, { useState } from "react"
import {
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  View,
  Animated,
} from "react-native"
import { ThemedText } from "@/components/themed-text"

interface GradientButtonProps {
  title: string
  icon?: string
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  variant?: "primary" | "active"
}

export function GradientButton({
  title,
  icon,
  onPress,
  style,
  variant = "primary",
}: GradientButtonProps) {
  const [scaleValue] = useState(new Animated.Value(1))

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start()
  }

  const containerStyle =
    variant === "active" ? styles.containerActive : styles.container

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[containerStyle, style, { transform: [{ scale: scaleValue }] }]}
      >
        <View style={styles.content}>
          {icon && <ThemedText style={styles.icon}>{icon}</ThemedText>}
          <ThemedText style={styles.title}>{title}</ThemedText>
        </View>
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#C9B59C",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: "#C9B59C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  containerActive: {
    backgroundColor: "#E74C3C",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: "#E74C3C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
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
