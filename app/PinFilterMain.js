import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Switch,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useFonts, Abel_400Regular } from "@expo-google-fonts/abel";
import * as SplashScreen from "expo-splash-screen";
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
import { router } from "expo-router";
import { useNavigation } from "@react-navigation/native"; // hopefully to send user to map
//import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import FontAwesome from '@expo/vector-icons/FontAwesome'; // for visibility icon
import { CategoryVisibilityContext, CategoryVisibilityProvider } from "./CategoryVisibilityContext";


SplashScreen.preventAutoHideAsync();

/*
        Chloe To-Do:
        -   FIX DEFAULT SHOWN PINS TO BE COLLEGES & SCHOOLS

*/

// Main component
export default function FilterPinsMainScreen() {
  let [fontsLoaded] = useFonts({
    Abel_400Regular,
  });

  const [dropdownVisibility, setDropdownVisibility] = useState({});
  const [locations, setLocations] = useState([]);
    // trying to rename all this to markers to make life easier (copium)
    // NOT DONE YET. WILL DO LATER -C
    //const [markers, setMarkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    header: {
      fontSize: 30,
      fontWeight: "bold",
      marginBottom: 20,
      color: colors.primary,
      fontFamily: "Abel_400Regular",
    },
    content: {
      padding: 20,
      borderRadius: 5,
    },
    text: {
      fontSize: 18,
      color: colors.text,
      fontFamily: "Abel_400Regular",
      marginLeft: 20,
    },
    settingItem: {
      padding: 5,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    dropdownItem: {
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
      padding: 5,
      borderRadius: 5,
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    settingText: {
      fontSize: 22.5,
      fontFamily: "Abel_400Regular",
      color: colors.alwaysWhite,
    },
      // toggle all
    toggleButton: {
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 5,
      marginBottom: 20,
      alignItems: "center",
    },
    toggleButtonText: {
      color: colors.alwaysWhite,
      fontSize: 18,
      fontWeight: "bold",
    },
  });

    // Working more towards toggling visibility of locations in categories
    //const [categoryVisibility, setCategoryVisibility] = useState({});
    const { categoryVisibility, 
      setCategoryVisibility, 
      //isInitialized 
    } = useContext(CategoryVisibilityContext);
    // for changing ALL locations to visible/hidden
    const [allVisible, setAllVisible] = useState(true);

    // Debugging: Checking if isInitialized is right bc this mf keeps loading like a mf
    //console.log("PinFilterMain - isInitialized:", isInitialized);
    console.log("PinFilterMain - categoryVisibility:", categoryVisibility);


    /*
    if (!isInitialized) {
      console.log("Waiting for category visibility to initialize...");
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#73000A" />
        </View>
      );
    }
      */

    if (!categoryVisibility || !setCategoryVisibility) {
      console.error("CategoryVisibilityContext is not available.");
    }
    console.log("Category visibility initialized:", categoryVisibility);

    //console.log("CategoryVisibilityContext:", { categoryVisibility, setCategoryVisibility });
    //console.log("CategoryVisibilityContext:", categoryVisibility);

    const categories = [
      { label: "Accessible Parking", catId: 23393 },
      { label: "Administrative Buildings", catId: 23396 },
      //{ label: "Arnold School of Public Health", catId: 24912 },
      { label: "Arts", catId: 59489 },
      //{ label: "Arts and Sciences", catId: 24903 },
      { label: "Athletics", catId: 21035 },
      { label: "Colleges & Schools", catId: [24560, 24912, 24903, 24904, 24905, 24914, 
                                              24907, 24902, 24908, 24906, 24909, 24910,
                                              24911, 24913, 24901] },
      //{ label: "Darla Moore School of Business", catId: 24904 },
      { label: "Dining", catId: 21041 },
      //{ label: "Education", catId: 24905 },
      { label: "Greek Village", catId: 24199 },
      { label: "HRSM", catId: 24561 },
      //{ label: "Honors College", catId: 24914 },
      { label: "Housing", catId: [24197, 9497] },
      { label: "Humanities", catId: 59492 },
      //{ label: "Information & Communications", catId: 24907 },
      { label: "Interdisciplinary", catId: 59493 },
      //{ label: "Joseph F. Rice School of Law", catId: 24902 },
      //{ label: "Medicine", catId: 24908 },
      //{ label: "Molinaroli College of Engineering and Computing ", catId: 24906 },
      //{ label: "Music", catId: 24909 },
      //{ label: "Nursing", catId: 24910 },

      //{ label: "Parking", catId: 9495 },
      { label: "Parking", catId: [21046, 21047, 21048, 21049, 21050, 21780, 69645, 69646, 61610] },
      //{ label: "Pharmacy", catId: 24911 },
      { label: "Sciences", catId: 59490 },
      { label: "Social Sciences", catId: 59491 },
      //{ label: "Social Work", catId: 24913 },
      //{ label: "The Graduate School ", catId: 24901 },
      { label: "Other Buildings", catId: 9492 },


    // ok all locations should be listed
  ];

  // NEW FETCH LOCATIONS FROM FIRESTORE
  //useEffect(() => {
    const fetchLocations = async () => {
      try {
        const query = await getDocs(collection(FIRESTORE_DB, "locTest"));
        const db_data = query.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((location) => location.color !== "blue"); // IGNORE CUSTOM PINS

        //setMarkers(db_data);
        //setFilteredMarkers(db_data);

        setLocations(db_data);  // renamed at 6pm 3/27/25
        //setMarkers(db_data);
        setIsLoading(false);

      } catch (err) {
        Alert.alert("Error fetching data");
        setIsLoading(false);
      }
    };

    //fetchLocations();
    // MAY NEED TO UNCOMMENT IF BROKEN. COMMENTED OUT AFTER NEW CONTEXT. -C
  //}, []);

  useEffect(() => {
    fetchLocations();
    console.log("Locations fetched:", locations);
  }, []);



  // previous useEffect dealt with initial visibility before I moved that to CategoryVisibilityContext.js
  useEffect(() => {
    const allCategoriesVisible = categories.every((category) => {
      if (Array.isArray(category.catId)) {
        return category.catId.every((id) => categoryVisibility[id]);
      }
      return categoryVisibility[category.catId];
    });

    setAllVisible(allCategoriesVisible);
  }, [categoryVisibility]);



  const toggleDropdown = (label) => {
    setDropdownVisibility((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };


  const toggleAllCategories = () => {
    // debugging: toggle all styles suddenly broke after 3/31 merge
    //console.log("Toggle Button Style:", styles.toggleButton);
    //console.log("Toggle Button Text Style:", styles.toggleButtonText);
    const newVisibility = {};
    const shouldHideAll = allVisible;
  
    categories.forEach((category) => {
      if (Array.isArray(category.catId)) {
        category.catId.forEach((id) => {
          newVisibility[id] = !shouldHideAll;
        });
      } else {
        newVisibility[category.catId] = !shouldHideAll;
      }
    });
  
    setCategoryVisibility(newVisibility);
    setAllVisible(!shouldHideAll);
  };


  const getFilteredLocations = (locations, catId) => {
    //console.log("Filtering locations for catId:", catId);
    //console.log("Available locations:", locations);

    const filtered = locations
      //.filter((location) => location.catId === catId && location.title)
      .filter((location) => {
        if (Array.isArray(catId)) {
          return catId.includes(location.catId); // Check if location.catId is in the array
        }
        return location.catId === catId; // Check for single catId
      })
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

    if (!fontsLoaded 
      || isLoading 
      //|| !isInitialized
    ) {
      console.log("Waiting for fonts, locations, or category visibility to initialize...");
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

        {/* Add the toggle all button */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleAllCategories}
        >
          <Text style={styles.toggleButtonText}>
            {allVisible ? "Click to Hide All Categories" : "Click to Show All Categories"}
          </Text>
        </TouchableOpacity>
  
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

                    {/* Add the visibility toggle icon */}
                    <TouchableOpacity
                      onPress={() => toggleCategoryVisibility(category.catId)}
                    >
                      <FontAwesome
                        //name={categoryVisibility[category.catId] ? "eye" : "eye-slash"}
                        name={
                          Array.isArray(category.catId)
                            ? category.catId.every((id) => categoryVisibility[id]) // Check if all IDs are visible
                              ? "eye"
                              : "eye-slash"
                            : categoryVisibility[category.catId]
                            ? "eye"
                            : "eye-slash"
                        } // changed logic to account for categories which might be arrays
                        size={24}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>

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
                
                  {/*
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => router.push('Map', { location })}
                  >
                    <Text>{location.title}</Text>
                  </TouchableOpacity> */}
                  <View>
                    {filteredNames
                      .filter(() => categoryVisibility[category.catId]) // Only show if category is visible
                      .map((location, index) => (
                        <View
                          key={index} style={styles.dropdownItem}>
                          <Text>{location}</Text>
                        </View>
                      ))}
                  </View>
              </View>
            )}

            {dropdownVisibility[category.label] &&
              filteredNames.length === 0 && (
                <View style={styles.dropdownItem}>
                  <Text style={styles.text}>
                    No locations available for this category.
                  </Text>
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

/*
    COMMENTED OUT AFTER THEMECONTEXT OVERHAUL
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
  // toggle all
  toggleButton: {
    backgroundColor: "#73000A", // Garnet color
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 2, // Add border for debugging
  borderColor: "#FFFFFF", // White border
  },
  toggleButtonText: {
    color: "#FFFFFF", // White text
    fontSize: 18,
    fontWeight: "bold",
  },
});
*/

// export { updateAccessibilitySettings };

/*
        For Chloe because her memory is Absolutely Horrible

        To commit:
        git pull
        git add .
        git commit -m "Message"
        git push
    

*/
