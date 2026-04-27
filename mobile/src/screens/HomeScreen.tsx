import { useMemo } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useEventDraftStore } from "../store/useEventDraftStore";
import { isValidDate, isValidEmail, isValidEventTitle } from "../utils/regex";

export function HomeScreen() {
  const { title, organizerEmail, date, setField, reset } = useEventDraftStore();

  const isFormValid = useMemo(
    () =>
      isValidEventTitle(title) && isValidEmail(organizerEmail) && isValidDate(date),
    [title, organizerEmail, date]
  );

  const saveDraft = () => {
    if (!isFormValid) {
      Alert.alert("Invalid input", "Please fill all fields with valid values.");
      return;
    }

    Alert.alert("Saved offline", "Draft is already persisted in local storage.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Event Draft</Text>
        <Text style={styles.subtitle}>
          Offline-safe draft form with regex validation + state management.
        </Text>

        <TextInput
          style={styles.input}
          value={title}
          placeholder="Event title (3-60 chars)"
          placeholderTextColor="#64748B"
          onChangeText={(value) => setField("title", value)}
        />
        <TextInput
          style={styles.input}
          value={organizerEmail}
          placeholder="Organizer email"
          placeholderTextColor="#64748B"
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(value) => setField("organizerEmail", value)}
        />
        <TextInput
          style={styles.input}
          value={date}
          placeholder="Date (YYYY-MM-DD)"
          placeholderTextColor="#64748B"
          onChangeText={(value) => setField("date", value)}
        />

        <Pressable style={styles.primaryButton} onPress={saveDraft}>
          <Text style={styles.primaryButtonText}>Save Draft</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={reset}>
          <Text style={styles.secondaryButtonText}>Reset</Text>
        </Pressable>
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
    gap: 12,
  },
  title: {
    color: "#E2E8F0",
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    color: "#94A3B8",
    marginBottom: 12,
  },
  input: {
    borderColor: "#1E293B",
    borderWidth: 1,
    borderRadius: 10,
    color: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#111827",
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: "#8B5CF6",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#CBD5E1",
    fontWeight: "600",
  },
});
