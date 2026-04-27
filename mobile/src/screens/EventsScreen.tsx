import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export function EventsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Events</Text>
        <Text style={styles.subtitle}>
          Connect this screen to `GET /api/events` to list events from PostgreSQL.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B1220",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#E2E8F0",
  },
  subtitle: {
    color: "#94A3B8",
    textAlign: "center",
  },
});
