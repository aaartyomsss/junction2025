import React, { useState } from "react"
import { ScrollView, StyleSheet } from "react-native"
import { ThemedView } from "@/components/themed-view"
import { AppHeader } from "@/components/AppHeader"
import { MapHeader } from "@/components/MapHeader"
import { SectionHeader } from "@/components/SectionHeader"
import { SaunaCard } from "@/components/SaunaCard"
import { BottomNavigation } from "@/components/BottomNavigation"

export default function MapScreen() {
  const [expandedSections, setExpandedSections] = useState({
    yourSaunas: true,
    sharedWithYou: true,
    publicSaunas: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

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

  // Mock data - Public Saunas
  const publicSaunas = [
    {
      name: "Allas Sea Pool",
      location: "Helsinki, Finland",
      rating: 4.9,
      visits: 156,
      avgTemp: "90°C",
      lastVisit: "2 days ago",
      coordinates: { latitude: 60.1641, longitude: 24.9561 }, // Allas Sea Pool actual location
      attributes: [
        { icon: "🧘", label: "Recovery", rating: 5 },
        { icon: "🔥", label: "Heat Power", rating: 5 },
        { icon: "👥", label: "Social Vibe", rating: 5 },
        { icon: "🌲", label: "Nature", rating: 4 },
      ],
    },
    {
      name: "Löyly Helsinki",
      location: "Helsinki, Finland",
      rating: 4.7,
      visits: 89,
      avgTemp: "85°C",
      lastVisit: "1 week ago",
      coordinates: { latitude: 60.1515, longitude: 24.9249 }, // Löyly actual location
      attributes: [
        { icon: "🧘", label: "Recovery", rating: 4 },
        { icon: "🔥", label: "Heat Power", rating: 4 },
        { icon: "👥", label: "Social Vibe", rating: 5 },
        { icon: "🌲", label: "Nature", rating: 5 },
      ],
    },
  ]

  const totalSaunas =
    yourSaunas.length + sharedSaunas.length + publicSaunas.length

  return (
    <ThemedView style={styles.container}>
      <AppHeader />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
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

      <BottomNavigation />
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
})
