import React from "react"
import { ScrollView, StyleSheet, View, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { ThemedView } from "@/components/themed-view"
import { ThemedText } from "@/components/themed-text"
import { AppHeader } from "@/components/common/AppHeader"
import { UpcomingSessionCard } from "@/components/feed/UpcomingSessionCard"
import { FeedSessionCard } from "@/components/feed/FeedSessionCard"

export default function SocialScreen() {
  return (
    <ThemedView style={styles.container}>
      <AppHeader />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Host Sauna Session Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity activeOpacity={0.8}>
            <LinearGradient
              colors={["#C9B59C", "#BDA78F"]}
              style={styles.hostButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <ThemedText style={styles.hostButtonIcon}>➕</ThemedText>
              <ThemedText style={styles.hostButtonText}>
                Host Sauna Session
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Upcoming Sessions Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Upcoming Sessions
          </ThemedText>

          <View style={styles.sessionsContainer}>
            <UpcomingSessionCard
              hostName="Artjom is hosting"
              saunaName="Artjom&apos;s Home Sauna"
              dateTime="Tomorrow at 6:00 PM"
              attending={3}
              status="going"
            />

            <UpcomingSessionCard
              hostName="You are hosting"
              saunaName="Seppo&apos;s Home Sauna"
              dateTime="Nov 18, 10:00 AM"
              attending={2}
              status="host"
            />
          </View>
        </View>

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
        </View>

        <View style={styles.feedContainer}>
          <FeedSessionCard
            userName="Seppo Seppälä"
            dateTime="2025-11-14 at 18:30"
            saunaName="Sompasauna"
            duration={45}
            currentTemp={90}
            avgTemp={85}
            maxTemp={90}
            calories={320}
            kudos={12}
            comments={3}
          />

          <FeedSessionCard
            userName="Alexander Tamm"
            dateTime="2025-11-14 at 16:15"
            saunaName="Alex&apos;s Home Sauna"
            duration={60}
            currentTemp={88}
            avgTemp={83}
            maxTemp={88}
            calories={410}
            kudos={24}
            comments={5}
          />

          <FeedSessionCard
            userName="Mariusz Polak"
            dateTime="2025-11-13 at 20:00"
            saunaName="Unisport sauna"
            duration={30}
            currentTemp={85}
            avgTemp={80}
            maxTemp={85}
            calories={215}
            kudos={18}
            comments={2}
          />

          <FeedSessionCard
            userName="Artjom Wickström"
            dateTime="2025-11-13 at 14:45"
            saunaName="Urban Heat Studio"
            duration={50}
            currentTemp={92}
            avgTemp={88}
            maxTemp={92}
            calories={380}
            kudos={31}
            comments={7}
          />

          <FeedSessionCard
            userName="Gabi Hämäläinen"
            dateTime="2025-11-12 at 19:20"
            saunaName="Harju Sauna"
            duration={40}
            currentTemp={89}
            avgTemp={84}
            maxTemp={89}
            calories={295}
            kudos={15}
            comments={4}
          />
        </View>

        {/* Bottom padding for navigation */}
        <View style={styles.bottomPadding} />
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
  content: {
    paddingBottom: 100,
  },
  buttonSection: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 24,
    alignItems: "center",
  },
  hostButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    width: 200,
  },
  hostButtonIcon: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  hostButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3A2F23",
    marginBottom: 12,
  },
  sessionsContainer: {
    gap: 12,
  },
  feedContainer: {
    gap: 0,
  },
  bottomPadding: {
    height: 24,
  },
})

