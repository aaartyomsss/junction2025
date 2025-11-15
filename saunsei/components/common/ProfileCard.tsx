import React, { useState } from "react"
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native"
import { Image } from "expo-image"
import { ThemedText } from "@/components/themed-text"

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

// Helper function to generate placeholder avatar URL
// DiceBear styles: avataaars, personas, adventurer, big-smile, bottts, fun-emoji, 
// identicon, initials, lorelei, micah, miniavs, open-peeps, pixel-art, shapes, thumbs
// You can customize colors, accessories, etc. See: https://www.dicebear.com/styles
const getAvatarUrl = (name: string, size: number = 160) => {
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

interface ProfileCardProps {
  name: string
  sessionCount: number
  avatarUrl?: string
}

export function ProfileCard({
  name,
  sessionCount,
  avatarUrl,
}: ProfileCardProps) {
  const [scaleValue] = useState(new Animated.Value(1))

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start()
  }

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[styles.container, { transform: [{ scale: scaleValue }] }]}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: avatarUrl || getAvatarUrl(name, 160) }}
            style={styles.avatar}
            placeholder={{ blurhash: "LKO2?U%2Tw=w]~RBVZRi};RPxuwH" }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <View style={[styles.avatar, styles.avatarPlaceholder]} pointerEvents="none">
            <ThemedText style={styles.avatarText}>
              {name.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <ThemedText type="title" style={styles.name}>
            {name}
          </ThemedText>
          <ThemedText style={styles.sessions}>{sessionCount} sessions</ThemedText>
        </View>
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9CFC7",
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 16,
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#D9CFC7",
    position: "relative",
    zIndex: 1,
  },
  avatarPlaceholder: {
    position: "absolute",
    backgroundColor: "#C9B59C",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#C9B59C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 0,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    color: "#3A2F23",
    marginBottom: 4,
  },
  sessions: {
    fontSize: 16,
    color: "#C9B59C",
  },
})
