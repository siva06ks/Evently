import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import {
  BookingFormScreen,
  CreateEventScreen,
  EditEventScreen,
  EventDetailsScreen,
  HomeFeedScreen,
  LoginScreen,
  OfflineHubScreen,
  OTPScreen,
  QRTicketScreen,
  TicketLimitsScreen,
} from "../screens/warmthflow/WarmthFlowScreens";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="HomeFeed" component={HomeFeedScreen} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
      <Stack.Screen name="BookingForm" component={BookingFormScreen} />
      <Stack.Screen name="QRTicket" component={QRTicketScreen} />
      <Stack.Screen name="OfflineHub" component={OfflineHubScreen} />
      <Stack.Screen name="TicketLimits" component={TicketLimitsScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
      <Stack.Screen name="EditEvent" component={EditEventScreen} />
    </Stack.Navigator>
  );
}
