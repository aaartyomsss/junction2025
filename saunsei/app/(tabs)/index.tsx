import React, { useState, useEffect } from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { AppHeader } from "@/components/common/AppHeader"
import { ProfileCard } from "@/components/common/ProfileCard"
import { GradientButton } from "@/components/common/GradientButton"
import { SaunaTamagotchi } from "@/components/common/SaunaTamagotchi"
import { StatCard } from "@/components/common/StatCard"
import { SessionCard } from "@/components/common/SessionCard"
import { BottomNavigation } from "@/components/common/BottomNavigation"
import { router } from "expo-router"

export default function DashboardScreen() {
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [sessionSeconds, setSessionSeconds] = useState(0)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1)
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isSessionActive])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSessionToggle = () => {
    if (isSessionActive) {
      // Stop session
      setIsSessionActive(false)
      console.log(`Session ended: ${sessionSeconds} seconds`)
      // TODO: Save session to backend
      setSessionSeconds(0)
    } else {
      // Start session
      setIsSessionActive(true)
      setSessionSeconds(0)
    }
  }

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
          <ProfileCard name="Seppo Seppälä" sessionCount={127} />
        </View>

        {/* Start Session Button */}
        <View style={styles.section}>
          <GradientButton
            title={
              isSessionActive
                ? `Stop Session - ${formatTime(sessionSeconds)}`
                : "Start Sauna Session"
            }
            icon={isSessionActive ? "⏹️" : "▶️"}
            onPress={handleSessionToggle}
            variant={isSessionActive ? "active" : "primary"}
          />
        </View>

        {/* Sauna Wrapped Button */}
        <View style={styles.section}>
          <GradientButton
            title="View Your 2025 Sauna Wrapped"
            icon="✨"
            onPress={() => router.push("/wrapped")}
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
              imageIndex={0}
            />
            <SessionCard
              locationName="Downtown Fitness"
              date="2025-11-12"
              duration="30 min"
              avgTemp="80°C"
              maxTemp="85°C"
              imageIndex={1}
            />
            <SessionCard
              locationName="Zen Sauna Lounge"
              date="2025-11-10"
              duration="60 min"
              avgTemp="83°C"
              maxTemp="88°C"
              imageIndex={2}
            />
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
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
    paddingBottom: 100,
    alignItems: "stretch",
  },
  section: {
    marginHorizontal: 24,
    marginTop: 16,
    width: "auto",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCardHalf: {
    flex: 1,
    minWidth: 150,
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
