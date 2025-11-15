import React from "react"
import { View, StyleSheet, TouchableOpacity } from "react-native"
import { Image } from "expo-image"
import { ThemedText } from "@/components/themed-text"

// Local sauna images
const saunaImages = [
  require('@/pics/saunas/saun1.jpg'),
  require('@/pics/saunas/saun2.jpg'),
  require('@/pics/saunas/saun3.jpg'),
  require('@/pics/saunas/saun4.jpg'),
  require('@/pics/saunas/saun5.jpg'),
]

// Helper function to get a consistent sauna image based on name
// Uses a better hash function for more even distribution
const getSaunaImage = (name: string) => {
  // Create a better hash using prime number multiplication
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  // Use absolute value and modulo to get index 0-4
  const index = Math.abs(hash) % saunaImages.length
  return saunaImages[index]
}

interface SaunaAttribute {
  icon: string
  label: string
  rating: number // 1-5
}

interface SaunaCardProps {
  name: string
  location: string
  rating?: number
  visits?: number
  avgTemp?: string
  lastVisit?: string
  sharedWith?: number
  owner?: string
  isOwned?: boolean
  attributes?: SaunaAttribute[]
  onPress?: () => void
  highlighted?: boolean
  imageIndex?: number // Optional index for round-robin image distribution
}

export function SaunaCard({
  name,
  location,
  rating,
  visits,
  avgTemp,
  lastVisit,
  sharedWith,
  owner,
  isOwned = false,
  attributes = [],
  onPress,
  highlighted = false,
  imageIndex,
}: SaunaCardProps) {
  const renderRatingDots = (count: number, max: number = 5) => {
    return (
      <View style={styles.ratingDots}>
        {Array.from({ length: max }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index < count ? styles.dotFilled : styles.dotEmpty,
            ]}
          />
        ))}
      </View>
    )
  }

  return (
    <TouchableOpacity
      style={[styles.card, highlighted && styles.cardHighlighted]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Sauna Image */}
      <View style={styles.imageContainer}>
        <Image
          source={imageIndex !== undefined ? saunaImages[imageIndex % saunaImages.length] : getSaunaImage(name)}
          style={styles.saunaImage}
          placeholder={{ blurhash: "LKO2?U%2Tw=w]~RBVZRi};RPxuwH" }}
          contentFit="cover"
        />
      </View>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <ThemedText type="subtitle" style={styles.name}>
              {name}
            </ThemedText>
            {isOwned && <ThemedText style={styles.verifiedIcon}>✓</ThemedText>}
          </View>

        {rating && (
          <View style={styles.ratingBadge}>
            <ThemedText style={styles.starIcon}>⭐</ThemedText>
            <ThemedText style={styles.ratingText}>
              {rating.toFixed(1)}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Location */}
      <ThemedText style={styles.location}>{location}</ThemedText>

      {/* Owner info for shared saunas */}
      {owner && <ThemedText style={styles.owner}>Owner: {owner}</ThemedText>}

      {/* Shared with info */}
      {sharedWith && (
        <ThemedText style={styles.sharedInfo}>
          Shared with {sharedWith} friends
        </ThemedText>
      )}

      {/* Attributes */}
      {attributes.length > 0 && (
        <View style={styles.attributes}>
          {attributes.map((attr, index) => (
            <View key={index} style={styles.attribute}>
              <ThemedText style={styles.attrIcon}>{attr.icon}</ThemedText>
              <ThemedText style={styles.attrLabel}>{attr.label}</ThemedText>
              {renderRatingDots(attr.rating)}
            </View>
          ))}
        </View>
      )}

      {/* Stats */}
      <View style={styles.stats}>
        {visits !== undefined && (
          <View style={styles.stat}>
            <ThemedText style={styles.statIcon}>📍</ThemedText>
            <ThemedText style={styles.statText}>{visits} visits</ThemedText>
          </View>
        )}
        {avgTemp && (
          <View style={styles.stat}>
            <ThemedText style={styles.statIcon}>🌡️</ThemedText>
            <ThemedText style={styles.statText}>{avgTemp} avg</ThemedText>
          </View>
        )}
      </View>

        {/* Last visit */}
        {lastVisit && (
          <ThemedText style={styles.lastVisit}>
            Last visit: {lastVisit}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9CFC7",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  imageContainer: {
    width: "100%",
    height: 180,
    overflow: "hidden",
  },
  saunaImage: {
    width: "100%",
    height: "100%",
  },
  cardHighlighted: {
    backgroundColor: "#EFE9E3",
  },
  content: {
    padding: 17,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3A2F23",
  },
  verifiedIcon: {
    fontSize: 14,
    color: "#1447E6",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFE9E3",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 2,
  },
  starIcon: {
    fontSize: 14,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3A2F23",
  },
  location: {
    fontSize: 16,
    color: "#C9B59C",
    marginBottom: 8,
  },
  owner: {
    fontSize: 16,
    color: "#CA3500",
    marginBottom: 8,
  },
  sharedInfo: {
    fontSize: 12,
    color: "#1447E6",
    marginBottom: 12,
  },
  attributes: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  attribute: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 8,
    alignItems: "center",
    minWidth: 62,
  },
  attrIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  attrLabel: {
    fontSize: 12,
    color: "#C9B59C",
    textAlign: "center",
    marginBottom: 6,
  },
  ratingDots: {
    flexDirection: "row",
    gap: 2,
    justifyContent: "center",
  },
  dot: {
    width: 4,
    height: 8,
    borderRadius: 4,
  },
  dotFilled: {
    backgroundColor: "#C9B59C",
  },
  dotEmpty: {
    backgroundColor: "#D9CFC7",
  },
  stats: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#D9CFC7",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statIcon: {
    fontSize: 16,
  },
  statText: {
    fontSize: 14,
    color: "#C9B59C",
  },
  lastVisit: {
    fontSize: 16,
    color: "#C9B59C",
    marginTop: 8,
  },
})
