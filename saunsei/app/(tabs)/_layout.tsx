import { Tabs } from "expo-router"
import React from "react"

import { BottomNavigation } from "@/components/common/BottomNavigation"
import { Colors } from "@/constants/theme"
import { useColorScheme } from "@/hooks/use-color-scheme"

export default function TabLayout() {
  const colorScheme = useColorScheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
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
