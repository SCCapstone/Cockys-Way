import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
          headerBackTitleVisible: false,
          headerBackButtonMenuEnabled: true,
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
          headerBackTitleVisible: false,
          headerTintColor: "#73000A",
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
    </Stack>
  );
}
