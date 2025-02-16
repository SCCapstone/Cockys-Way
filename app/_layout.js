import { Stack } from 'expo-router';

export default function Layout() {
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