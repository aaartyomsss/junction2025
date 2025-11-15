import React from "react"
import { View, StyleSheet, TouchableOpacity } from "react-native"
import { ThemedText } from "@/components/themed-text"

interface MapHeaderProps {
  saunaCount: number
  onAddSauna?: () => void
}

export function MapHeader({ saunaCount, onAddSauna }: MapHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Map Visualization */}
      <View style={styles.mapContainer}>
        {/* Location Pins */}
        <View style={[styles.pin, styles.pinBrown, { top: 120, left: 60 }]}>
          <ThemedText style={styles.pinText}>📍</ThemedText>
        </View>
        <View style={[styles.pin, styles.pinBlue, { top: 80, left: 160 }]}>
          <ThemedText style={styles.pinText}>📍</ThemedText>
        </View>
        <View style={[styles.pin, styles.pinOrange, { top: 140, left: 220 }]}>
          <ThemedText style={styles.pinText}>📍</ThemedText>
        </View>
        <View style={[styles.pin, styles.pinBrown, { top: 180, left: 100 }]}>
          <ThemedText style={styles.pinText}>📍</ThemedText>
        </View>

        {/* Add Sauna Button */}
        <TouchableOpacity
          style={styles.addSaunaButton}
          onPress={onAddSauna}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.addSaunaText}>+ Add Sauna</ThemedText>
        </TouchableOpacity>

        {/* Saunas Available Badge */}
        <View style={styles.countBadge}>
          <ThemedText style={styles.countText}>
            Saunas Available: {saunaCount}
          </ThemedText>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  mapContainer: {
    height: 320,
    backgroundColor: "#F9F8F6",
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    position: "relative",
    overflow: "hidden",
    // Subtle gradient effect with border
    borderWidth: 1,
    borderColor: "#D9CFC7",
  },
  pin: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pinBrown: {
    backgroundColor: "#C9B59C",
  },
  pinBlue: {
    backgroundColor: "#2B7FFF",
  },
  pinOrange: {
    backgroundColor: "#FF6900",
  },
  pinText: {
    fontSize: 16,
  },
  addSaunaButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#C9B59C",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  addSaunaText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  countBadge: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#D9CFC7",
  },
  countText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3A2F23",
  },
})
