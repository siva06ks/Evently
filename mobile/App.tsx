import "react-native-gesture-handler";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { useAuthStore } from "./src/store/useAuthStore";

const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#fffaf5",
    card: "#ffffff",
    text: "#1a1c1c",
    border: "#f1dcc8",
    primary: "#f28c28",
  },
};

export default function App() {
  const [storeReady, setStoreReady] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setStoreReady(true);
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => setStoreReady(true));
    return unsub;
  }, []);

  if (!storeReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fffaf5" }}>
        <ActivityIndicator size="large" color="#f28c28" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={appTheme}>
      <StatusBar style="dark" />
      <RootNavigator />
    </NavigationContainer>
  );
}
