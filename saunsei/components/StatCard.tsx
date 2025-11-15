import React, { useState } from "react"
import { View, StyleSheet, StyleProp, ViewStyle, Animated, TouchableOpacity } from "react-native"
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
  const [scaleValue] = useState(new Animated.Value(1))

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
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

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={style}
    >
      <Animated.View
        style={[
          styles.container,
          highlighted ? styles.highlighted : styles.normal,
          { transform: [{ scale: scaleValue }] },
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
      </Animated.View>
    </TouchableOpacity>
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
    shadowColor: "#C9B59C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
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
