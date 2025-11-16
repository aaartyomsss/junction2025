import React, { useState } from "react"
import { View, StyleSheet, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { ThemedText } from "@/components/themed-text"
import { router } from "expo-router"

export default function SaunaWrappedModal() {
  const [currentStep, setCurrentStep] = useState(0)

  const handleClose = () => {
    router.back()
  }

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderProgressBar = () => {
    return (
      <View style={styles.progressContainer}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index <= currentStep
                ? styles.progressDotActive
                : styles.progressDotInactive,
            ]}
          />
        ))}
      </View>
    )
  }

  const renderScreen = () => {
    switch (currentStep) {
      case 0:
        return renderIntroScreen()
      case 1:
        return renderTotalSessionsScreen()
      case 2:
        return renderTimeInHeatScreen()
      case 3:
        return renderFavoriteSpotScreen()
      case 4:
        return renderHeatToleranceScreen()
      case 5:
        return renderConsistencyScreen()
      case 6:
        return renderHealthImpactScreen()
      case 7:
        return renderFinaleScreen()
      default:
        return renderIntroScreen()
    }
  }

  const renderIntroScreen = () => (
    <View style={styles.screenContent}>
      <ThemedText style={styles.title}>Your 2025 Sauna Wrapped</ThemedText>
      <View style={styles.contentCenter}>
        <ThemedText style={styles.emoji}>🔥</ThemedText>
        <ThemedText style={styles.subtitle}>
          Let&apos;s look back at your sauna journey
        </ThemedText>
      </View>
    </View>
  )

  const renderTotalSessionsScreen = () => (
    <View style={styles.screenContent}>
      <ThemedText style={styles.title}>Total Sessions</ThemedText>
      <View style={styles.contentCenter}>
        <ThemedText style={styles.bigNumber}>127</ThemedText>
        <ThemedText style={styles.subtitle}>sessions in 2025</ThemedText>
        <View style={styles.insightBox}>
          <ThemedText style={styles.insightText}>
            That&apos;s +32% more than last year!
          </ThemedText>
        </View>
      </View>
    </View>
  )

  const renderTimeInHeatScreen = () => (
    <View style={styles.screenContent}>
      <ThemedText style={styles.title}>Time in the Heat</ThemedText>
      <View style={styles.contentCenter}>
        <View style={styles.statCard}>
          <ThemedText style={styles.iconSmall}>⏱️</ThemedText>
          <ThemedText style={styles.statValue}>149</ThemedText>
          <ThemedText style={styles.statLabel}>hours total</ThemedText>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.smallStatCard}>
            <ThemedText style={styles.smallStatValue}>70m</ThemedText>
            <ThemedText style={styles.smallStatLabel}>avg session</ThemedText>
          </View>
          <View style={styles.smallStatCard}>
            <ThemedText style={styles.smallStatValue}>120m</ThemedText>
            <ThemedText style={styles.smallStatLabel}>
              longest session
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  )

  const renderFavoriteSpotScreen = () => (
    <View style={styles.screenContent}>
      <ThemedText style={styles.title}>Favorite Spot</ThemedText>
      <View style={styles.contentCenter}>
        <ThemedText style={styles.emoji}>📍</ThemedText>
        <ThemedText style={styles.mediumText}>Nordic Wellness Spa</ThemedText>
        <ThemedText style={styles.subtitle}>was your go-to sauna</ThemedText>
        <View style={styles.insightBox}>
          <ThemedText style={styles.insightText}>
            You visited 4 different saunas this year
          </ThemedText>
        </View>
      </View>
    </View>
  )

  const renderHeatToleranceScreen = () => (
    <View style={styles.screenContent}>
      <ThemedText style={styles.title}>Heat Tolerance</ThemedText>
      <View style={styles.contentCenter}>
        <ThemedText style={styles.emoji}>🌡️</ThemedText>
        <View style={styles.statCard}>
          <ThemedText style={styles.iconSmall}>🔥</ThemedText>
          <ThemedText style={styles.statValue}>95°C</ThemedText>
          <ThemedText style={styles.statLabel}>hottest session</ThemedText>
        </View>
        <ThemedText style={styles.subtitle}>
          Average temperature: 82°C
        </ThemedText>
      </View>
    </View>
  )

  const renderConsistencyScreen = () => (
    <View style={styles.screenContent}>
      <ThemedText style={styles.title}>Consistency King</ThemedText>
      <View style={styles.contentCenter}>
        <ThemedText style={styles.emoji}>👑</ThemedText>
        <ThemedText style={styles.mediumText}>12 days</ThemedText>
        <ThemedText style={styles.subtitle}>longest streak</ThemedText>
        <View style={styles.insightBox}>
          <ThemedText style={styles.insightText}>
            Most active on Sundays in November
          </ThemedText>
        </View>
      </View>
    </View>
  )

  const renderHealthImpactScreen = () => (
    <View style={styles.screenContent}>
      <ThemedText style={styles.title}>Health Impact</ThemedText>
      <View style={styles.contentCenter}>
        <ThemedText style={styles.emoji}>💪</ThemedText>
        <View style={styles.statCard}>
          <ThemedText style={styles.iconSmall}>😴</ThemedText>
          <ThemedText style={styles.statValue}>55%</ThemedText>
          <ThemedText style={styles.statLabel}>
            sleep quality improvement
          </ThemedText>
        </View>
        <View style={styles.statCard}>
          <ThemedText style={styles.iconSmall}>🔥</ThemedText>
          <ThemedText style={styles.statValue}>45,680</ThemedText>
          <ThemedText style={styles.statLabel}>calories burned</ThemedText>
        </View>
        <ThemedText style={styles.subtitle}>
          Keep up the great work! 🔥
        </ThemedText>
      </View>
    </View>
  )

  const renderFinaleScreen = () => (
    <View style={styles.screenContent}>
      <ThemedText style={styles.title}>Here&apos;s to 2026!</ThemedText>
      <View style={styles.contentCenter}>
        <ThemedText style={styles.emoji}>🎉</ThemedText>
        <ThemedText style={styles.subtitle}>
          Thanks for making 2025 a steamy year!
        </ThemedText>
        <TouchableOpacity style={styles.dashboardButton} onPress={handleClose}>
          <ThemedText style={styles.dashboardButtonText}>
            Back to Dashboard
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#F9F8F6", "#EFE9E3"]} style={styles.gradient}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <ThemedText style={styles.closeButtonText}>✕</ThemedText>
        </TouchableOpacity>

        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Screen Content */}
        {renderScreen()}

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            onPress={handleBack}
            disabled={currentStep === 0}
            style={styles.navButton}
          >
            <ThemedText
              style={[
                styles.navButtonText,
                currentStep === 0 && styles.navButtonTextDisabled,
              ]}
            >
              Back
            </ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.pageIndicator}>
            {currentStep + 1} / 8
          </ThemedText>

          {currentStep < 7 ? (
            <TouchableOpacity onPress={handleNext} style={styles.navButton}>
              <ThemedText style={styles.navButtonText}>Next →</ThemedText>
            </TouchableOpacity>
          ) : (
            <View style={styles.navButton} />
          )}
        </View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  gradient: {
    flex: 1,
    borderRadius: 10,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: "#3A2F23",
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 24,
  },
  progressDot: {
    height: 4,
    flex: 1,
    borderRadius: 40,
  },
  progressDotActive: {
    backgroundColor: "#FFFFFF",
  },
  progressDotInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  screenContent: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 80,
    justifyContent: "center",
  },
  contentCenter: {
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#3A2F23",
    textAlign: "center",
    marginBottom: 32,
  },
  emoji: {
    fontSize: 96,
    textAlign: "center",
    lineHeight: 118,
  },
  bigNumber: {
    lineHeight: 80,
    fontSize: 72,
    fontWeight: "400",
    color: "#B8A58B",
    textAlign: "center",
  },
  mediumText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#3A2F23",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#C9B59C",
    textAlign: "center",
  },
  insightBox: {
    backgroundColor: "#EFE9E3",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    width: "100%",
  },
  insightText: {
    fontSize: 16,
    color: "#B8A58B",
    textAlign: "center",
  },
  statCard: {
    backgroundColor: "#EFE9E3",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  iconSmall: {
    lineHeight: 48,
    fontSize: 40,
  },
  statValue: {
    fontSize: 16,
    color: "#3A2F23",
    fontWeight: "400",
  },
  statLabel: {
    fontSize: 16,
    color: "#C9B59C",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 16,
  },
  smallStatCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderColor: "#D9CFC7",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  smallStatValue: {
    fontSize: 16,
    color: "#3A2F23",
    fontWeight: "400",
  },
  smallStatLabel: {
    fontSize: 16,
    color: "#C9B59C",
    marginTop: 4,
  },
  dashboardButton: {
    backgroundColor: "#B8A58B",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 24,
  },
  dashboardButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  navButton: {
    minWidth: 50,
  },
  navButtonText: {
    fontSize: 14,
    color: "#C9B59C",
  },
  navButtonTextDisabled: {
    opacity: 0.3,
  },
  pageIndicator: {
    fontSize: 14,
    color: "#C9B59C",
  },
})
