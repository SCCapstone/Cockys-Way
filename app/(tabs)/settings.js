import React, { useEffect, useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFonts, Abel_400Regular } from "@expo-google-fonts/abel";
import * as SplashScreen from "expo-splash-screen";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { router } from "expo-router";
import { getAuth } from "firebase/auth";
import { useTheme } from "@react-navigation/native";
import { ThemeContext } from "../../ThemeContext";

SplashScreen.preventAutoHideAsync();

export default function SettingsScreen() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const firestore = getFirestore();
  const { setIsDarkTheme } = useContext(ThemeContext);

  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.background,
    },
    header: {
      fontSize: 30,
      fontWeight: "bold",
      marginBottom: 20,
      fontFamily: "Abel_400Regular",
      color: colors.text,
    },
    settingItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    accentBox: {
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 5,
      flex: 1,
    },
    accentBoxSmall: {
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 5,
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    settingText: {
      fontSize: 22.5,
      color: colors.alwaysWhite,
      fontFamily: "Abel_400Regular",
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const user = getAuth().currentUser;
      if (user) {
        const uid = user.uid;
        try {
          const userDocRef = doc(firestore, "settings", uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            const notificationsEnabled =
              data.settings?.notificationsEnabled || false;
            const theme = data.settings?.theme || "light";
            setIsEnabled(notificationsEnabled);
            setIsDarkMode(theme === "dark");
          } else {
            console.log("No settings document found for user.");
          }
        } catch (error) {
          console.error("Error fetching Firestore settings: ", error);
        }
      } else {
        Alert.alert(
          "Sign In Required",
          "Please sign in to access your settings.",
          [{ text: "OK" }]
        );
      }
    };

    fetchSettings();
  }, [firestore]);

  const toggleSwitch = async () => {
    const newState = !isEnabled;
    setIsEnabled(newState);

    const user = getAuth().currentUser;
    if (user) {
      const uid = user.uid;
      try {
        const userDocRef = doc(firestore, "settings", uid);
        await setDoc(
          userDocRef,
          { settings: { notificationsEnabled: newState } },
          { merge: true }
        );
      } catch (error) {
        console.error("Error updating Firestore settings: ", error);
      }
    } else {
      Alert.alert(
        "Sign In Required",
        "Please sign in to update your notification settings.",
        [{ text: "OK" }]
      );
    }
  };

  const toggleDarkMode = async () => {
    const newState = !isDarkMode;
    setIsDarkMode(newState);
    setIsDarkTheme(newState);

    const user = getAuth().currentUser;
    if (user) {
      const uid = user.uid;
      try {
        const userDocRef = doc(firestore, "settings", uid);
        await setDoc(
          userDocRef,
          { settings: { theme: newState ? "dark" : "light" } },
          { merge: true }
        );
      } catch (error) {
        console.error("Error updating theme preference: ", error);
      }
    } else {
      Alert.alert(
        "Sign In Required",
        "Please sign in to update your theme preference.",
        [{ text: "OK" }]
      );
    }
  };

  let [fontsLoaded] = useFonts({ Abel_400Regular });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.header, { color: colors.text }]}>Settings</Text>

      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => router.push("/PrivacySecurity")}
      >
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Privacy and Security</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => router.push("/favLocations")}
      >
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Favorite Locations</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.settingItem}>
        <TouchableOpacity
          style={styles.accentBox}
          onPress={() => router.push("/accessibility")}
        >
          <Text style={styles.settingText}>Accessibility</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingItem}>
        <TouchableOpacity
          style={styles.accentBox}
          onPress={() => router.push("/MyAccount")}
        >
          <Text style={styles.settingText}>My Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.accentBoxSmall}>
          <Text style={styles.settingText}>Enable Notifications</Text>
          <Switch
            trackColor={{ false: "#000000", true: "#FFFFFF" }}
            thumbColor={isEnabled ? "#F3F3F3" : "#FFFFFF"}
            ios_backgroundColor="#F3F3F3"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.accentBoxSmall}>
          <Text style={styles.settingText}>Dark Mode</Text>
          <Switch
            trackColor={{ false: "#000000", true: "#FFFFFF" }}
            thumbColor={isDarkMode ? "#F3F3F3" : "#FFFFFF"}
            ios_backgroundColor="#F3F3F3"
            onValueChange={toggleDarkMode}
            value={isDarkMode}
          />
        </View>
      </View>
    </ScrollView>
  );
}
