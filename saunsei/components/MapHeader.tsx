import React from "react"
import { View, StyleSheet, TouchableOpacity } from "react-native"
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps"
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
  const getPinColor = (type: "owned" | "shared" | "public") => {
    switch (type) {
      case "owned":
        return "#C9B59C" // Brown
      case "shared":
        return "#2B7FFF" // Blue
      case "public":
        return "#FF6900" // Orange
      default:
        return "#C9B59C"
    }
  }

  return (
    <View style={styles.container}>
      {/* Map Visualization */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 60.1699,
            longitude: 24.9384,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          }}
          provider={PROVIDER_DEFAULT}
        >
          {/* Render sauna markers */}
          {saunas.map((sauna, index) => (
            <Marker
              key={`${sauna.name}-${index}`}
              coordinate={{
                latitude: sauna.coordinates.latitude,
                longitude: sauna.coordinates.longitude,
              }}
              pinColor={getPinColor(sauna.type)}
              title={sauna.name}
            />
          ))}
        </MapView>

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
    borderWidth: 1,
    borderColor: "#D9CFC7",
  },
  map: {
    flex: 1,
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
