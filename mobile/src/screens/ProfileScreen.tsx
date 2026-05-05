import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { RootStackParamList } from "../navigation/types";
import { useAuthStore } from "../store/useAuthStore";
import { useWarmthStore } from "../store/useWarmthStore";

export function ProfileScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "Profile">) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const refreshFromApi = useWarmthStore((s) => s.refreshFromApi);
  const events = useWarmthStore((s) => s.events);
  const savedEventIds = useWarmthStore((s) => s.savedEventIds);
  const tickets = useWarmthStore((s) => s.tickets);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>My Profile</Text>
        <View style={styles.identityCard}>
          <Text style={styles.label}>Signed in as</Text>
          <Text style={styles.identifier}>{user?.identifier ?? "—"}</Text>
          <Text style={styles.muted}>
            Ticket limits: {user?.earlyBirdLimit ?? 0} early / {user?.totalCapacity ?? 0} total
          </Text>
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

        <Pressable
          style={styles.button}
          onPress={() => {
            refreshFromApi().catch(() => undefined);
            Alert.alert("Synced", "Reloaded your saved events and tickets from the server.");
          }}
        >
          <Text style={styles.buttonText}>Refresh from server</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => navigation.navigate("TicketScanner")}>
          <Text style={styles.buttonText}>Scan a ticket</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => navigation.navigate("OfflineHub")}>
          <Text style={styles.buttonText}>Open saved events</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.logout]}
          onPress={() => {
            logout();
            useWarmthStore.setState({
              savedEventIds: [],
              tickets: [],
            });
            navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          }}
        >
          <Text style={[styles.buttonText, styles.logoutText]}>Log out</Text>
        </Pressable>

        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Back</Text>
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
    gap: 6,
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
  button: {
    backgroundColor: "#f28c28",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  logout: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#dbc2b0",
  },
  logoutText: {
    color: "#914d00",
  },
  link: {
    color: "#914d00",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
    fontSize: 16,
  },
});
