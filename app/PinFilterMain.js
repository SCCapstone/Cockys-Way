import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, Switch, TouchableOpacity } from 'react-native';
import { useFonts, Abel_400Regular } from '@expo-google-fonts/abel';
import * as SplashScreen from 'expo-splash-screen';
import { FIREBASE_AUTH, FIREBASE_DB } from "../FirebaseConfig";
import { updateProfile, getAuth } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { router } from 'expo-router';

SplashScreen.preventAutoHideAsync();

/*
        This will be the page for the overall Pin Filters.
        Main page has all the main categories.
        Clicking them opens all the subcategories.
        Opening subcategory opens all the locations there.


        Chloe To-Do:
        -   Get all the locations in there
        -   Get their data, then add a favorites & visibility variable
                -   NEED Visibility, maybe not Favorites yet
        -   Get locations to have all current & old names

        -   Search looks through location array & returns list of all locations
            whose names or address strings include the characters in the search
                    Later, can adjust to have google-like search (accounting for typos)

*/

export default function FilterPinsMainScreen() {
  let [fontsLoaded] = useFonts({
    Abel_400Regular,
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
    /*  Using '/PrivacySecurity' as a placeholder for each tab 
        This should later be replaced to instead be dropdowns of sub-categories.
        Then, following the same format, under sub-categories, list out each location
    
    */
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Filter Pins</Text>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/PrivacySecurity')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Self-Made Pins</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/PrivacySecurity')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Favorited Pins</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/PrivacySecurity')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Academic Buildings</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/PrivacySecurity')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Administrative Buildings</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/PrivacySecurity')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Athletic Buildings</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/PrivacySecurity')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>College Buildings</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/PrivacySecurity')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Dining</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/PrivacySecurity')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Housing</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/PrivacySecurity')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Parking</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/PrivacySecurity')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Shuttle Stops</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/PrivacySecurity')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Rentables</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/PrivacySecurity')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Bike Racks</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/PrivacySecurity')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Multipurpose Buildings</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.text}>Here you can look at all the upper-level categories for pins. (remove this text when done)</Text>
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
    backgroundColor: '#F3F3F3',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#73000A',
    fontFamily: 'Abel_400Regular',
  },
  content: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 5,
  },
  text: {
    fontSize: 18,
    color: '#000000',
    fontFamily: 'Abel_400Regular',
  },
});

export { updateAccessibilitySettings };



/*
        For Chloe because her memory is shite

        To commit:
        git add .
        git commit -m "Message"
        git pull
    

*/