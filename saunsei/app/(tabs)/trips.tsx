import React, { useState, useEffect } from "react"
import { ScrollView, StyleSheet, ActivityIndicator } from "react-native"
import { ThemedView } from "@/components/themed-view"
import { ThemedText } from "@/components/themed-text"
import { AppHeader } from "@/components/common/AppHeader"
import { MapHeader } from "@/components/trips/MapHeader"
import { SectionHeader } from "@/components/trips/SectionHeader"
import { SaunaCard } from "@/components/trips/SaunaCard"
import { BottomNavigation } from "@/components/common/BottomNavigation"
import { backendApi, DBSauna } from "@/services/backendApi"

export default function MapScreen() {
  const [expandedSections, setExpandedSections] = useState({
    yourSaunas: true,
    sharedWithYou: true,
    publicSaunas: true,
  })
  const [saunas, setSaunas] = useState<DBSauna[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Fetch saunas from backend
  useEffect(() => {
    const fetchSaunas = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await backendApi.getSaunas(0, 100)
        setSaunas(data)
        console.log(`✓ Loaded ${data.length} saunas from backend`)
      } catch (err: any) {
        console.error("Failed to fetch saunas:", err.message)
        setError("Backend not available. Using mock data.")
      } finally {
        setLoading(false)
      }
    }

    fetchSaunas()
  }, [])

  // Function to set mock saunas as fallback

  // Mock data - Your Saunas
  const yourSaunas = [
    {
      name: "Lakeside Sauna",
      location: "Helsinki, Finland",
      rating: 4.8,
      visits: 24,
      avgTemp: "85°C",
      isOwned: true,
      sharedWith: 3,
      coordinates: { latitude: 60.1699, longitude: 24.9384 }, // Helsinki center
      attributes: [
        { icon: "🧘", label: "Recovery", rating: 5 },
        { icon: "🔥", label: "Heat Power", rating: 4 },
        { icon: "👥", label: "Social Vibe", rating: 3 },
        { icon: "🌲", label: "Nature", rating: 5 },
      ],
    },
  ]

  // Mock data - Shared With You
  const sharedSaunas = [
    {
      name: "Downtown Steam",
      location: "Espoo, Finland",
      rating: 4.6,
      visits: 8,
      avgTemp: "80°C",
      owner: "Mikko Virtanen",
      coordinates: { latitude: 60.2055, longitude: 24.6559 }, // Espoo center
      attributes: [
        { icon: "🧘", label: "Recovery", rating: 4 },
        { icon: "🔥", label: "Heat Power", rating: 5 },
        { icon: "👥", label: "Social Vibe", rating: 4 },
        { icon: "🌲", label: "Nature", rating: 2 },
      ],
    },
  ]

  // Convert backend saunas to public saunas format
  const publicSaunas = saunas.map((sauna) => ({
    name: sauna.name,
    location: `${sauna.latitude.toFixed(4)}°N, ${sauna.longitude.toFixed(4)}°E`,
    rating: sauna.rating,
    visits: Math.floor(Math.random() * 200), // Mock visits for now
    avgTemp: "85°C", // Mock temp for now
    lastVisit: "Recent",
    coordinates: { latitude: sauna.latitude, longitude: sauna.longitude },
    description: sauna.description,
    attributes: [
      { icon: "🧘", label: "Recovery", rating: sauna.rating },
      { icon: "🔥", label: "Heat Power", rating: sauna.rating },
      {
        icon: "👥",
        label: "Social Vibe",
        rating: Math.min(5, sauna.rating + 1),
      },
      { icon: "🌲", label: "Nature", rating: sauna.rating },
    ],
  }))

  const totalSaunas =
    yourSaunas.length + sharedSaunas.length + publicSaunas.length

  return (
    <ThemedView style={styles.container}>
      <AppHeader />

      {loading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2B7FFF" />
          <ThemedText style={styles.loadingText}>Loading saunas...</ThemedText>
        </ThemedView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {error && (
            <ThemedView style={styles.errorBanner}>
              <ThemedText style={styles.errorText}>⚠️ {error}</ThemedText>
            </ThemedView>
          )}

          {/* Map View */}
          <MapHeader
            saunaCount={totalSaunas}
            onAddSauna={() => console.log("Add new sauna")}
            saunas={[
              ...yourSaunas.map((s) => ({ ...s, type: "owned" as const })),
              ...sharedSaunas.map((s) => ({ ...s, type: "shared" as const })),
              ...publicSaunas.map((s) => ({ ...s, type: "public" as const })),
            ]}
          />

          {/* Your Saunas Section */}
          <SectionHeader
            title="Your Saunas"
            count={yourSaunas.length}
            badgeColor="#2B7FFF"
            isExpanded={expandedSections.yourSaunas}
            onToggle={() => toggleSection("yourSaunas")}
          />
          {expandedSections.yourSaunas && (
            <ThemedView style={styles.section}>
              {yourSaunas.map((sauna, index) => (
                <SaunaCard
                  key={index}
                  {...sauna}
                  onPress={() => console.log("Open sauna:", sauna.name)}
                />
              ))}
            </ThemedView>
          )}

          {/* Shared With You Section */}
          <SectionHeader
            title="Shared With You"
            count={sharedSaunas.length}
            badgeColor="#FF6900"
            isExpanded={expandedSections.sharedWithYou}
            onToggle={() => toggleSection("sharedWithYou")}
          />
          {expandedSections.sharedWithYou && (
            <ThemedView style={styles.section}>
              {sharedSaunas.map((sauna, index) => (
                <SaunaCard
                  key={index}
                  {...sauna}
                  onPress={() => console.log("Open sauna:", sauna.name)}
                />
              ))}
            </ThemedView>
          )}

          {/* Public Saunas Section */}
          <SectionHeader
            title="Public Saunas"
            count={publicSaunas.length}
            badgeColor="#22C55E"
            isExpanded={expandedSections.publicSaunas}
            onToggle={() => toggleSection("publicSaunas")}
          />
          {expandedSections.publicSaunas && (
            <ThemedView style={styles.section}>
              {publicSaunas.map((sauna, index) => (
                <SaunaCard
                  key={index}
                  {...sauna}
                  onPress={() => console.log("Open sauna:", sauna.name)}
                />
              ))}
            </ThemedView>
          )}

          {/* Bottom padding for navigation */}
          <ThemedView style={styles.bottomPadding} />
        </ScrollView>
      )}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F8F6",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100, // Space for bottom navigation
  },
  section: {
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  bottomPadding: {
    height: 24,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorBanner: {
    backgroundColor: "#FFF4E5",
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6900",
  },
  errorText: {
    fontSize: 14,
    color: "#663C00",
  },
})
