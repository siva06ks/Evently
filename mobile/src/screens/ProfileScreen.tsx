import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/types";
import { useAuthStore } from "../store/useAuthStore";
import { useWarmthStore } from "../store/useWarmthStore";

export function ProfileScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "Profile">) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const patchUser = useAuthStore((s) => s.patchUser);
  const events = useWarmthStore((s) => s.events);
  const savedEventIds = useWarmthStore((s) => s.savedEventIds);
  const tickets = useWarmthStore((s) => s.tickets);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");

  useEffect(() => {
    setDisplayName(user?.displayName ?? "");
  }, [user?.displayName]);

  const identifier = user?.identifier ?? "guest";
  const nameToShow = displayName || identifier.split("@")[0] || "Evently Member";
  const isEmail = identifier.includes("@");
  const memberId = user?.id ? `EV-${String(user.id).padStart(4, "0")}` : "EV-0000";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.identityCard}>
          <View style={styles.identityTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{nameToShow.slice(0, 1).toUpperCase()}</Text>
            </View>
            <View style={styles.identityTextBlock}>
              <Text style={styles.identifier}>{nameToShow}</Text>
              <Text style={styles.muted}>{isEmail ? identifier : `Phone: ${identifier}`}</Text>
              <Text style={styles.memberId}>Member ID {memberId}</Text>
            </View>
          </View>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Profile name"
            placeholderTextColor="#9a8574"
            style={styles.input}
          />
          <Pressable
            style={styles.nameSaveBtn}
            onPress={() => {
              const trimmed = displayName.trim();
              patchUser({ displayName: trimmed || undefined });
            }}
          >
            <Text style={styles.nameSaveText}>Save name</Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statCount}>{savedEventIds.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statCount}>{tickets.length}</Text>
            <Text style={styles.statLabel}>Tickets</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statCount}>{events.length}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Pressable style={styles.actionCard} onPress={() => navigation.navigate("OfflineHub")}>
            <MaterialCommunityIcons name="bookmark-outline" size={20} color="#914d00" />
            <Text style={styles.actionTitle}>My Bookings</Text>
            <Text style={styles.actionSub}>Saved events and tickets</Text>
          </Pressable>
          <Pressable style={styles.actionCard} onPress={() => navigation.navigate("TicketScanner")}>
            <MaterialCommunityIcons name="qrcode-scan" size={20} color="#914d00" />
            <Text style={styles.actionTitle}>Scan Ticket</Text>
            <Text style={styles.actionSub}>Validate at check-in</Text>
          </Pressable>
          <Pressable style={styles.actionCard} onPress={() => navigation.navigate("TicketLimits")}>
            <MaterialCommunityIcons name="ticket-percent-outline" size={20} color="#914d00" />
            <Text style={styles.actionTitle}>Ticket Settings</Text>
            <Text style={styles.actionSub}>
              {user?.earlyBirdLimit ?? 0} early / {user?.totalCapacity ?? 0} total
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.logout}
          onPress={() => {
            logout();
            useWarmthStore.setState({
              savedEventIds: [],
              tickets: [],
            });
            navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          }}
        >
          <MaterialCommunityIcons name="logout" size={18} color="#914d00" />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fffaf5",
  },
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  identityCard: {
    borderWidth: 1,
    borderColor: "#f2e8df",
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 14,
    gap: 10,
  },
  identityTop: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  identityTextBlock: {
    flex: 1,
    gap: 2,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: "#f28c28",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#5d2f00",
    fontWeight: "800",
    fontSize: 22,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1c1c",
  },
  label: {
    fontSize: 14,
    color: "#6b5a4c",
    fontWeight: "600",
  },
  identifier: {
    fontSize: 18,
    color: "#1a1c1c",
    fontWeight: "600",
  },
  muted: {
    color: "#6b5a4c",
    fontSize: 14,
  },
  memberId: {
    color: "#9a8574",
    fontSize: 12,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#dbc2b0",
    borderRadius: 12,
    backgroundColor: "#fff",
    color: "#1a1c1c",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  nameSaveBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#fff3e6",
    borderColor: "#f2c79a",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quickActions: {
    gap: 10,
  },
  actionCard: {
    borderWidth: 1,
    borderColor: "#f2e8df",
    borderRadius: 14,
    backgroundColor: "#fff",
    padding: 14,
    gap: 4,
  },
  actionTitle: {
    color: "#1a1c1c",
    fontWeight: "700",
    fontSize: 16,
  },
  actionSub: {
    color: "#6b5a4c",
    fontSize: 13,
  },
  nameSaveText: {
    color: "#914d00",
    fontWeight: "700",
    fontSize: 13,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#f2e8df",
    borderRadius: 14,
    backgroundColor: "#fff",
    paddingVertical: 14,
    alignItems: "center",
    gap: 2,
  },
  statCount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1c1c",
  },
  statLabel: {
    color: "#6b5a4c",
    fontWeight: "600",
  },
  logout: {
    marginTop: 6,
    backgroundColor: "#fff3e6",
    borderWidth: 1,
    borderColor: "#dbc2b0",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  logoutText: {
    color: "#914d00",
    fontWeight: "700",
  },
});
