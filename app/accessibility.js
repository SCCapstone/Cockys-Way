import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useFonts, Abel_400Regular } from "@expo-google-fonts/abel";
import * as SplashScreen from "expo-splash-screen";
import { FIREBASE_AUTH, FIREBASE_DB } from "../FirebaseConfig";
import { updateProfile, getAuth } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { router } from "expo-router";
import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";

SplashScreen.preventAutoHideAsync();

export default function AccessibilityScreen() {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  let [fontsLoaded] = useFonts({
    Abel_400Regular,
  });

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
      color: colors.primary,
      fontFamily: "Abel_400Regular",
    },
    content: {
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 5,
    },
    text: {
      fontSize: 18,
      color: colors.text,
      fontFamily: "Abel_400Regular",
    },
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Accessibility</Text>
      <View style={styles.content}>
        <Text style={styles.text}>
          Here you can manage your accessibility settings.
        </Text>
        {/* Add more content as needed */}
      </View>
    </ScrollView>
  );
}

const updateAccessibilitySettings = async (newSettings) => {
  const user = getAuth().currentUser;
  if (user) {
    try {
      const userDoc = doc(FIREBASE_DB, "users", user.uid);
      await setDoc(userDoc, newSettings, { merge: true });
      console.log("Accessibility settings updated successfully");
    } catch (error) {
      console.error("Error updating accessibility settings:", error);
    }
  } else {
    console.error("No UID provided");
  }
};

export { updateAccessibilitySettings };
