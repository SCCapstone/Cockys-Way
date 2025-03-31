import { Stack } from "expo-router";
import { useContext } from "react";
import { ThemeProvider, ThemeContext } from "../ThemeContext";
import { ActivityIndicator, View } from "react-native";
import { DefaultTheme } from "@react-navigation/native";

function AppLayout() {
  const { isLoaded, theme } = useContext(ThemeContext);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const screenOptions = {
    headerStyle: {
      backgroundColor: theme.colors.card,
    },
    headerTintColor: theme.colors.text,
  };

import { Stack, Slot } from 'expo-router';
import { CategoryVisibilityProvider } from "./CategoryVisibilityContext";
// added above line to connect Map with Pin Filter page for Visibility use

export default function Layout() {
  return (
    <Stack screenOptions={screenOptions}>
    <CategoryVisibilityProvider>
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
          headerBackTitle: "Back",
          headerTintColor: theme.colors.text,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: "Register",
          headerBackTitleVisible: false,
          headerTintColor: theme.colors.text,
        }}
      />
      <Stack.Screen
        name="professorInfo"
        options={{
          title: "",
          headerTintColor: theme.colors.text,
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="addClassForm"
        options={{
          title: "Search for Classes",
          headerTintColor: theme.colors.text,
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="forgotPassword"
        options={{
          title: "Forgot Password",
          headerBackTitleVisible: false,
          headerTintColor: theme.colors.text,
        }}
      />
      <Stack.Screen
        name="addClassSearchResults"
        options={{
          title: "Search Results",
          headerBackTitleVisible: false,
          headerTintColor: theme.colors.text,
        }}
      />
      <Stack.Screen
        name="PrivacySecurity"
        options={{
          title: "Privacy and Security",
          headerBackTitle: "Back",
          headerTintColor: theme.colors.text,
        }}
      />
      <Stack.Screen
        name="favLocations"
        options={{
          title: "Favorite Locations",
          headerTintColor: theme.colors.text,
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="accessibility"
        options={{
          title: "Accessibility",
          headerTintColor: theme.colors.text,
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="MyAccount"
        options={{
          title: "My Account",
          headerTintColor: theme.colors.text,
          headerBackTitle: "Back",
        }}
      />

      <Stack.Screen
        name="PinFilterMain"
        options={{
          title: "Filter Pins",
          headerBackTitle: "Back",
          headerTintColor: theme.colors.text,
        }}
      />
      <Stack.Screen
        name="routeHistory"
        options={{
          title: "Route History",
          headerTintColor: theme.colors.text,
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="courseInfo"
        options={{
          title: "Course Info",
          headerTintColor: theme.colors.text,
        }}
      />
      <Stack.Screen
        name="SignOut"
        options={{
          title: "Sign Out",
          headerBackTitle: "Back",
          headerTintColor: theme.colors.text,
        }}
      />
    </Stack>
    </CategoryVisibilityProvider>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <AppLayout />
    </ThemeProvider>
  );
}

export { theme } from "../ThemeContext";
