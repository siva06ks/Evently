import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { RootNavigator } from "./src/navigation/RootNavigator";

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
  return (
    <NavigationContainer theme={appTheme}>
      <StatusBar style="dark" />
      <RootNavigator />
    </NavigationContainer>
  );
}
