import { Stack, useRouter } from "expo-router";

export default function Layout() {
  const router = useRouter();
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
    </Stack>
  );
}
