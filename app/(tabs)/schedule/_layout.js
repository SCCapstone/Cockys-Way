import { Stack } from "expo-router";

export default function ScheduleLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />

      <Stack.Screen
        name="addClassForm"
        options={{
          title: "",
          headerTransparent: true,
          headerTintColor: "white",
          headerStyle: {
            marginBottom: 60,
          },
        }}
      />

      <Stack.Screen
        name="addClassSearchResults"
        options={{
          title: "",
          headerTransparent: true,
          headerTintColor: "white",
          headerStyle: {
            marginBottom: 60,
          },
        }}
      />
    </Stack>
  );
}
