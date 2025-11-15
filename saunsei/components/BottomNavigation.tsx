import React from "react"
import { View, StyleSheet, TouchableOpacity } from "react-native"
import { ThemedText } from "@/components/themed-text"

interface NavItem {
  icon: string
  label: string
  isActive?: boolean
  onPress?: () => void
}

interface BottomNavigationProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

const NAV_ITEMS: NavItem[] = [
  { icon: "🏠", label: "Home" },
  { icon: "📍", label: "Map" },
  { icon: "📱", label: "Feed" },
  { icon: "🏆", label: "Rankings" },
  { icon: "❤️", label: "Health" },
]

export function BottomNavigation({
  activeTab = "Home",
  onTabChange,
}: BottomNavigationProps) {
  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.label === activeTab
          return (
            <TouchableOpacity
              key={item.label}
              style={styles.navItem}
              onPress={() => onTabChange?.(item.label)}
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
