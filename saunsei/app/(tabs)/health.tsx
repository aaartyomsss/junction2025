import React from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { ThemedView } from "@/components/themed-view"
import { ThemedText } from "@/components/themed-text"
import { AppHeader } from "@/components/common/AppHeader"
import { HealthProfileCard } from "@/components/health/HealthProfileCard"
import { HealthMetricCard } from "@/components/health/HealthMetricCard"
import { HealthBenefitCard } from "@/components/health/HealthBenefitCard"

export default function HealthScreen() {
  return (
    <ThemedView style={styles.container}>
      <AppHeader />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Health Profile Card */}
        <View style={styles.section}>
          <HealthProfileCard avgDuration={42} avgTemp={82} perWeek={3.5} />
        </View>

        {/* Recommended For You Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <ThemedText style={styles.sectionIcon}>✨</ThemedText>
            </View>
            <ThemedText style={styles.sectionTitle}>
              Recommended For You
            </ThemedText>
          </View>

          <View style={styles.metricsCard}>
            <HealthMetricCard
              icon="⏱️"
              label="Session Duration"
              currentValue="Current: 42 min"
              currentLabel="Current: 42 min"
              recommendedValue="45 min"
              status="good"
              statusLabel="good"
            />
            <HealthMetricCard
              icon="🌡️"
              label="Temperature"
              currentValue="Current: 82°C"
              currentLabel="Current: 82°C"
              recommendedValue="80-85°C"
              status="optimal"
              statusLabel="optimal"
            />
            <HealthMetricCard
              icon="📅"
              label="Weekly Frequency"
              currentValue="Current: 3.5x/week"
              currentLabel="Current: 3.5x/week"
              recommendedValue="4x per week"
              status="good"
              statusLabel="good"
            />
            <View style={styles.bestTimeContainer}>
              <View style={styles.bestTimeLeft}>
                <ThemedText style={styles.bestTimeIcon}>⏰</ThemedText>
                <View>
                  <ThemedText style={styles.bestTimeLabel}>
                    Best Time
                  </ThemedText>
                  <ThemedText style={styles.bestTimeSubtext}>
                    Based on your patterns
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={styles.bestTimeValue}>
                Evening{"\n"}(6-9 PM)
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Health Benefits Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitlePlain}>
            Your Health Benefits
          </ThemedText>

          <View style={styles.benefitsGrid}>
            <HealthBenefitCard
              icon="❤️"
              title="Cardiovascular"
              description="↓50% heart disease risk"
            />
            <HealthBenefitCard
              icon="🧠"
              title="Mental Clarity"
              description="Stress relief"
            />
            <HealthBenefitCard
              icon="💧"
              title="Detoxification"
              description="Deep cleansing"
              height="small"
            />
            <HealthBenefitCard
              icon="💪"
              title="Recovery"
              description="↑30% faster"
              height="small"
            />
            <HealthBenefitCard
              icon="🛡️"
              title="Immunity"
              description="Stronger defense"
            />
            <HealthBenefitCard
              icon="🌙"
              title="Sleep Quality"
              description="Deeper rest"
            />
          </View>
        </View>

        {/* This Month's Progress */}
        <View style={styles.section}>
          <LinearGradient
            colors={["#EFE9E3", "#D9CFC7"]}
            style={styles.progressCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.progressHeader}>
              <ThemedText style={styles.progressIcon}>📊</ThemedText>
              <ThemedText style={styles.progressTitle}>
                This Month&apos;s Progress
              </ThemedText>
            </View>

            <View style={styles.progressStats}>
              <View style={styles.progressStatItem}>
                <ThemedText style={styles.progressStatLabel}>Streak</ThemedText>
                <ThemedText style={styles.progressStatValue}>12</ThemedText>
                <ThemedText style={styles.progressStatEmoji}>
                  🔥 Keep going!
                </ThemedText>
              </View>

              <View style={styles.progressStatItem}>
                <ThemedText style={styles.progressStatLabel}>
                  Calories
                </ThemedText>
                <ThemedText style={styles.progressStatValue}>4.1k</ThemedText>
                <ThemedText style={styles.progressStatSubtext}>
                  avg 294{"\n"}per{"\n"}session
                </ThemedText>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Tip Box */}
        <View style={styles.section}>
          <View style={styles.tipCard}>
            <View style={styles.tipContent}>
              <ThemedText style={styles.tipEmoji}>💡</ThemedText>
              <View style={styles.tipTextContainer}>
                <ThemedText style={styles.tipLabel}>Tip:</ThemedText>
                <ThemedText style={styles.tipText}>
                  Add <ThemedText style={styles.tipBold}>3 minutes</ThemedText>{" "}
                  to your sessions this week to reach optimal duration!
                </ThemedText>
              </View>
            </View>
          </View>
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
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 32,
    backgroundColor: "linear-gradient(135deg, #C9B59C 0%, #BDA78F 100%)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3A2F23",
  },
  sectionTitlePlain: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3A2F23",
    marginBottom: 12,
  },
  metricsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9CFC7",
    padding: 20,
  },
  bestTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  bestTimeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bestTimeIcon: {
    fontSize: 15,
  },
  bestTimeLabel: {
    fontSize: 16,
    color: "#3A2F23",
    marginBottom: 4,
  },
  bestTimeSubtext: {
    fontSize: 16,
    color: "#C9B59C",
  },
  bestTimeValue: {
    fontSize: 16,
    color: "#B8A58B",
    textAlign: "right",
  },
  benefitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  progressCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9CFC7",
    padding: 20,
    gap: 16,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressIcon: {
    fontSize: 20,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3A2F23",
  },
  progressStats: {
    flexDirection: "row",
    gap: 16,
  },
  progressStatItem: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  progressStatLabel: {
    fontSize: 16,
    color: "#C9B59C",
  },
  progressStatValue: {
    fontSize: 16,
    color: "#3A2F23",
    textAlign: "center",
  },
  progressStatEmoji: {
    fontSize: 16,
    color: "#00A63E",
    textAlign: "center",
  },
  progressStatSubtext: {
    fontSize: 16,
    color: "#C9B59C",
    textAlign: "center",
  },
  tipCard: {
    backgroundColor: "#E6F4FE",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9CFC7",
    padding: 16,
  },
  tipContent: {
    flexDirection: "row",
    gap: 8,
  },
  tipEmoji: {
    fontSize: 16,
    color: "#1C398E",
  },
  tipTextContainer: {
    flex: 1,
  },
  tipLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1C398E",
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: "#1C398E",
    lineHeight: 20,
  },
  tipBold: {
    fontWeight: "700",
  },
  bottomPadding: {
    height: 24,
  },
})
