import React, { useState } from "react"
import { ScrollView, StyleSheet, View, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Image } from "expo-image"
import { ThemedView } from "@/components/themed-view"
import { ThemedText } from "@/components/themed-text"
import { AppHeader } from "@/components/common/AppHeader"
import { Colors } from "@/constants/theme"
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Ionicons from '@expo/vector-icons/Ionicons'

// Helper function to infer gender from name (common Finnish/European name patterns)
const inferGender = (name: string): 'male' | 'female' => {
  const normalizedName = name.trim().toLowerCase()
  const firstName = normalizedName.split(' ')[0] // Get first name
  
  // Common Finnish/European female name endings
  const femaleEndings = ['a', 'i', 'e', 'ia', 'ina', 'ella', 'etta', 'ina', 'ka', 'na']
  // Common Finnish/European male name endings  
  const maleEndings = ['o', 'i', 'u', 'er', 'ar', 'en', 'on', 'us', 'as', 'is']
  
  // Check for common female first names (including names from the app)
  const commonFemaleNames = ['maria', 'anna', 'liisa', 'helena', 'katarina', 'sophia', 'emilia', 
    'gabi', 'gabriela', 'elena', 'elisa', 'sara', 'nina', 'laura', 'julia', 'gabi']
  // Check for common male first names (including names from the app)
  const commonMaleNames = ['seppo', 'mikko', 'jussi', 'pekka', 'matti', 'jari', 'antti', 
    'artjom', 'alexander', 'mariusz', 'erik', 'janne', 'ville', 'marko', 'timo', 'alexander']
  
  // Check against known names first (more accurate)
  if (commonFemaleNames.includes(firstName)) return 'female'
  if (commonMaleNames.includes(firstName)) return 'male'
  
  // Check name endings
  for (const ending of femaleEndings) {
    if (firstName.endsWith(ending)) return 'female'
  }
  for (const ending of maleEndings) {
    if (firstName.endsWith(ending)) return 'male'
  }
  
  // Default based on last character (Finnish names often end in 'a' for female, 'o' for male)
  const lastChar = firstName.charAt(firstName.length - 1)
  if (lastChar === 'a' || lastChar === 'i') return 'female'
  if (lastChar === 'o' || lastChar === 'u') return 'male'
  
  // Fallback: use hash to determine (50/50 split)
  let hash = 0
  for (let i = 0; i < firstName.length; i++) {
    hash = ((hash << 5) - hash) + firstName.charCodeAt(i)
  }
  return Math.abs(hash) % 2 === 0 ? 'female' : 'male'
}

// Helper function to infer ethnicity/cultural background from name patterns
const inferEthnicity = (name: string): string => {
  const normalizedName = name.trim().toLowerCase()
  const firstName = normalizedName.split(' ')[0]
  const lastName = normalizedName.split(' ')[1] || ''
  
  // Finnish names
  const finnishFirstNames = ['seppo', 'mikko', 'jussi', 'pekka', 'matti', 'jari', 'antti', 
    'janne', 'ville', 'marko', 'timo', 'liisa', 'helena', 'katarina', 'anna']
  const finnishLastEndings = ['nen', 'inen', 'lä', 'lainen', 'lainen']
  
  // Eastern European names (Polish, Russian, etc.)
  const easternEuropeanFirstNames = ['mariusz', 'artjom', 'alexander', 'alex', 'dmitri', 'ivan',
    'natasha', 'elena', 'maria', 'sophia']
  const easternEuropeanLastEndings = ['ski', 'sky', 'ov', 'ova', 'ev', 'eva', 'in', 'ina', 'ov', 'ova']
  
  // Scandinavian names
  const scandinavianFirstNames = ['erik', 'erik', 'lars', 'bjorn', 'sven', 'ingrid', 'astrid']
  const scandinavianLastEndings = ['sson', 'sen', 'dottir', 'datter']
  
  // Check first name patterns
  if (finnishFirstNames.includes(firstName) || 
      finnishLastEndings.some(ending => lastName.endsWith(ending))) {
    return 'finnish'
  }
  
  if (easternEuropeanFirstNames.includes(firstName) ||
      easternEuropeanLastEndings.some(ending => lastName.endsWith(ending))) {
    return 'eastern_european'
  }
  
  if (scandinavianFirstNames.includes(firstName) ||
      scandinavianLastEndings.some(ending => lastName.endsWith(ending))) {
    return 'scandinavian'
  }
  
  // Check last name endings for patterns
  if (lastName.endsWith('nen') || lastName.endsWith('inen') || lastName.endsWith('lä')) {
    return 'finnish'
  }
  if (lastName.endsWith('ski') || lastName.endsWith('sky') || lastName.endsWith('ov') || lastName.endsWith('ova')) {
    return 'eastern_european'
  }
  if (lastName.endsWith('sson') || lastName.endsWith('sen')) {
    return 'scandinavian'
  }
  
  // Default: assume Finnish/European (most common in the app context)
  return 'european'
}

// Helper function to generate placeholder avatar URL
// DiceBear styles: avataaars, personas, adventurer, big-smile, bottts, fun-emoji, 
// identicon, initials, lorelei, micah, miniavs, open-peeps, pixel-art, shapes, thumbs
// You can customize colors, accessories, etc. See: https://www.dicebear.com/styles
const getAvatarUrl = (name: string, size: number = 100) => {
  // Create a more unique seed based on the full name
  // This ensures different names produce very different avatars
  let hash = 0
  const normalizedName = name.trim().toLowerCase()
  
  // Better hash function for more variation
  for (let i = 0; i < normalizedName.length; i++) {
    const char = normalizedName.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Use the hash as seed, but also incorporate name length and first/last char
  // This creates more variation between similar names
  const nameLength = normalizedName.length
  const firstChar = normalizedName.charCodeAt(0) || 0
  const lastChar = normalizedName.charCodeAt(normalizedName.length - 1) || 0
  
  // Combine multiple factors for unique seed
  const seed = Math.abs(hash) + (nameLength * 1000) + (firstChar * 100) + lastChar
  
  // Infer gender and ethnicity from name
  const gender = inferGender(name)
  const ethnicity = inferEthnicity(name)
  
  // Current style: avataaars (cartoon-style avatars)
  // Incorporate gender and ethnicity into seed for more accurate avatar generation
  // Note: DiceBear uses the seed to determine features, so including these factors helps
  const genderOffset = gender === 'female' ? 100000 : 200000
  const ethnicityOffsets: Record<string, number> = {
    'finnish': 0,
    'eastern_european': 300000,
    'scandinavian': 400000,
    'european': 500000,
  }
  const ethnicityOffset = ethnicityOffsets[ethnicity] || 0
  
  const finalSeed = seed + genderOffset + ethnicityOffset
  
  // The seed now varies based on name, gender, and ethnicity, creating more distinct and personalized avatars
  // Add a version parameter to force cache refresh when avatar generation logic changes
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${finalSeed}&size=${size}&v=3`
}

interface LeaderboardUser {
  id: string
  name: string
  rank: number
  sessions: number
  totalTime: number
  streak: number
  avgTemp: number
  badges: string[]
  avatar?: string
  change?: number // rank change from last period
}

const MOCK_LEADERBOARD: LeaderboardUser[] = [
  {
    id: "1",
    name: "Seppo Seppälä",
    rank: 1,
    sessions: 127,
    totalTime: 149,
    streak: 12,
    avgTemp: 82,
    badges: ["🔥", "👑", "⭐"],
    change: 0,
  },
  {
    id: "2",
    name: "Artjom Wickström",
    rank: 2,
    sessions: 115,
    totalTime: 138,
    streak: 8,
    avgTemp: 85,
    badges: ["🔥", "⭐"],
    change: 1,
  },
  {
    id: "3",
    name: "Alexander Tamm",
    rank: 3,
    sessions: 98,
    totalTime: 124,
    streak: 15,
    avgTemp: 80,
    badges: ["🔥", "💪"],
    change: -1,
  },
  {
    id: "4",
    name: "Mariusz Polak",
    rank: 4,
    sessions: 89,
    totalTime: 112,
    streak: 5,
    avgTemp: 83,
    badges: ["⭐"],
    change: 2,
  },
  {
    id: "5",
    name: "Gabi Hämäläinen",
    rank: 5,
    sessions: 76,
    totalTime: 98,
    streak: 7,
    avgTemp: 81,
    badges: [],
    change: -1,
  },
  {
    id: "6",
    name: "Erik Nordström",
    rank: 6,
    sessions: 65,
    totalTime: 87,
    streak: 3,
    avgTemp: 79,
    badges: [],
    change: 0,
  },
  {
    id: "7",
    name: "Liisa Virtanen",
    rank: 7,
    sessions: 54,
    totalTime: 72,
    streak: 4,
    avgTemp: 84,
    badges: [],
    change: 1,
  },
]

const PERIODS = ["All Time", "This Month", "This Week"] as const
type Period = typeof PERIODS[number]

const LeaderboardCard: React.FC<{ user: LeaderboardUser; colors: typeof Colors.light }> = ({
  user,
  colors,
}) => {
  const isTopThree = user.rank <= 3
  const rankColors = {
    1: ["#FFD700", "#FFA500"], // Gold
    2: ["#C0C0C0", "#A8A8A8"], // Silver
    3: ["#CD7F32", "#B87333"], // Bronze
  }

  return (
    <TouchableOpacity
      style={[
        styles.leaderboardCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        isTopThree && styles.topThreeCard,
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.leaderboardCardContent}>
        {/* Rank */}
        <View style={styles.rankSection}>
          {isTopThree ? (
            <LinearGradient
              colors={rankColors[user.rank as 1 | 2 | 3]}
              style={styles.rankBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <ThemedText style={styles.rankBadgeText}>{user.rank}</ThemedText>
            </LinearGradient>
          ) : (
            <View style={[styles.rankNumber, { backgroundColor: colors.border + "40" }]}>
              <ThemedText style={[styles.rankNumberText, { color: colors.text }]}>
                {user.rank}
              </ThemedText>
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.border + "40" }]}>
            <Image
              source={{ uri: getAvatarUrl(user.name, 88) }}
              style={styles.avatarImage}
              placeholder={{ blurhash: "LKO2?U%2Tw=w]~RBVZRi};RPxuwH" }}
              contentFit="cover"
              cachePolicy="memory-disk"
              onError={() => {}}
            />
            <View style={styles.avatarFallback} pointerEvents="none">
              <ThemedText style={styles.avatarText}>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </ThemedText>
            </View>
          </View>
          <View style={styles.userDetails}>
            <View style={styles.userNameRow}>
              <ThemedText type="defaultSemiBold" style={[styles.userName, { color: colors.text }]}>
                {user.name}
              </ThemedText>
              {user.change !== undefined && user.change !== 0 && (
                <View
                  style={[
                    styles.changeBadge,
                    {
                      backgroundColor: user.change > 0 ? "#4CAF5015" : "#f4433615",
                    },
                  ]}
                >
                  <Ionicons
                    name={user.change > 0 ? "arrow-up" : "arrow-down"}
                    size={10}
                    color={user.change > 0 ? "#4CAF50" : "#f44336"}
                  />
                  <ThemedText
                    style={[
                      styles.changeText,
                      { color: user.change > 0 ? "#4CAF50" : "#f44336" },
                    ]}
                  >
                    {Math.abs(user.change)}
                  </ThemedText>
                </View>
              )}
            </View>
            <View style={styles.userStats}>
              <ThemedText style={[styles.statValue, { color: colors.text }]}>
                {user.sessions}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
                sessions
              </ThemedText>
              <ThemedText style={[styles.statDivider, { color: colors.border }]}>•</ThemedText>
              <ThemedText style={[styles.statValue, { color: colors.text }]}>
                {user.totalTime}h
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
                total
              </ThemedText>
              <ThemedText style={[styles.statDivider, { color: colors.border }]}>•</ThemedText>
              <ThemedText style={[styles.statValue, { color: colors.text }]}>
                {user.streak}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
                streak
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Badges */}
        {user.badges.length > 0 && (
          <View style={styles.badgesContainer}>
            {user.badges.map((badge, idx) => (
              <View key={idx} style={styles.badge}>
                <ThemedText style={styles.badgeEmoji}>{badge}</ThemedText>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

export default function LeaderboardScreen() {
  const colors = Colors.light
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("All Time")
  const [selectedCategory, setSelectedCategory] = useState<"sessions" | "time" | "streak">("sessions")

  // Sort leaderboard based on selected category
  const sortedLeaderboard = [...MOCK_LEADERBOARD].sort((a, b) => {
    switch (selectedCategory) {
      case "sessions":
        return b.sessions - a.sessions
      case "time":
        return b.totalTime - a.totalTime
      case "streak":
        return b.streak - a.streak
      default:
        return a.rank - b.rank
    }
  })

  // Reassign ranks after sorting
  const rankedLeaderboard = sortedLeaderboard.map((user, idx) => ({
    ...user,
    rank: idx + 1,
  }))

  const currentUser = rankedLeaderboard.find((u) => u.name === "Seppo Seppälä") || rankedLeaderboard[0]

  return (
    <ThemedView style={styles.container}>
      <AppHeader />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={["#C9B59C", "#BDA78F"]}
            style={styles.heroCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroLeft}>
                <MaterialIcons name="emoji-events" size={32} color="#FFFFFF" />
                <View style={styles.heroText}>
                  <ThemedText style={styles.heroTitle}>Leaderboard</ThemedText>
                  <ThemedText style={styles.heroSubtitle}>
                    Compete with the sauna community
                  </ThemedText>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Your Rank Card */}
          <View style={[styles.yourRankCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.yourRankHeader}>
              <ThemedText type="subtitle" style={[styles.yourRankTitle, { color: colors.text }]}>
                Your Rank
              </ThemedText>
              <View style={[styles.yourRankBadge, { backgroundColor: colors.tint + "20" }]}>
                <ThemedText style={[styles.yourRankNumber, { color: colors.tint }]}>
                  #{currentUser.rank}
                </ThemedText>
              </View>
            </View>
            <View style={styles.yourRankStats}>
              <View style={styles.yourStatItem}>
                <MaterialIcons name="local-fire-department" size={18} color={colors.tint} />
                <ThemedText style={[styles.yourStatValue, { color: colors.text }]}>
                  {currentUser.sessions}
                </ThemedText>
                <ThemedText style={[styles.yourStatLabel, { color: colors.textTertiary }]}>
                  Sessions
                </ThemedText>
              </View>
              <View style={styles.yourStatItem}>
                <MaterialIcons name="schedule" size={18} color={colors.tint} />
                <ThemedText style={[styles.yourStatValue, { color: colors.text }]}>
                  {currentUser.totalTime}h
                </ThemedText>
                <ThemedText style={[styles.yourStatLabel, { color: colors.textTertiary }]}>
                  Total Time
                </ThemedText>
              </View>
              <View style={styles.yourStatItem}>
                <MaterialIcons name="whatshot" size={18} color={colors.tint} />
                <ThemedText style={[styles.yourStatValue, { color: colors.text }]}>
                  {currentUser.streak}
                </ThemedText>
                <ThemedText style={[styles.yourStatLabel, { color: colors.textTertiary }]}>
                  Day Streak
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSection}>
          <View style={styles.periodContainer}>
            {PERIODS.map((period) => (
              <TouchableOpacity
                key={period}
                onPress={() => setSelectedPeriod(period)}
                style={[
                  styles.periodButton,
                  {
                    backgroundColor:
                      selectedPeriod === period ? colors.tint : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <ThemedText
                  style={[
                    styles.periodButtonText,
                    {
                      color: selectedPeriod === period ? "#FFFFFF" : colors.text,
                    },
                  ]}
                >
                  {period}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Selector */}
        <View style={styles.categorySection}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
            Ranked By
          </ThemedText>
          <View style={styles.categoryButtons}>
            {[
              { key: "sessions", label: "Sessions", icon: "local-fire-department" },
              { key: "time", label: "Total Time", icon: "schedule" },
              { key: "streak", label: "Streak", icon: "whatshot" },
            ].map((cat) => (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setSelectedCategory(cat.key as any)}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor:
                      selectedCategory === cat.key ? colors.tint + "15" : colors.card,
                    borderColor:
                      selectedCategory === cat.key ? colors.tint : colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={cat.icon as any}
                  size={18}
                  color={selectedCategory === cat.key ? colors.tint : colors.textTertiary}
                />
                <ThemedText
                  style={[
                    styles.categoryButtonText,
                    {
                      color: selectedCategory === cat.key ? colors.tint : colors.text,
                    },
                  ]}
                >
                  {cat.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Top 3 Podium */}
        {rankedLeaderboard.length >= 3 && (
          <View style={styles.podiumSection}>
            <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
              Top Performers
            </ThemedText>
            <View style={styles.podium}>
              {/* 2nd Place */}
              <View style={styles.podiumItem}>
                <View style={[styles.podiumAvatar, { backgroundColor: "#C0C0C0" }]}>
                  <ThemedText style={styles.podiumRank}>2</ThemedText>
                </View>
                <ThemedText style={[styles.podiumName, { color: colors.text }]}>
                  {rankedLeaderboard[1]?.name.split(" ")[0]}
                </ThemedText>
                <ThemedText style={[styles.podiumValue, { color: colors.textTertiary }]}>
                  {selectedCategory === "sessions"
                    ? `${rankedLeaderboard[1]?.sessions}`
                    : selectedCategory === "time"
                      ? `${rankedLeaderboard[1]?.totalTime}h`
                      : `${rankedLeaderboard[1]?.streak}`}
                </ThemedText>
              </View>

              {/* 1st Place */}
              <View style={styles.podiumItem}>
                <View style={[styles.podiumAvatar, { backgroundColor: "#FFD700" }]}>
                  <MaterialIcons name="emoji-events" size={32} color="#FFFFFF" />
                </View>
                <ThemedText style={[styles.podiumName, { color: colors.text }]}>
                  {rankedLeaderboard[0]?.name.split(" ")[0]}
                </ThemedText>
                <ThemedText style={[styles.podiumValue, { color: colors.textTertiary }]}>
                  {selectedCategory === "sessions"
                    ? `${rankedLeaderboard[0]?.sessions}`
                    : selectedCategory === "time"
                      ? `${rankedLeaderboard[0]?.totalTime}h`
                      : `${rankedLeaderboard[0]?.streak}`}
                </ThemedText>
              </View>

              {/* 3rd Place */}
              <View style={styles.podiumItem}>
                <View style={[styles.podiumAvatar, { backgroundColor: "#CD7F32" }]}>
                  <ThemedText style={styles.podiumRank}>3</ThemedText>
                </View>
                <ThemedText style={[styles.podiumName, { color: colors.text }]}>
                  {rankedLeaderboard[2]?.name.split(" ")[0]}
                </ThemedText>
                <ThemedText style={[styles.podiumValue, { color: colors.textTertiary }]}>
                  {selectedCategory === "sessions"
                    ? `${rankedLeaderboard[2]?.sessions}`
                    : selectedCategory === "time"
                      ? `${rankedLeaderboard[2]?.totalTime}h`
                      : `${rankedLeaderboard[2]?.streak}`}
                </ThemedText>
              </View>
            </View>
          </View>
        )}

        {/* Full Leaderboard */}
        <View style={styles.leaderboardSection}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
            Full Rankings
          </ThemedText>
          {rankedLeaderboard.map((user) => (
            <LeaderboardCard key={user.id} user={user} colors={colors} />
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  heroText: {
    gap: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  yourRankCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  yourRankHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  yourRankTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  yourRankBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  yourRankNumber: {
    fontSize: 18,
    fontWeight: "700",
  },
  yourRankStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  yourStatItem: {
    alignItems: "center",
    gap: 6,
  },
  yourStatValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  yourStatLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  periodSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
  },
  periodContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  categorySection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  categoryButtons: {
    flexDirection: "row",
    gap: 10,
  },
  categoryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  podiumSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  podium: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 12,
    paddingTop: 20,
  },
  podiumItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  podiumAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  podiumRank: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  podiumName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  podiumValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  leaderboardSection: {
    paddingHorizontal: 20,
  },
  leaderboardCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topThreeCard: {
    borderWidth: 2,
  },
  leaderboardCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rankSection: {
    width: 36,
    alignItems: "center",
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  rankBadgeText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  rankNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  rankNumberText: {
    fontSize: 16,
    fontWeight: "700",
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    position: "relative",
    zIndex: 1,
  },
  avatarFallback: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#C9B59C",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  userDetails: {
    flex: 1,
    gap: 4,
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
  },
  changeText: {
    fontSize: 9,
    fontWeight: "700",
  },
  userStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  statValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  statDivider: {
    fontSize: 12,
    marginHorizontal: 2,
  },
  badgesContainer: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeEmoji: {
    fontSize: 14,
  },
})

