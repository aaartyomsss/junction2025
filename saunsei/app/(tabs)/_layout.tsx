import { Tabs } from "expo-router"
import React from "react"
import { Platform } from "react-native"

import { BottomNavigation } from "@/components/common/BottomNavigation"
import { Colors } from "@/constants/theme"
import { useColorScheme } from "@/hooks/use-color-scheme"

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? "light"]

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#B8A58B",
        tabBarInactiveTintColor: "#C9B59C80",
        headerShown: false,
      }}
      tabBar={(props) => <BottomNavigation />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
        }}
      />
      <Tabs.Screen
        name="devices"
        options={{
          title: "Devices",
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: "Trips",
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: "Social",
        }}
      />
      <Tabs.Screen
        name="harvia-dashboard"
        options={{
          title: "Harvia",
        }}
      />
    </Tabs>
  )
}
