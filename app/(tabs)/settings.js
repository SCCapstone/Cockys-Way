import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { useFonts, Abel_400Regular } from '@expo-google-fonts/abel';
import * as SplashScreen from 'expo-splash-screen';

import { doc, setDoc, getDoc } from "firebase/firestore"; 
import { getFirestore } from "firebase/firestore";
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';

// Prevent the splash screen from hiding until fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function SettingsScreen() {
  // State to track whether notifications are enabled
  const [isEnabled, setIsEnabled] = React.useState(false);

  // Initialize Firestore
  const firestore = getFirestore();

  // Fetch the notification settings from Firestore when the component mounts
  useEffect(() => {
    const fetchNotificationSetting = async () => {
      const user = getAuth().currentUser; // Get the current authenticated user
      if (user) {
        const uid = user.uid; // Get the user's unique identifier (UID)
        try {
          // Reference the user's settings document in Firestore
          const userDocRef = doc(firestore, "settings", uid);
          const userDoc = await getDoc(userDocRef); // Fetch the document

          if (userDoc.exists()) {
            // Extract the notificationsEnabled setting or default to false
            const data = userDoc.data();
            const notificationsEnabled = data.settings?.notificationsEnabled || false;
            setIsEnabled(notificationsEnabled); // Update the toggle state
          } else {
            console.log("No settings document found for user.");
          }
        } catch (error) {
          console.error("Error fetching Firestore settings: ", error);
        }
      } else {
        console.error("No user is signed in.");
      }
    };

    fetchNotificationSetting(); // Call the function to fetch settings
  }, [firestore]); // Dependency ensures this runs on component mount or Firestore instance change

  // Function to handle the toggle switch
  const toggleSwitch = async () => {
    const newState = !isEnabled; // Calculate the new state
    setIsEnabled(newState); // Update the local toggle state

    const user = getAuth().currentUser; // Get the current authenticated user
    if (user) {
      const uid = user.uid; // Get the user's UID
      try {
        // Update the user's notificationsEnabled setting in Firestore
        const userDocRef = doc(firestore, "settings", uid);
        await setDoc(
          userDocRef,
          { settings: { notificationsEnabled: newState } }, // Update notificationsEnabled under settings
          { merge: true } // Merge the update to avoid overwriting other fields
        );
        console.log("Notification settings updated in Firestore.");
      } catch (error) {
        console.error("Error updating Firestore settings: ", error);
      }
    } else {
      console.error("No user is signed in.");
    }
  };

  // Load custom fonts and hide splash screen when fonts are ready
  let [fontsLoaded] = useFonts({
    Abel_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync(); // Hide the splash screen
    }
  }, [fontsLoaded]);

  // Show nothing until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      {/* Navigate to Privacy and Security screen */}
      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/PrivacySecurity')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Privacy and Security</Text>
        </View>
      </TouchableOpacity>
      {/* Navigate to Favorite Locations screen */}
      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/favLocations')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Favorite Locations</Text>
        </View>
      </TouchableOpacity>
      {/* Navigate to Accessibility settings */}
      <View style={styles.settingItem}>
        <TouchableOpacity style={styles.accentBox} onPress={() => router.push('/accessibility')}>
          <Text style={styles.settingText}>Accessibility</Text>
        </TouchableOpacity>
      </View>
      {/* Navigate to My Account settings */}
      <View style={styles.settingItem}>
        <TouchableOpacity style={styles.accentBox} onPress={() => router.push('/login')}>
          <Text style={styles.settingText}>My Account</Text>
        </TouchableOpacity>
      </View>
      {/* Enable Notifications toggle */}
      <View style={styles.settingItem}>
        <View style={styles.accentBoxSmall}>
          <Text style={styles.settingText}>Enable Notifications</Text>
          <Switch
            trackColor={{ false: "#000000", true: "#FFFFFF" }} // Black for off, White for on
            thumbColor={isEnabled ? "#F3F3F3" : "#FFFFFF"} // Light grey for on, White for off
            ios_backgroundColor="#F3F3F3" // Background color
            onValueChange={toggleSwitch} // Call toggleSwitch function on toggle
            value={isEnabled} // Bind toggle state to isEnabled
          />
        </View>
      </View>
    </ScrollView>
  );
}

// Styles for the settings screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F3F3F3', // Light grey background
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#73000A', // Garnet color for header text
    fontFamily: 'Abel_400Regular',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0', // Light grey border
  },
  accentBox: {
    backgroundColor: '#73000A', // Garnet background for buttons
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  accentBoxSmall: {
    backgroundColor: '#73000A', // Garnet background for smaller sections
    padding: 5,
    borderRadius: 5,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 22.5,
    color: '#FFFFFF', // White text
    fontFamily: 'Abel_400Regular',
  },
});
