import React, { useState, useEffect } from "react"
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { ThemedView } from "@/components/themed-view"
import { ThemedText } from "@/components/themed-text"
import { AppHeader } from "@/components/common/AppHeader"
import { UpcomingSessionCard } from "@/components/feed/UpcomingSessionCard"
import { FeedSessionCard } from "@/components/feed/FeedSessionCard"
import {
  backendApi,
  DBSaunaSession,
  DBUser,
  DBSauna,
} from "@/services/backendApi"

export default function SocialScreen() {
  const [sessions, setSessions] = useState<DBSaunaSession[]>([])
  const [users, setUsers] = useState<Map<number, DBUser>>(new Map())
  const [saunas, setSaunas] = useState<Map<number, DBSauna>>(new Map())
  const [loading, setLoading] = useState(true)
  const [recommendation, setRecommendation] = useState<{
    recommended_duration_minutes: number
    recommended_temperature: number
    confidence: number
    based_on_sessions: number
    insights: string[]
  } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Fetch sessions, users, saunas, and recommendation in parallel
      const [sessionsData, usersData, saunasData, recommendationData] =
        await Promise.all([
          backendApi.getSessions(0, 20),
          backendApi.getDBUsers(0, 100),
          backendApi.getSaunas(0, 100),
          backendApi.getSessionRecommendation(),
        ])

      // Create lookup maps
      const usersMap = new Map(usersData.map((u) => [u.id!, u]))
      const saunasMap = new Map(saunasData.map((s) => [s.id!, s]))

      setSessions(sessionsData)
      setUsers(usersMap)
      setSaunas(saunasMap)
      setRecommendation(recommendationData)
    } catch (error) {
      console.error("Failed to load feed data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <AppHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C9B59C" />
        </View>
      </ThemedView>
    )
  }

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

        {/* AI Recommendation Card */}
        {recommendation && recommendation.based_on_sessions > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              🤖 Your Personalized Recommendation
            </ThemedText>
            <View style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <ThemedText style={styles.recommendationTitle}>
                  Optimal Session for You
                </ThemedText>
                <ThemedText style={styles.confidenceText}>
                  {Math.round(recommendation.confidence * 100)}% confidence
                </ThemedText>
              </View>

              <View style={styles.recommendationStats}>
                <View style={styles.recommendationStat}>
                  <ThemedText style={styles.statValue}>
                    {recommendation.recommended_duration_minutes} min
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Duration</ThemedText>
                </View>
                <View style={styles.recommendationDivider} />
                <View style={styles.recommendationStat}>
                  <ThemedText style={styles.statValue}>
                    {recommendation.recommended_temperature}°C
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Temperature</ThemedText>
                </View>
              </View>

              <View style={styles.insightsContainer}>
                {recommendation.insights.slice(0, 2).map((insight, index) => (
                  <ThemedText key={index} style={styles.insightText}>
                    • {insight}
                  </ThemedText>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Upcoming Sessions Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Upcoming Sessions</ThemedText>

          <View style={styles.sessionsContainer}>
            <UpcomingSessionCard
              hostName="Artjom is hosting"
              saunaName="Artjom's Home Sauna"
              dateTime="Tomorrow at 6:00 PM"
              attending={3}
              status="going"
            />

            <UpcomingSessionCard
              hostName="You are hosting"
              saunaName="Seppo's Home Sauna"
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
          {sessions.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>No sessions yet</ThemedText>
            </View>
          ) : (
            sessions.map((session) => {
              const user = users.get(session.user_id)
              const sauna = session.sauna_id
                ? saunas.get(session.sauna_id)
                : null
              const durationMinutes = Math.round(session.duration_seconds / 60)
              const calories = Math.round(durationMinutes * 6.5) // Rough estimate

              return (
                <FeedSessionCard
                  key={session.id}
                  userName={user?.full_name || user?.username || "Unknown User"}
                  dateTime={
                    session.created_at
                      ? formatDateTime(session.created_at)
                      : "Unknown"
                  }
                  saunaName={sauna?.name || "Unknown Location"}
                  duration={durationMinutes}
                  currentTemp={session.max_temperature}
                  avgTemp={session.average_temperature}
                  maxTemp={session.max_temperature}
                  calories={calories}
                  kudos={Math.floor(Math.random() * 30) + 5} // Mock for now
                  comments={Math.floor(Math.random() * 10)} // Mock for now
                />
              )
            })
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    paddingHorizontal: 24,
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#8A7F72",
  },
  recommendationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D9CFC7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recommendationHeader: {
    marginBottom: 16,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3A2F23",
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 12,
    color: "#8A7F72",
  },
  recommendationStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 16,
    marginBottom: 16,
    backgroundColor: "#F9F8F6",
    borderRadius: 8,
  },
  recommendationStat: {
    alignItems: "center",
  },
  recommendationDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#D9CFC7",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#C9B59C",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#8A7F72",
  },
  insightsContainer: {
    gap: 8,
  },
  insightText: {
    fontSize: 14,
    color: "#5A4F43",
    lineHeight: 20,
  },
})
