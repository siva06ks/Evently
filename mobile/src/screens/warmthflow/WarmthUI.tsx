import type { ReactNode } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import type { NavIconName } from "./navIcons";
import type { ViewStyle } from "react-native";

export const warmthColors = {
  bg: "#f9f9f9",
  card: "#ffffff",
  text: "#1a1c1c",
  muted: "#554336",
  orange: "#f28c28",
  deep: "#914d00",
  border: "#e7d6c7",
};

export function WarmthShell({
  title,
  children,
  leftAction,
  rightAction,
  bottomBar,
  noHeader = false,
  contentStyle,
}: {
  title: string;
  children: ReactNode;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  bottomBar?: ReactNode;
  noHeader?: boolean;
  contentStyle?: ViewStyle;
}) {
  const insets = useSafeAreaInsets();
  const topSafePadding = Math.max(insets.top + 8, 18);

  return (
    <SafeAreaView style={styles.page} edges={["top"]}>
      {!noHeader ? (
        <View style={[styles.header, { paddingTop: topSafePadding }]}>
          <View style={styles.headerSide}>{leftAction}</View>
          <Text style={styles.brand}>{title}</Text>
          <View style={styles.headerSideRight}>{rightAction}</View>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={[styles.content, contentStyle]}>{children}</ScrollView>
      {bottomBar ? (
        <View style={[styles.bottomBarWrap, { paddingBottom: 12 + Math.max(insets.bottom, 6) }]}>
          {bottomBar}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export function WarmthHeaderAction({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.headerAction}>
      <Text style={styles.headerActionText}>{label}</Text>
    </Pressable>
  );
}

export function WarmthBottomNav({
  items,
}: {
  items: { key: string; label: string; iconName: NavIconName; active?: boolean; onPress?: () => void }[];
}) {
  return (
    <View style={styles.bottomNav}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          onPress={item.onPress}
          style={[styles.bottomNavItem, item.active && styles.bottomNavItemActive]}
        >
          <View style={styles.bottomNavIconWrap}>
            <MaterialCommunityIcons
              name={item.iconName}
              size={18}
              color={item.active ? warmthColors.orange : "#64748b"}
            />
          </View>
          <Text style={[styles.bottomNavText, item.active && styles.bottomNavTextActive]}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function WarmthButton({
  label,
  onPress,
  primary = false,
}: {
  label: string;
  onPress?: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.button, primary ? styles.buttonPrimary : styles.buttonSecondary]}>
      <Text style={[styles.buttonText, primary ? styles.buttonTextPrimary : styles.buttonTextSecondary]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function WarmthField({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9a8574"
        style={styles.input}
      />
    </View>
  );
}

export function warmthStyles() {
  return styles;
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: warmthColors.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ffedd5",
    backgroundColor: "#fffdf5",
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },
  headerSide: {
    width: 80,
    alignItems: "flex-start",
  },
  headerSideRight: {
    width: 80,
    alignItems: "flex-end",
  },
  brand: {
    color: warmthColors.orange,
    fontSize: 23,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
    includeFontPadding: false,
  },
  headerAction: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#f1dcc8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#fff",
  },
  headerActionText: {
    color: warmthColors.deep,
    fontSize: 14,
    fontWeight: "700",
  },
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 130,
    gap: 16,
  },
  bottomBarWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "transparent",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#fff1e3",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 8,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    shadowColor: "#f28c28",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomNavItem: {
    flex: 1,
    borderRadius: 999,
    minHeight: 64,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomNavItemActive: {
    backgroundColor: "#fff3e6",
  },
  bottomNavIconWrap: {
    height: 18,
    width: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomNavText: {
    color: "#64748b",
    fontWeight: "700",
    fontSize: 12,
    marginTop: 3,
  },
  bottomNavTextActive: {
    color: warmthColors.orange,
  },
  button: {
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    alignItems: "center",
  },
  buttonPrimary: {
    backgroundColor: warmthColors.deep,
    borderColor: warmthColors.deep,
  },
  buttonSecondary: {
    backgroundColor: warmthColors.card,
    borderColor: warmthColors.border,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
  },
  buttonTextPrimary: {
    color: "#fff",
  },
  buttonTextSecondary: {
    color: warmthColors.deep,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: warmthColors.muted,
  },
  input: {
    backgroundColor: warmthColors.card,
    borderWidth: 1,
    borderColor: warmthColors.border,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: warmthColors.text,
    fontSize: 17,
  },
});
