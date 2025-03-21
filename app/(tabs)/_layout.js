import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useRouter } from "expo-router";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { useContext } from "react";
import { ThemeContext } from "../../ThemeContext";

export default function TabLayout() {
  const router = useRouter();
  const auth = FIREBASE_AUTH;
  const { theme } = useContext(ThemeContext);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: {
          color: theme.colors.text,
        },
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
          headerRight: () => (
            <FontAwesome
              size={24}
              name="user"
              color={theme.colors.text}
              style={{ marginRight: 20, marginBottom: 5 }}
              onPress={() => {
                auth.currentUser
                  ? router.push("/SignOut")
                  : router.push("/login");
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="directory"
        options={{
          title: "Directory",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="address-book" color={color} />
          ),
          headerRight: () => (
            <FontAwesome
              size={24}
              name="user"
              color={theme.colors.text}
              style={{ marginRight: 20, marginBottom: 5 }}
              onPress={() => {
                auth.currentUser
                  ? router.push("/SignOut")
                  : router.push("/login");
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="calendar" color={color} />
          ),
          headerRight: () => (
            <FontAwesome
              size={24}
              name="user"
              color={theme.colors.text}
              style={{ marginRight: 20, marginBottom: 5 }}
              onPress={() => {
                auth.currentUser
                  ? router.push("/SignOut")
                  : router.push("/login");
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="cog" color={color} />
          ),
          headerRight: () => (
            <FontAwesome
              size={24}
              name="user"
              color={theme.colors.text}
              style={{ marginRight: 20, marginBottom: 5 }}
              onPress={() => {
                auth.currentUser
                  ? router.push("/SignOut")
                  : router.push("/login");
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
