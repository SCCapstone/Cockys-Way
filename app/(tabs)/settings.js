import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useFonts, Abel_400Regular } from '@expo-google-fonts/abel';
import * as SplashScreen from 'expo-splash-screen';

import { doc, setDoc, getDoc } from "firebase/firestore"; 
import { getFirestore } from "firebase/firestore";
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';

// Prevent the splash screen from hiding until fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function SettingsScreen() {
  const [isEnabled, setIsEnabled] = React.useState(false);
  const [loading, setLoading] = useState(true);
  const firestore = getFirestore();

  useEffect(() => {
    const fetchNotificationSetting = async () => {
      setLoading(true);

      const user = getAuth().currentUser;
      if (user) {
        const uid = user.uid;
        try {
          const userDocRef = doc(firestore, "settings", uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            const notificationsEnabled = data.settings?.notificationsEnabled || false;
            setIsEnabled(notificationsEnabled);
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
          [
            { text: "OK", onPress: () => console.log("User acknowledged sign-in requirement") }
          ]
        );
      }
      
      setLoading(false);
    };

    fetchNotificationSetting();
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
        console.log("Notification settings updated in Firestore.");
      } catch (error) {
        console.error("Error updating Firestore settings: ", error);
      }
    } else {
      Alert.alert(
        "Sign In Required",
        "Please sign in to update your notification settings.",
        [
          { text: "OK", onPress: () => console.log("User acknowledged sign-in requirement") }
        ]
      );
    }
  };

  let [fontsLoaded] = useFonts({
    Abel_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);
/*
  if (!fontsLoaded) {
    return null;
  }
*/ // Old !fontsLoaded

// CHLOE NEW CODE
  if (!fontsLoaded || loading) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#73000A" />
        </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/PrivacySecurity')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Privacy and Security</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/favLocations')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Favorite Locations</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.settingItem}>
        <TouchableOpacity style={styles.accentBox} onPress={() => router.push('/accessibility')}>
          <Text style={styles.settingText}>Accessibility</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.settingItem}>
        <TouchableOpacity style={styles.accentBox} onPress={() => router.push('/MyAccount')}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F3F3F3',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#73000A',
    fontFamily: 'Abel_400Regular',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  accentBox: {
    backgroundColor: '#73000A',
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  accentBoxSmall: {
    backgroundColor: '#73000A',
    padding: 10, // Updated to match accentBox
    borderRadius: 5,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 22.5,
    color: '#FFFFFF',
    fontFamily: 'Abel_400Regular',
  },

  // New Chloe code for loading wheel
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
  },
});
