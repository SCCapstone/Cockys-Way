import { useContext } from "react";
import { ThemeContext } from "../../../ThemeContext";
import { Stack } from "expo-router";

export default function ScheduleLayout() {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />

      <Stack.Screen
        name="addClassForm"
        options={{
          title: "",
          headerTransparent: true,
          headerTintColor: colors.garnetWhite,
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
          headerTintColor: colors.garnetWhite,
          headerStyle: {
            marginBottom: 60,
          },
        }}
      />
    </Stack>
  );
}
