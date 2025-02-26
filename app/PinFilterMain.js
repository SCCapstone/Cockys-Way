import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, Switch, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useFonts, Abel_400Regular } from '@expo-google-fonts/abel';
import * as SplashScreen from 'expo-splash-screen';
import { FIREBASE_AUTH, FIREBASE_DB, FIRESTORE_DB } from "../FirebaseConfig";
import { updateProfile, getAuth } from "firebase/auth";
import { 
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  collection, 
  getDocs, 
  doc, 
  setDoc,
} from "firebase/firestore";
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native'; // hopefully to send user to map

SplashScreen.preventAutoHideAsync();

/*
        Chloe To-Do:
        -   Get their data, then add a favorites & visibility variable
                -   NEED Visibility, maybe not Favorites yet

*/

// Main component
export default function FilterPinsMainScreen() {
    let [fontsLoaded] = useFonts({
      Abel_400Regular,
    });

    const [dropdownVisibility, setDropdownVisibility] = useState({});
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigation = useNavigation();

    const categories = [
      { label: "Accessible Parking", catId: 23393 },
      { label: "Administrative Buildings", catId: 23396 },
      { label: "Arnold School of Public Health", catId: 24912 },
      { label: "Arts", catId: 59489 },
      { label: "Arts and Sciences", catId: 24903 },
      { label: "Colleges & Schools", catId: 24560 },
      { label: "Darla Moore School of Business", catId: 24904 },
      { label: "Dining", catId: 21041 },
      { label: "Education", catId: 24905 },
      { label: "Greek Village", catId: 24199 },
      { label: "HRSM", catId: 24561 },
      { label: "Honors College", catId: 24914 },
      { label: "Housing", catId: 24197 },
      { label: "Humanities", catId: 59492 },
      { label: "Information & Communications", catId: 24907 },
      { label: "Interdisciplinary", catId: 59493 },
      { label: "Joseph F. Rice School of Law", catId: 24902 },
      { label: "Medicine", catId: 24908 },
      { label: "Molinaroli College of Engineering and Computing ", catId: 24906 },
      { label: "Music", catId: 24909 },
      { label: "Nursing", catId: 24910 },
      { label: "Parking", catId: 9495 },
      { label: "Pharmacy", catId: 24911 },
      { label: "Sciences", catId: 59490 },
      { label: "Social Sciences", catId: 59491 },
      { label: "Social Work", catId: 24913 },
      { label: "The Graduate School ", catId: 24901 },
      { label: "Other Buildings", catId: 9492 },


      //{ label: "Athletics", catId: 21035 },
      // Check back to make sure ALL locations listed
    ];

  // NEW FETCH LOCATIONS FROM FIRESTORE
  //useEffect(() => {
    const fetchLocations = async () => {
      try {
        const query = await getDocs(collection(FIRESTORE_DB, "locTest"));
        const db_data = query.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        //setMarkers(db_data);
        //setFilteredMarkers(db_data);
        setLocations(db_data);
        setIsLoading(false);

      } catch (err) {
        Alert.alert("Error fetching data");
        setIsLoading(false);
      }
    };

    fetchLocations();
  //}, []);

  useEffect(() => {
    fetchLocations();
  }, []);


  const toggleDropdown = (label) => {
    setDropdownVisibility((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };



  const getFilteredLocations = (locations, catId) => {
    //console.log("Filtering locations for catId:", catId);
    //console.log("Available locations:", locations);
  
    const filtered = locations
      .filter((location) => location.catId === catId && location.title)
      .map((location) => location.title)
      .sort();
  
    //console.log("Filtered locations:", filtered);
    return filtered;
  };

/*
  const getFilteredLocations = (locations, parent) => {
    return locations
      .filter((location) => location.parent === parent && location.title)
      .map((location) => location.title)                    // Changed name to title
      .sort();
  };
*/ 
    useEffect(() => {
      if (fontsLoaded) {
        SplashScreen.hideAsync();
      }
    }, [fontsLoaded]);
      

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
          const filteredNames = getFilteredLocations(locations, category.catId);    // ORIGINAL
          //const filteredNames = getFilteredLocations(locations, category.parent);
  
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
                // changed FlatList to View
//                <FlatList
//                  data={filteredNames}
//                  keyExtractor={(item, index) => index.toString()}
//                  renderItem={({ item }) => (
//                    <View style={styles.dropdownItem}>
//                      <Text>{item}</Text>
//                    </View>
//                  )}
//                /> 
                <View>
                {filteredNames.map((name, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => navigation.navigate('Map', { location: name })}
                  >
                    <Text>{name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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