import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, Switch, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useFonts, Abel_400Regular } from '@expo-google-fonts/abel';
import * as SplashScreen from 'expo-splash-screen';
import { FIREBASE_AUTH, FIREBASE_DB } from "../FirebaseConfig";
import { updateProfile, getAuth } from "firebase/auth";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { router } from 'expo-router';

SplashScreen.preventAutoHideAsync();

/*
        Originally took this code from the Accessibility page.
        Need to edit to be Filter Pins instead




        This will be the page for the overall Pin Filters.
        Main page has all the main categories.
        Clicking them opens all the subcategories.
        Opening subcategory opens all the locations there.


        Chloe To-Do:
        -   Get their data, then add a favorites & visibility variable
                -   NEED Visibility, maybe not Favorites yet
        -   Get locations to have all current & old names

        ********************************************************************************************** GET THIS DONE ASAP
        -   Get the categories to actually list all of the locations belonging to it
        **********************************************************************************************

*/

//const getFilteredLocations = (locations, catId) => {
//    return locations.filter(location => location.catId === catId).map(location => location.title);       // 9:37pm changed name to title
//};



// Main component
export default function FilterPinsMainScreen() {
    let [fontsLoaded] = useFonts({
      Abel_400Regular,
    });

    // Fetch markers from Firebase                      ADDED AFTER GETTING ALL LOCATIONS IN
 /*
    useEffect(() => {
        const fetchMarkers = async () => {
        try {
            //const query = await getDocs(collection(FIRESTORE_DB, "markers"));   // OG
            const query = await getDocs(collection(FIRESTORE_DB, "locTest"));     // Changed to use what Chloe brought in
            const db_data = query.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            }));

            setMarkers(db_data);
            setFilteredMarkers(db_data);
            setIsLoading(false);
        } catch (err) {
            Alert.alert("Error fetching data");
            setIsLoading(false);
        }
    };

    fetchMarkers();
  }, []);
  */
  
    const [dropdownVisibility, setDropdownVisibility] = useState({});
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
//    const [locations, setLocations] = useState([
//      { catId: 9492, name: "Academic Building A" },
//      { catId: 9492, name: "Academic Building B" },
//      { catId: 23396, name: "Administrative Building A" },
//      { catId: 23396, name: "Administrative Building B" },
//      { catId: 24197, name: "Other Building" },
//    ]);
    // Using placeholder buildings for now.         COME BACK LATER & replace with the location data I got before. BEfore that, need to fix formatted_locations.json to stop separating some info
  
    const categories = [
      { label: "Academic Buildings", catId: 9492 },
      { label: "Administrative Buildings", catId: 23396 },
      { label: "Colleges & Schools", catId: 24560 },
      { label: "Housing", catId: 24197 },
      { label: "Dining", catId: 21041 },
      { label: "Athletics", catId: 21035 },
      { label: "Parking", catId: 9495 },
      { label: "Accessibility", catId: 23393 },
      // Add more categories with their respective catIds
      // Academic Buildings, Administrative Buildings, Colleges & Schools, Housing, Dining, Athletics, Parking, Services, Accessibility
    ];

      // Fetch locations from Firebase's locTest collection
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const query = await getDocs(collection(FIREBASE_DB, "locTest"));
        const db_data = query.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLocations(db_data);
        setIsLoading(false);

      } catch (err) {
        Alert.alert("Error fetching data");
        setIsLoading(false);
        
      }
    };

    fetchLocations();
  }, []);

  const toggleDropdown = (label) => {
    setDropdownVisibility((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const getFilteredLocations = (locations, catId) => {
    return locations
      .filter((location) => location.catId === catId && location.title)
      .map((location) => location.title)                    // Changed name to title
      .sort();
  };
  
    useEffect(() => {
      if (fontsLoaded) {
        SplashScreen.hideAsync();
      }
    }, [fontsLoaded]);

    // Loading Wheel
    if (!fontsLoaded || isLoading) {
      return (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#73000A" />
          </View>
      );
    }
  
 //   const toggleDropdown = (label) => {
//      setDropdownVisibility((prev) => ({
//        ...prev,
//        [label]: !prev[label],
//      }));
//    };
  
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Filter Pins</Text>
  
        {categories.map((category) => {
          const filteredNames = getFilteredLocations(locations, category.catId);
  
          return (
            <View key={category.label}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => toggleDropdown(category.label)}
              >
                <View style={styles.accentBoxSmall}>
                    <View style={styles.accentBox}>
                        <Text style={styles.settingText}>{category.label}</Text>
                    </View>
                </View>
              </TouchableOpacity>
  
              {dropdownVisibility[category.label] && filteredNames.length > 0 && (
                <FlatList
                  data={filteredNames}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.dropdownItem}>
                      <Text>{item}</Text>
                    </View>
                  )}
                />
              )}

            {dropdownVisibility[category.label] && filteredNames.length === 0 && (
              <View style={styles.dropdownItem}>
                <Text>No locations available for this category.</Text>
              </View>
            )}

            </View>
          );
        })}
      </ScrollView>
    );
  }








//    DON'T REMOVE BELOW COMMENTED CODE YET. NEED TO GET PIN FILTERS ACTUALLY WORKING FIRST

/*
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
//          Using '/accessibility' as a placeholder for each tab 
//          This should later be replaced to instead be dropdowns of sub-categories.
//          Then, following the same format, under sub-categories, list out each location
    

    <ScrollView style={styles.container}>
      <Text style={styles.header}>Filter Pins</Text>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/accessibility')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Self-Made Pins</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/accessibility')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Favorited Pins</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/accessibility')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Academic Buildings</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/accessibilityy')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Administrative Buildings</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/accessibility')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Athletic Buildings</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/accessibility')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>College Buildings</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/accessibility')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Dining</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/accessibility')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Housing</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/accessibility')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Parking</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/accessibility')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Shuttle Stops</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/accessibility')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Rentables</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/accessibility')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Bike Racks</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/accessibility')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Multipurpose Buildings</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.text}>Here you can look at all the upper-level categories for pins. (remove this text when done)</Text>
        { Add more content as needed }
      </View>
    </ScrollView>
  );
} // End of FilterPinsMainScreen
*/

/*          Uncomment if code breaks
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
*/

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
  settingItem: {
   padding: 5,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  dropdownItem: {
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
// New Chloe code for loading wheel
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
  },
});

// export { updateAccessibilitySettings };



/*
        For Chloe because her memory is Absolutely Horrible

        To commit:
        git pull
        git add .
        git commit -m "Message"
        git push
    

*/