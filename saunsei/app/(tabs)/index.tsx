import React from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { AppHeader } from "@/components/AppHeader"
import { ProfileCard } from "@/components/ProfileCard"
import { GradientButton } from "@/components/GradientButton"
import { SaunaTamagotchi } from "@/components/SaunaTamagotchi"
import { StatCard } from "@/components/StatCard"
import { SessionCard } from "@/components/SessionCard"
import { BottomNavigation } from "@/components/BottomNavigation"

export default function DashboardScreen() {
  return (
    <ThemedView style={styles.container}>
      <AppHeader
        notificationCount={2}
        onFindSaunaPress={() => console.log("Find Sauna")}
        onNotificationPress={() => console.log("Notifications")}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.section}>
          <ProfileCard
            name="Seppo Seppälä"
            sessionCount={127}
            avatarUrl="https://via.placeholder.com/80"
          />
        </View>

        {/* Sauna Wrapped Button */}
        <View style={styles.section}>
          <GradientButton
            title="View Your 2025 Sauna Wrapped"
            icon="✨"
            onPress={() => console.log("Sauna Wrapped")}
          />
        </View>

        {/* Sauna Tamagotchi */}
        <View style={styles.section}>
          <SaunaTamagotchi
            name="Löyly"
            level={3}
            status="🌟 Glowing with warmth!"
            accessories={["🥋", "😎", "👑"]}
          />
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <View style={styles.statsRow}>
            <StatCard
              icon="📅"
              label="This Week"
              value="4"
              unit="sessions"
              highlighted
              style={styles.statCardHalf}
            />
            <StatCard
              icon="📅"
              label="This Year"
              value="89"
              unit="sessions"
              style={styles.statCardHalf}
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              icon="⏱️"
              label="Total Time"
              value="149"
              unit="hours"
              style={styles.statCardHalf}
            />
            <StatCard
              icon="🌡️"
              label="Avg Temp"
              value="82°C"
              unit="average"
              style={styles.statCardHalf}
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              icon="🔥"
              label="Streak"
              value="12"
              unit="days"
              style={styles.statCardHalf}
            />
          </View>
        </View>

        {/* Recent Sessions */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Recent Sessions
          </ThemedText>

          <View style={styles.sessionsList}>
            <SessionCard
              locationName="Nordic Wellness Spa"
              date="2025-11-14"
              duration="45 min"
              avgTemp="85°C"
              maxTemp="90°C"
            />
            <SessionCard
              locationName="Downtown Fitness"
              date="2025-11-12"
              duration="30 min"
              avgTemp="80°C"
              maxTemp="85°C"
            />
            <SessionCard
              locationName="Zen Sauna Lounge"
              date="2025-11-10"
              duration="60 min"
              avgTemp="83°C"
              maxTemp="88°C"
            />
          </View>
        </View>

        <View style={{ height: 80 }} />
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
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginHorizontal: 24,
    marginTop: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCardHalf: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3A2F23",
    marginBottom: 16,
  },
  sessionsList: {
    gap: 12,
  },
})
