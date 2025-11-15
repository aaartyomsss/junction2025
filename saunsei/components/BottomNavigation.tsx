import React from "react"
import { View, StyleSheet, TouchableOpacity } from "react-native"
import { useRouter, usePathname } from "expo-router"
import { ThemedText } from "@/components/themed-text"

interface BottomNavigationProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

const NAV_ITEMS = [
  { icon: "🏠", label: "Home", route: "/(tabs)" as const },
  { icon: "📍", label: "Map", route: "/(tabs)/trips" as const },
  { icon: "📱", label: "Feed", route: "/(tabs)/social" as const },
  { icon: "🏆", label: "Rankings", route: "/(tabs)/devices" as const },
  { icon: "❤️", label: "Health", route: "/(tabs)/devices" as const },
]

export function BottomNavigation({
  activeTab,
  onTabChange,
}: BottomNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleTabPress = (item: (typeof NAV_ITEMS)[number]) => {
    if (onTabChange) {
      onTabChange(item.label)
    } else {
      router.push(item.route)
    }
  }

  const isTabActive = (item: (typeof NAV_ITEMS)[number]) => {
    if (activeTab) {
      return item.label === activeTab
    }
    return (
      pathname === item.route || (pathname === "/" && item.route === "/(tabs)")
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {NAV_ITEMS.map((item) => {
          const isActive = isTabActive(item)
          return (
            <TouchableOpacity
              key={item.label}
              style={styles.navItem}
              onPress={() => handleTabPress(item)}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.navIcon}>{item.icon}</ThemedText>
              <ThemedText
                style={[
                  styles.navLabel,
                  isActive ? styles.navLabelActive : styles.navLabelInactive,
                ]}
              >
                {item.label}
              </ThemedText>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#D9CFC7",
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 4,
    minWidth: 48,
  },
  navIcon: {
    fontSize: 22,
  },
  navLabel: {
    fontSize: 12,
  },
  navLabelActive: {
    color: "#B8A58B",
    fontWeight: "600",
  },
  navLabelInactive: {
    color: "#C9B59C",
  },
})
