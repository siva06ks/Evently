import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Metro / Expo dev server host IP — works for physical devices on the same LAN.
 * Override with EXPO_PUBLIC_API_URL (full URL including /api) if needed.
 */
function getLanHost(): string {
  const pref = process.env.EXPO_PUBLIC_API_HOST;
  if (pref) return pref;

  const uri = Constants.expoConfig?.hostUri;
  if (uri) {
    return uri.split(":")[0];
  }

  return Platform.OS === "android" ? "10.0.2.2" : "localhost";
}

const lanHost = getLanHost();
const baseFromEnv = process.env.EXPO_PUBLIC_API_URL;

export const API_BASE_URL = baseFromEnv ?? `http://${lanHost}:5050/api`;
