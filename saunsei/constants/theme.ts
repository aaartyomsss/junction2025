/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native"

const tintColorLight = "#C9B59C"
const tintColorDark = "#BDA78F"

export const Colors = {
  light: {
    text: "#3A2F23",
    background: "#F9F8F6",
    tint: tintColorLight,
    icon: "#C9B59C",
    tabIconDefault: "#C9B59C",
    tabIconSelected: "#B8A58B",
    card: "#FFFFFF",
    border: "#D9CFC7",
    primary: "#C9B59C",
    secondary: "#BDA78F",
    textSecondary: "#B8A58B",
    textTertiary: "#52493E",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    card: "#1F2022",
    border: "#2A2C2E",
    primary: "#BDA78F",
    secondary: "#C9B59C",
    textSecondary: "#9BA1A6",
    textTertiary: "#687076",
  },
}

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
})
