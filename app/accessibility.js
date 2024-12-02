import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { FIREBASE_AUTH, FIREBASE_DB } from "../FirebaseConfig";
import { updateProfile, getAuth } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { router } from "expo-router";

export default function AccessibilityScreen() {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F3F3F3",
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#73000A",
  },
  content: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 5,
  },
  text: {
    fontSize: 18,
    color: "#000000",
  },
});

export { updateAccessibilitySettings };
