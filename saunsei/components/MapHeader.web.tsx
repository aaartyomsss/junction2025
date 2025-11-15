import React from "react"
import { View, StyleSheet, TouchableOpacity } from "react-native"
import { ThemedText } from "@/components/themed-text"

interface SaunaLocation {
  name: string
  coordinates: {
    latitude: number
    longitude: number
  }
  type: "owned" | "shared" | "public"
}

interface MapHeaderProps {
  saunaCount: number
  onAddSauna?: () => void
  saunas?: SaunaLocation[]
}

export function MapHeader({ saunaCount, onAddSauna, saunas = [] }: MapHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Map Visualization - Web Fallback */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <ThemedText style={styles.placeholderText}>
            📍 Map view available on mobile app
          </ThemedText>
          <ThemedText style={styles.placeholderSubtext}>
            {saunas.length} sauna location{saunas.length !== 1 ? 's' : ''} available
          </ThemedText>
        </View>

        {/* Add Sauna Button */}
        {onAddSauna && (
          <TouchableOpacity
            style={styles.addSaunaButton}
            onPress={onAddSauna}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.addSaunaText}>+ Add Sauna</ThemedText>
          </TouchableOpacity>
        )}

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
    borderWidth: 1,
    borderColor: "#D9CFC7",
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8E3DD",
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3A2F23",
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: "#6B5D4F",
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

