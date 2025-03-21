import { Stack } from "expo-router";
import { useContext } from "react";
import { ThemeProvider, ThemeContext } from "../ThemeContext";
import { ActivityIndicator, View } from "react-native";
import { DefaultTheme } from "@react-navigation/native";

function AppLayout() {
  const { isLoaded } = useContext(ThemeContext);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
          headerBackTitle: "Back",
          headerTintColor: "#73000A",
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: "Register",
          headerBackTitleVisible: false,
          headerTintColor: "#73000A",
        }}
      />
      <Stack.Screen
        name="professorInfo"
        options={{
          title: "",
          headerTintColor: "#73000A",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="addClassForm"
        options={{
          title: "Add Class",
          headerBackTitleVisible: false,
          headerTintColor: "#73000A",
        }}
      />
      <Stack.Screen
        name="forgotPassword"
        options={{
          title: "Forgot Password",
          headerBackTitleVisible: false,
          headerTintColor: "#73000A",
        }}
      />
      <Stack.Screen
        name="addClassSearchResults"
        options={{
          title: "Search Results",
          headerBackTitleVisible: false,
          headerTintColor: "#73000A",
        }}
      />
      <Stack.Screen
        name="PrivacySecurity"
        options={{
          title: "Privacy and Security",
          headerTintColor: "#73000A",
        }}
      />
      <Stack.Screen
        name="favLocations"
        options={{
          title: "Favorite Locations",
          headerTintColor: "#73000A",
        }}
      />
      <Stack.Screen
        name="accessibility"
        options={{
          title: "Accessibility",
          headerTintColor: "#73000A",
        }}
      />
      <Stack.Screen
        name="PinFilterMain"
        options={{
          title: "Filter Pins",
          headerTintColor: "#73000A",
        }}
      />
      <Stack.Screen
        name="courseInfo"
        options={{
          title: "Course Info",
          headerTintColor: "#73000A",
        }}
      />
    </Stack>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <AppLayout />
    </ThemeProvider>
  );
}

export const theme = {
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: "#73000A",
    background: "#FFFFFF",
    text: "#000000",
    card: "#F2F2F2",
    border: "#E0E0E0",
    notification: "#73000A",
  },
};
