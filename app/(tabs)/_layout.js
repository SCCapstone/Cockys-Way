import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useRouter } from "expo-router";

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#73000A" }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
          headerRight: () => {
            return (
              <FontAwesome
                size={24}
                name="user"
                style={{ marginRight: 20, marginBottom: 5 }}
                onPress={() => {
                  router.push("/login");
                }}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="directory"
        options={{
          title: "Directory",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="address-book" color={color} />
          ),
          headerRight: () => {
            return (
              <FontAwesome
                size={24}
                name="user"
                style={{ marginRight: 20, marginBottom: 5 }}
                onPress={() => {
                  console.log("Login pressed");
                  router.push("/login");
                }}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="calendar" color={color} />
          ),
          headerRight: () => {
            return (
              <FontAwesome
                size={24}
                name="user"
                style={{ marginRight: 20, marginBottom: 5 }}
                onPress={() => {
                  console.log("Login pressed");
                  router.push("/login");
                }}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="cog" color={color} />
          ),
          headerRight: () => {
            return (
              <FontAwesome
                size={24}
                name="user"
                style={{ marginRight: 20, marginBottom: 5 }}
                onPress={() => {
                  console.log("Login pressed");
                  router.push("/login");
                }}
              />
            );
          },
        }}
      />
    </Tabs>
  );
}
