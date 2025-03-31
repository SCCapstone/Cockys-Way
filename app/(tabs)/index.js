import React, { useEffect, useState, useRef, useContext } from "react";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import {
  StyleSheet,
  SafeAreaView,
  Alert,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Button,
  Platform,
} from "react-native";
import {
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  collection,
  getDocs,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { FIRESTORE_DB } from "../../FirebaseConfig";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SearchBar } from "react-native-elements";
import * as SplashScreen from "expo-splash-screen";
import * as Location from "expo-location";
import MapViewDirections from "react-native-maps-directions";
import { GOOGLE_API_KEY } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { ThemeContext } from "../../ThemeContext";
import createHomeStyles from "../../homestyles";
import darkMapStyle from "../../mapStyles";
import uuid from "react-native-uuid";
import { CategoryVisibilityProvider, CategoryVisibilityContext } from "../CategoryVisibilityContext";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();


export default function HomeScreen() {
  const { theme } = useContext(ThemeContext);
  const styles = createHomeStyles(theme.colors);
  const router = useRouter();
  const [markers, setMarkers] = useState([]);
  const [filteredMarkers, setFilteredMarkers] = useState([]);
  const [search, setSearch] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [travelMode, setTravelMode] = useState("DRIVING");
  const [startLocation, setStartLocation] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);
  const [showTravelModeButtons, setShowTravelModeButtons] = useState(false);
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);
  const [routeSteps, setRouteSteps] = useState([]);
  const [navigationStarted, setNavigationStarted] = useState(false);
  const [followsUser, setFollowsUser] = useState(false);
  const mapRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true); // testing to see if loading works?
  // Creating custom pins
  const [creatingCustomPin, setCreatingCustomPin] = useState(false);
  const [customPinLocation, setCustomPinLocation] = useState(null);
  // popup to show user how to add custom pins
  //const [showCustomPinModal, setShowCustomPinModal] = useState(false);
  const [showCustomPinNotification, setShowCustomPinNotification] = useState(false);
  // adjusting custom pins
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [userFavorites, setUserFavorites] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);

  // Working more towards toggling visibility of locations in categories
  //const [categoryVisibility, setCategoryVisibility] = useState({});
  const { categoryVisibility, isInitialized  } = useContext(CategoryVisibilityContext);


  // Get professor's office location if navigated from ProfessorInfo.js
  const { latitude, longitude } = useLocalSearchParams();
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [navigateToProfessorOffice, setNavigateToProfessorOffice] =
    useState(false);

  // Tutorial constants
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const startNavButtonRef = useRef(null);
  const setStartButtonRef = useRef(null);
  const resetLocationButtonRef = useRef(null);
  const stopDirectionsButtonRef = useRef(null);

  const INITIAL_REGION = {
    latitude: 34.00039991787572,
    longitude: -81.03594096158815,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const onMarkerSelected = (marker) => {
    setSelectedMarker(marker);
    setSelectedDestination({
      latitude: marker.latitude,
      longitude: marker.longitude,
      title: marker.title,
    });

    setShowRouteDetails(true);
    setShowTravelModeButtons(true);
    setRouteSteps([]);

    setIsFavorited(userFavorites.includes(marker.id));

    // Zoom in on marker region
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: marker.latitude - 0.0025, //subtraction will make marker more centered on screen
          longitude: marker.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        950 // 950 is duration of zoom in ms - reduced to handle dark mode styles
      );
    }
  };

  // separate function to handle starting navigation by button instead of onMarkerSelected
  const handleStartNavigation = (marker) => {
    if (!tutorialCompleted) return;
    setNavigationStarted(true);
    const route = {
      title: marker.title,
      startLocation: startLocation,
      endLocation: {
        latitude: marker.latitude,
        longitude: marker.longitude,
      },
      timestamp: new Date().toISOString(),
      travelMode,
    };
    saveRouteHistory(route);
  };

  // category visibility from pin filter      uncomment if errors occur after merge
  /*
  const toggleCategoryVisibility = (catId) => {
    setCategoryVisibility((prev) => ({
      ...prev,
      [catId]: !prev[catId], // Toggle the visibility for the given category
    }));
  };
  */

  // Fetch markers from Firebase
  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        // Fetching public markers from locTest
        const query = await getDocs(collection(FIRESTORE_DB, "locTest")); // Changed to use what Chloe brought in
        const db_data = query.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetching the user's custom pins
        let customPins = [];

        // Check if the user is logged in
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const userId = user.uid;

          // Fetch custom pins for the logged-in user
          const userDocRef = doc(FIRESTORE_DB, "custom-pins", userId);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            customPins = userDocSnap.data().pins || [];
          }
        }

        // Merge public markers with custom pins
        const allMarkers = [...db_data, ...customPins];

        //setMarkers(db_data);
        //setFilteredMarkers(db_data);
        setMarkers(allMarkers);
        setFilteredMarkers(allMarkers);

        setIsLoading(false);

        // Process each location to add alternate names to description
          for (const location of db_data) {

          // Ignore custom pins (made em all blue, so skip blue)
          if (location.color === "blue") {
            //console.log(`Skipping custom pin: ${location.title}`);
            continue; // Skip this iteration for custom pins
          }

            if (
            !location.description ||
            !location.description.includes("Alternate Names:")
          ) {
              await addAlternateNamesToLocation(location);
            }
          }

        // When coming from Professor Info page
        if (latitude & longitude) {
          const newMarker = {
            id: "searched-location",
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            title: "Searched Location",
            description: "Professor's office location",
            color: "blue",
          };

          setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
          setFilteredMarkers((prevMarkers) => [...prevMarkers, newMarker]);
          setSelectedMarker(newMarker);
          setSelectedDestination(newMarker);
          setNavigateToProfessorOffice(true);
        } // end of NEW CODE FOR PROF OFFICE INFO
      } catch (err) {
        console.error("Error fetching markers:", err);
        Alert.alert("Error fetching data");
        setIsLoading(false);
      }
    };

    fetchMarkers();
    //  }, []); // ORIG. COMMENTED OUT FOR OFFICE TEST
  }, [latitude, longitude]); // end of fetching markers

  const [visibleMarkers, setVisibleMarkers] = useState([]);
  //const visibleMarkers = markers.filter(
  //  (marker) => categoryVisibility[marker.catId] !== false
  //);

  useEffect(() => {
    if (markers.length > 0 && Object.keys(categoryVisibility).length > 0) {
      const filteredMarkers = markers.filter(
        (marker) => categoryVisibility[marker.catId] !== false // Only show markers with visible categories
      );
      setVisibleMarkers(filteredMarkers);
    }
  }, [categoryVisibility, markers]);

  /*
   * I used the useEffect so that all favorites already stored
   * would be fetched when the app first starts so the star icon
   * would display correctly
   */
  useEffect(() => {
    const fetchUserFavorites = async () => {
      const user = getAuth().currentUser;
      if (user) {
        const uid = user.uid;
        const userFavoritesRef = doc(FIRESTORE_DB, "favorites", uid);
        const docSnap = await getDoc(userFavoritesRef);
        if (docSnap.exists()) {
          const favorites = docSnap.data().locations || [];
          setUserFavorites(favorites);
        }
      }
    };

    fetchUserFavorites();
  }, []);

  // getting all the alternate names of locations to add to Firestore
  // changed from using longitude & latitude to title due to
  // incorrect coordinates in firestore (correct general area, but not Exact
  // coords in google)
  //    GOOGLE. COMMENTED OUT TO TEST NOMINATIM
  const getAlternateNames = async (title) => {
    try {
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        {
          params: {
            address: title,
            components: "administrative_area:SC|country:US",
            key: GOOGLE_API_KEY,
          },
        }
      );
      //console.log(`Google API Response for "${title}":`, response.data); // Debugging

      if (response.data.status === "OK" && response.data.results.length > 0) {
        const results = response.data.results;

        // error handling
        //if (!Array.isArray(results) || results.length === 0) {
        //  console.error(`Error fetching alternate names: No valid results for ${title}`);
        //  return []; // Ensure we return an array
        //}

        const alternateNames = results.map(
          (result) => result.formatted_address
        );
        const addresses = results.map(
          (result) =>
            result.address_components?.map(
              (component) => component.long_name
            ) || []
        );

        //const combinedNames = [...new Set([...alternateNames, ...addresses.flat()])];
        const combinedNames = [...new Set([...alternateNames, ...addresses])];
        //console.log(`Alternate Names for "${title}":`, combinedNames);

        return combinedNames;
      } else {
        // trying to get this to WORK
        console.warn(`Warning: No results found for "${title}"`);
        return [];
        //console.error('Error fetching alternate names:', response.data.status);
        //return [];
      }
    } catch (error) {
      console.error("Error fetching alternate names:", error);
      return [];
    }
  }; // end of getAlternateNames

  /*
    For testing:
    Looking at Darla Moore School of Business.
    Should get: 1014 Greene St, Columbia, SC 29208
    as one of the alternate names, if anything.
    So searching "1014 Greene" should now show Darla Moore School of Business
  */
  // adding the alternate names to Firestore
  // changed to updating the description instead
  const addAlternateNamesToLocation = async (location) => {
    const { id, title, description, custom } = location;
    if (custom) {
      //console.warn("skipping alternate names for custom pin: " + title);  I commented this because it was annoying me
      return;
    }

    // trying to use title instead of id
    if (!title || typeof title !== "string") {
      console.error(`Invalid Firestore document title:`, title);
      return;
    }

    /*
    const alternateNames = await getAlternateNames(title);

    //if (!Array.isArray(alternateNames)) {
    //  console.error(`Error: alternateNames is not an array for location ${id}`);
    //  return;
    //}

    if (!Array.isArray(alternateNames) || alternateNames.length === 0) {
      console.warn(
        `No valid alternate names found for location "${title}". Skipping update.`
      );
      return; // Skip update if no valid names
      //console.error(`Error: No alternate names found for location ${id}`);
      //return; // Exit early if no valid alternate names
    }

    // Ensure all values properly formatted before joining
    const cleanedAlternateNames = alternateNames
      .flat()
      .filter((name) => typeof name === "string" && name.trim().length > 0);

    //console.log(`Cleaned alternateNames for ${title}:`, cleanedAlternateNames);
    if (cleanedAlternateNames.length === 0) {
      console.warn(
        `Skipping update for ${title} as no valid alternate names remain.`
      );
      return;
    }

    // changing to single line to make firestore stop hating it
    const alternateNamesString = cleanedAlternateNames.join(", ");
    //const updatedDescription = description
    //  ? `${description} | Alternate Names: ${alternateNamesString}`
    //  : `Alternate Names: ${alternateNamesString}`;
    // REPLACING ALL DESCRIPTIONS
    const updatedDescription = `Alternate Names: ${cleanedAlternateNames.join(
      ", "
    )}`;

    // ok getting alt names for lke half the locations, just issues updating them...
    //console.log(`Existing Description:`, description);
    //console.log(`Updated Description (Single Line):`,updatedDescription);
    */ // commented out 3/26/25

    try {
      //const docId = id.toString(); // Convert `id` to string before Firestore update
      //const docRef = doc(FIRESTORE_DB, "locTest", docId);
      const docRef = doc(FIRESTORE_DB, "locTest", title);

      // Check if document exists
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.error(`Error: Document ${title} does not exist in Firestore.`);
        return;
      }

      console.log(
        `Firestore document ${title} found. Proceeding with update...`
      );




      const alternateNames = await getAlternateNames(title);

      if (!Array.isArray(alternateNames) || alternateNames.length === 0) {
        console.warn(`No valid alternate names found for location "${title}". Skipping update.`);
        return;
      }

      const cleanedAlternateNames = alternateNames
        .flat()
        .filter((name) => typeof name === "string" && name.trim().length > 0);

      if (cleanedAlternateNames.length === 0) {
        console.warn(`Skipping update for "${title}" as no valid alternate names remain.`);
        return;
      }

      const updatedDescription = `Alternate Names: ${cleanedAlternateNames.join(", ")}`;


      // idk why i commented this out but lets see what happens if i uncomment it out during the 3/31/25 merge
      await updateDoc(docRef, { description: updatedDescription });


      //await updateDoc(doc(FIRESTORE_DB, "locTest", id.toString()), {
      //  description: updatedDescription,
      //});

      console.log(
        `Updated location ${title} with alternate names in description`
      );
    } catch (error) {
      console.error(
        `Error updating location ${title} with alternate names:`,
        error
      );
    }
  }; // end of addAlternateNamesToLocation

  // THROWS ERROR FOR EVERYTHING. FIX.
  // ALSO ADJUST SEARCH.

  // move the map to selected marker when found
  useEffect(() => {
    //if (selectedMarker && mapRef.current) {
    if (navigateToProfessorOffice && selectedMarker && mapRef.current) {
      setTimeout(() => {
        mapRef.current.animateToRegion(
          {
            latitude: selectedMarker.latitude,
            longitude: selectedMarker.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          2000 // Zoom-in duration in milliseconds
        );
        setShowRouteDetails(true);
      }, 500); // delay makes sure map is fully loaded before zyooming
    }
  }, [navigateToProfessorOffice, selectedMarker]);

  /*
      TO-DO:
      When using search, a minor popup appears saying 
      "A props object containing a 'key' prop is being spread into JSX"
      It doesn't crash or anything, it just. shows that little popup.
      It's been there since last semester.

  */

      // had to fix search after adding pin filters
      // State to track search results
  const [searchResults, setSearchResults] = useState([]);

  // Update filtered markers based on search input
  useEffect(() => {
    if (search === "") {
      // If no search query, reset to visible markers
      setSearchResults([]);
      // ORIG
      //setFilteredMarkers(markers);
    } else {
      const filtered = markers.filter((marker) => {
        const searchLower = search.toLowerCase();
        const titleMatch = marker.title.toLowerCase().includes(searchLower);
        const descriptionMatch = marker.description
          .toLowerCase()
          .includes(searchLower);
        return titleMatch || descriptionMatch;
      });
      //setFilteredMarkers(filtered);
      setSearchResults(filtered);
    }
    //console.log("Filtered Markers:", filteredMarkers); // debugging error when using search
  }, [search, markers]);

  // Determine which markers to display on the map
  const markersToDisplay = searchResults.length > 0 ? searchResults : visibleMarkers;

  // Request location permissions and set startLocation
  // merged both perms and set user location into one -Isaac
  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
        setStartLocation(location.coords);
      } else {
        Alert.alert("Permission denied, please grant location access");
      }
    };

    getLocation();
  }, []);

  // Hide splash screen
  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

  // Initialize default category visibility
  /*
  useEffect(() => {
    const initializeCategoryVisibility = () => {
      const visibility = {};
      markers.forEach((marker) => {
        if (marker.catId && visibility[marker.catId] === undefined) {
          visibility[marker.catId] = true; // Default to visible
        }
      });
      setCategoryVisibility(visibility);
    };
  
    initializeCategoryVisibility();
  }, [markers]);
  */
 
  //const [isVisibilityInitialized, setIsVisibilityInitialized] = useState(false);
  /*
  useEffect(() => {
    const initialVisibility = {};
  
    // Initialize visibility for all categories
    markers.forEach((marker) => {
      if (marker.catId === 24560 || marker.catId === 24912 || marker.catId === 24903 || marker.catId === 24904 || marker.catId === 24905 || marker.catId === 24914 || marker.catId === 24907 || marker.catId === 24902 || marker.catId === 24908 || marker.catId === 24906 || marker.catId === 24909 || marker.catId === 24910 || marker.catId === 24911 || marker.catId === 24913 || marker.catId === 24901) {
        initialVisibility[marker.catId] = true; // Colleges & Schools visible
      } else {
        initialVisibility[marker.catId] = false; // All other categories hidden
      }
    });
  
    setCategoryVisibility(initialVisibility);
    setIsVisibilityInitialized(true); // Mark initialization as complete
  }, [markers]); */

  // Save route history
  const saveRouteHistory = async (route) => {
    try {
      const existingHistory = await AsyncStorage.getItem("routeHistory");
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      history.push(route);
      await AsyncStorage.setItem("routeHistory", JSON.stringify(history));
    } catch (error) {
      console.error("Route history save error: ", error);
    }
  };

  // Adding a custom pin to Firestore
  const addCustomPinToFirestore = async (latitude, longitude) => {
    try {
      // Changing the way custom pins are saved in firestore
      // Get the current user's ID
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Error", "You must be logged in to add custom pins.");
        return;
      }
  
      const userId = user.uid;

      const newPin = {
        id: uuid.v4(), // Generate a unique id so the error popup stops yelling
        latitude,
        longitude,
        title: "Custom Pin",
        description: "User-added pin",
        color: "blue",
        custom: true,
      };

      // Reference to the user's document in the "custom-pins" collection
      const userDocRef = doc(FIRESTORE_DB, "custom-pins", userId);

      // Check if the document exists
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        // If the document exists, update the pins array
        const existingPins = userDocSnap.data().pins || [];
        const updatedPins = [...existingPins, newPin];

        await updateDoc(userDocRef, { pins: updatedPins });
      } else {
        // If the document doesn't exist, create it with the new pin
        await setDoc(userDocRef, { pins: [newPin] });
      }


      //await addDoc(collection(FIRESTORE_DB, "locTest"), newPin);
      //const docRef = await addDoc(collection(FIRESTORE_DB, "locTest"), newPin);
      //newPin.id = docRef.id;
      
      setMarkers((prevMarkers) => [...prevMarkers, newPin]);
      setFilteredMarkers((prevMarkers) => [...prevMarkers, newPin]);
      
      // just so we can see it was added right
      Alert.alert("Success", "Custom pin added successfully!");
    } catch (error) {
      Alert.alert("Error adding custom pin", error.message);
    }
  };

  // When adding custom pin, detect map press
  const handleMapPress = (event) => {
    if (creatingCustomPin) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      setCustomPinLocation({ latitude, longitude });
      setCreatingCustomPin(false);
      // Add the custom pin to Firestore
      setShowCustomPinNotification(false);
      addCustomPinToFirestore(latitude, longitude);
    }
  };

  // For renaming
  const showRenameModal = (pin) => {
    setSelectedMarker(pin);
    setNewTitle(pin.title);
    setNewDescription(pin.description);
    setIsRenameModalVisible(true);
  };

  // rename custom pin
  // originally started as just to rename.
  // adjusted to add ability to change description too.
  const handleRenamePin = async () => {
    if (newTitle && newDescription) {
      try {

        // Get the current user's ID
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          Alert.alert("Error", "You must be logged in to rename custom pins.");
          return;
        }

        const userId = user.uid;
        const userDocRef = doc(FIRESTORE_DB, "custom-pins", userId);

        // Fetch the user's pins
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const existingPins = userDocSnap.data().pins || [];

          // Find the pin to rename and update its title and description
          const updatedPins = existingPins.map((pin) =>
            pin.latitude === selectedMarker.latitude &&
            pin.longitude === selectedMarker.longitude
              ? { ...pin, title: newTitle, description: newDescription }
              : pin
          );

          // Update Firestore with the new pins array
          await updateDoc(userDocRef, { pins: updatedPins });

          // Update local state
          setMarkers((prevMarkers) =>
            prevMarkers.map((marker) =>
              marker.latitude === selectedMarker.latitude &&
              marker.longitude === selectedMarker.longitude
                ? { ...marker, title: newTitle, description: newDescription }
                : marker
            )
          );
          setFilteredMarkers((prevMarkers) =>
            prevMarkers.map((marker) =>
              marker.latitude === selectedMarker.latitude &&
              marker.longitude === selectedMarker.longitude
                ? { ...marker, title: newTitle, description: newDescription }
                : marker
            )
          );

          setIsRenameModalVisible(false);
          Alert.alert("Success", "Custom pin renamed successfully!");
        } else {
          Alert.alert("Error", "No custom pins found for this user.");
        }


        /*
        await updateDoc(doc(FIRESTORE_DB, "locTest", selectedMarker.id), {
          title: newTitle,
          description: newDescription,
        });
        setMarkers((prevMarkers) =>
          prevMarkers.map((marker) =>
            marker.id === selectedMarker.id
              ? { ...marker, title: newTitle, description: newDescription }
              : marker
          )
        );
        setFilteredMarkers((prevMarkers) =>
          prevMarkers.map((marker) =>
            marker.id === selectedMarker.id
              ? { ...marker, title: newTitle, description: newDescription }
              : marker
          )
        );
        setIsRenameModalVisible(false);
        */
      } catch (error) {
        Alert.alert("Error renaming pin", error.message);
      }
    }
  };

  // delete custom pin
  const handleDeletePin = (pin) => {
    Alert.alert(
      "Delete Pin",
      `Delete pin "${pin.title}"?`,
      [
        {
          text: "CANCEL",
          onPress: () => console.log("Delete cancelled"),
          style: "cancel",
        },
        {
          text: "CONFIRM",
          onPress: async () => {
            try {
              // get user data to only delete the user's cutom pin
              const auth = getAuth();
              const user = auth.currentUser;

              if (!user) {
                Alert.alert("Error", "You must be logged in to delete custom pins.");
                return;
              }

              const userId = user.uid;
              const userDocRef = doc(FIRESTORE_DB, "custom-pins", userId);

              // Fetch the users pins
              const userDocSnap = await getDoc(userDocRef);

              if (userDocSnap.exists()) {
                const existingPins = userDocSnap.data().pins || [];
                const updatedPins = existingPins.filter(
                  (existingPin) =>
                    existingPin.latitude !== pin.latitude ||
                    existingPin.longitude !== pin.longitude
                );
  
                // Update Firestore with the new pins array
                await updateDoc(userDocRef, { pins: updatedPins });
  
                // Update local state
                setMarkers((prevMarkers) =>
                  prevMarkers.filter(
                    (marker) =>
                      marker.latitude !== pin.latitude ||
                      marker.longitude !== pin.longitude
                  )
                );
                setFilteredMarkers((prevMarkers) =>
                  prevMarkers.filter(
                    (marker) =>
                      marker.latitude !== pin.latitude ||
                      marker.longitude !== pin.longitude
                  )
                );

              // Reset selectedMarker to hide the edit/delete menu
              setSelectedMarker(null);
              // same for the route menu
              handleStopDirections();
  
                Alert.alert("Success", "Custom pin deleted successfully!");
              } else {
                Alert.alert("Error", "No custom pins found for this user.");
              }


              //await deleteDoc(doc(FIRESTORE_DB, "locTest", pin.id));
              /*
              await deleteDoc(doc(FIRESTORE_DB, "custom-pins", pin.id));
              setMarkers((prevMarkers) =>
                prevMarkers.filter((marker) => marker.id !== pin.id)
              );
              setFilteredMarkers((prevMarkers) =>
                prevMarkers.filter((marker) => marker.id !== pin.id)
              );
              */
              

            } catch (error) {
              Alert.alert("Error deleting pin", error.message);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  // Handle stopping directions
  const handleStopDirections = () => {
    if (!tutorialCompleted) return;
    setSelectedDestination(null);
    setShowTravelModeButtons(false);
    setShowRouteDetails(false);
    setRouteDetails(null);
    setRouteSteps([]);
    setNavigationStarted(false);
  };

  const handleFavorite = async (marker) => {
    // checking for the user since users are required for favorites
    const user = getAuth().currentUser;
    if (!user || !selectedMarker) return;

    const uid = user.uid;
    const userFavoritesRef = doc(FIRESTORE_DB, "favorites", uid);

    try {
      // try to get the user's favorites from firestore using their uid
      const userDoc = await getDoc(userFavoritesRef);
      const currentFavorites = userDoc.exists()
        ? userDoc.data().locations || []
        : [];

      /*
       * if the selected marker is within their favorites array in firestore
       * then remove it from the array and update firestore
       */
      if (currentFavorites.includes(selectedMarker.id)) {
        const updatedFavorites = currentFavorites.filter(
          (id) => id !== selectedMarker.id
        );
        await updateDoc(userFavoritesRef, { locations: updatedFavorites });
        setUserFavorites(updatedFavorites);
        setIsFavorited(false);
      } else {
        // if the selected marker is not in their favorites array
        // then add it to the array and update firestore
        const updatedFavorites = [...currentFavorites, selectedMarker.id];
        if (userDoc.exists()) {
          await updateDoc(userFavoritesRef, { locations: updatedFavorites });
        } else {
          await setDoc(userFavoritesRef, { locations: updatedFavorites });
        }
        setUserFavorites(updatedFavorites);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      Alert.alert("Error", "Could not update favorites");
    }
  };

  // Change the start location to selected marker
  const handleChangeStartLocation = () => {
    if (!tutorialCompleted) return;
    if (selectedDestination) {
      setStartLocation({
        latitude: selectedDestination.latitude,
        longitude: selectedDestination.longitude,
      });
    }
  };

  // Update marker visibility based on category
  // commented out 3/27/25 4:30
//  const visibleMarkers = markers.filter(
//    (marker) => categoryVisibility[marker.catId] !== false // Only show markers with visible categories
//  );

  // Reset start location to user's current location
  const handleResetStartLocation = () => {
    if (!tutorialCompleted) return;
    if (userLocation) {
      setStartLocation(userLocation);
    }
  };

  // Tutorial
  const TUTORIAL_MARKER = {
    id: "tutorial-marker",
    latitude: 34.00039991787572,
    longitude: -81.03594096158815,
    title: "Tutorial Marker",
    description: "This is a tutorial marker",
    color: "green",
  };

  // Has user completed the tutorial?
  useEffect(() => {
    const checkTutorialStatus = async () => {
      const tutorialStatus = await AsyncStorage.getItem("tutorialCompleted");
      if (tutorialStatus === "true") {
        setTutorialCompleted(true);
      }
    };
    checkTutorialStatus();
  }, []);

  // Title, description, and what button to give tutorial on
  const TUTORIAL_STEPS = [
    {
      title: "Start Navigation",
      description:
        "Click this button to start navigation to the selected destination.",
      buttonId: "startNavButton",
    },
    {
      title: "Set New Start Location",
      description:
        "Click this button to set the selected destination as the new start location.",
      buttonId: "setStartButton",
    },
    {
      title: "Reset Location",
      description:
        "Click this button to reset the start location to your current location.",
      buttonId: "resetLocationButton",
    },
    {
      title: "Stop Directions",
      description: "Click this button to stop the current navigation.",
      buttonId: "stopDirectionsButton",
    },
  ];

  // Change style of current button in tutorial
  const highlightButton = (buttonId) => {
    if (startNavButtonRef.current)
      startNavButtonRef.current.setNativeProps({ style: styles.routeButton });
    if (setStartButtonRef.current)
      setStartButtonRef.current.setNativeProps({ style: styles.routeButton });
    if (resetLocationButtonRef.current)
      resetLocationButtonRef.current.setNativeProps({
        style: styles.routeButton,
      });
    if (stopDirectionsButtonRef.current)
      stopDirectionsButtonRef.current.setNativeProps({
        style: styles.routeButton,
      });

    switch (buttonId) {
      case "startNavButton":
        if (startNavButtonRef.current)
          startNavButtonRef.current.setNativeProps({
            style: styles.highlightedButton,
          });
        break;
      case "setStartButton":
        if (setStartButtonRef.current)
          setStartButtonRef.current.setNativeProps({
            style: styles.highlightedButton,
          });
        break;
      case "resetLocationButton":
        if (resetLocationButtonRef.current)
          resetLocationButtonRef.current.setNativeProps({
            style: styles.highlightedButton,
          });
        break;
      case "stopDirectionsButton":
        if (stopDirectionsButtonRef.current)
          stopDirectionsButtonRef.current.setNativeProps({
            style: styles.highlightedButton,
          });
        break;
      default:
        break;
    }
  };

  // Display title and description of button, as well as current step
  const TutorialOverlay = ({ step, onNext, onSkip }) => {
    const currentStep = TUTORIAL_STEPS[step];

    useEffect(() => {
      if (!tutorialCompleted && step < TUTORIAL_STEPS.length) {
        highlightButton(currentStep.buttonId);
      }
    }, [step, currentStep]);

    return (
      <Modal
        transparent={true}
        visible={!tutorialCompleted && step < TUTORIAL_STEPS.length}
      >
        <View style={styles.tutorialOverlay}>
          <View style={styles.tutorialContent}>
            {/* Display current step out of total steps at the top right */}
            <View style={styles.tutorialStepIndicator}>
              <Text style={styles.tutorialStepText}>
                Step {step + 1} of {TUTORIAL_STEPS.length}
              </Text>
            </View>

            <Text style={styles.tutorialTitle}>{currentStep.title}</Text>
            <Text style={styles.tutorialDescription}>
              {currentStep.description}
            </Text>
            <View style={styles.tutorialButtons}>
              <TouchableOpacity style={styles.tutorialButton} onPress={onNext}>
                <Text style={styles.tutorialButtonText}>Next</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tutorialButton} onPress={onSkip}>
                <Text style={styles.tutorialButtonText}>Skip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // For next step in tutorial
  const handleNextStep = () => {
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setTutorialCompleted(true);
      AsyncStorage.setItem("tutorialCompleted", "true");

      setFilteredMarkers((prevMarkers) =>
        prevMarkers.filter((marker) => marker.id !== TUTORIAL_MARKER.id)
      );
    }
  };

  // To skip tutorial
  const handleSkipTutorial = () => {
    setTutorialCompleted(true);
    AsyncStorage.setItem("tutorialCompleted", "true");

    setFilteredMarkers((prevMarkers) =>
      prevMarkers.filter((marker) => marker.id !== TUTORIAL_MARKER.id)
    );
    setSelectedMarker(null);
    setSelectedDestination(null);
    setShowRouteDetails(false);
    setShowTravelModeButtons(false);
  };

  // To reset tutorial
  const handleResetTutorial = async () => {
    await AsyncStorage.removeItem("tutorialCompleted");
    setTutorialCompleted(false);
    setTutorialStep(0);
    router.replace("/");
  };

  // Make sure tutorial marker is displaying on map, sometimes still doesn't work
  useEffect(() => {
    if (!tutorialCompleted) {
      setFilteredMarkers((prevMarkers) => [...prevMarkers, TUTORIAL_MARKER]);
      setSelectedMarker(TUTORIAL_MARKER);
      setSelectedDestination(TUTORIAL_MARKER);
      onMarkerSelected(TUTORIAL_MARKER);
    } else {
      setFilteredMarkers((prevMarkers) =>
        prevMarkers.filter((marker) => marker.id !== TUTORIAL_MARKER.id)
      );
      setSelectedMarker(null);
      setSelectedDestination(null);
      setShowRouteDetails(false);
      setShowTravelModeButtons(false);
    }
  }, [tutorialCompleted]);

  if (isLoading || markers.length === 0) {
    //if (!isInitialized || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#73000A" />
      </View>
    );
  }

  return (
    // attempting visibility
  <CategoryVisibilityProvider markers={markers}>
    <SafeAreaView style={styles.container}>

      <SearchBar
        placeholder="Search Here..."
        placeholderTextColor={theme.colors.text}
        onChangeText={(text) => setSearch(text)}
        value={search}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
        inputStyle={{ color: theme.colors.garnetWhite }}
      />
      <View style={styles.buttonContainer}>
        {/* Button to filter pins*/}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => router.push("/PinFilterMain")}
        >
          <View style={styles.accentBox}>
            <FontAwesome
              name="map-pin"
              size={24}
              color={theme.colors.garnetWhite}
            />
          </View>
        </TouchableOpacity>

        {/* Button to show/hide traffic */}
        {Platform.OS !== "ios" && (
          <TouchableOpacity
            style={styles.trafficButton}
            onPress={() => setShowTraffic(!showTraffic)}
          >
            <FontAwesome
              name="exclamation-triangle"
              size={24}
              color={theme.colors.garnetWhite}
            />
          </TouchableOpacity>
        )}

        {/* Button to route history screen */}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push("/routeHistory")}
        >
          <FontAwesome name="book" size={24} color={theme.colors.garnetWhite} />
        </TouchableOpacity>

        {/* Button to add custom pin */}
        <TouchableOpacity
          style={styles.customPinButton}
          onPress={() => {
            //setShowCustomPinModal(true);
            setShowCustomPinNotification(true);
            setCreatingCustomPin(true)
          }}
        >
          <FontAwesome
            name="map-marker"
            size={24}
            color={theme.colors.garnetWhite}
          />
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>

        {/* Button to follow user */}
        <TouchableOpacity
          style={styles.customPinButton}
          onPress={() => setFollowsUser(!followsUser)}
        >
          <FontAwesome
            name={followsUser ? "location-arrow" : "map-marker"}
            size={24}
            color={theme.colors.garnetWhite}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.customPinButton}
          onPress={handleResetTutorial}
        >
          <FontAwesome
            name="refresh"
            size={24}
            color={theme.colors.garnetWhite}
          />
        </TouchableOpacity>

        
      </View>
      {showCustomPinNotification && (
        <View style={styles.notificationBox}>
          <Text style={styles.notificationText}>
            Tap anywhere on the map to create a custom pin.
          </Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setCreatingCustomPin(false);
              setShowCustomPinNotification(false);
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Map */}
      <MapView
        testID="map"
        ref={mapRef}
        style={styles.map}
        apiKey={GOOGLE_API_KEY}
        provider={
          Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
        }
        initialRegion={INITIAL_REGION}
        showsUserLocation={true}
        followsUserLocation={followsUser}
        showsTraffic={showTraffic}
        onPress={handleMapPress}
        customMapStyle={theme.dark ? darkMapStyle : []}
      >
        {/* render markers normally */}
        {}

        {markersToDisplay.map((marker) => {
          // attempting to fix search bar 3/31
          const { id, latitude, longitude, title, description, color } = marker;
          
          return (
            <Marker
              key={id}
              coordinate={{
                latitude,
                longitude,
              }}
              title={title}
              description={description}
              pinColor={color ? color : "red"}
              onPress={() => onMarkerSelected(marker)}
              zIndex={selectedMarker?.id === id ? 1000 : 1} // Bring selected marker to the front
              style={
                selectedMarker?.id === id ? { transform: [{ scale: 1.5 }] } : {}
              } // Enlarge selected marker
              tracksViewChanges={selectedMarker?.id === id} // Re-render selected marker
            />
          );
        })}

        {/* display all markers */}
        {}
        {/* Commented out above. Originally showed ALL markers. See "Display filtered markers" below.*/}
        
        {/* Display Visible Markers 
              Commented out to account for search. go back to this if 
              markersToDisplay is not working properly. -Chloe 3/31/25
          */}
        {/*visibleMarkers.map((marker) => {
          const { id, latitude, longitude, title, description, color } = marker;

          return (
            <Marker
              key={id}
              coordinate={{
                latitude,
                longitude,
              }}
              title={title}
              description={description}
              pinColor={color ? color : "red"}
              onPress={() => onMarkerSelected(marker)}
              zIndex={selectedMarker?.id === id ? 1000 : 1} // marker to front
              style={
                selectedMarker?.id === id ? { transform: [{ scale: 1.5 }] } : {}
              } // biggering
              tracksViewChanges={selectedMarker?.id === id} // re-render selected marker
            />
          );
        })*/}

        {/* Why is this here? This is basically the exact same MapViewDirections as below?
        -Isaac March 4    */}
        {/* display prof. office if selected */}
        {/* {selectedDestination && (
          <MapViewDirections
            origin={userLocation}
            destination={{
              latitude: selectedDestination.latitude,
              longitude: selectedDestination.longitude,
            }}
            apikey={GOOGLE_API_KEY}
            strokeWidth={4}
            strokeColor="#73000A"
            mode={travelMode}
            onReady={(result) => {
              setRouteDetails({
                distance: result.distance,
                duration: result.duration,
              });
              setRouteSteps(result.legs[0].steps || []);
            }}
            onError={(error) => Alert.alert("Error getting directions", error)}
          />
        )} */}
        {/* End of displaying prof office if selected */}

        {/* Display filtered markers */}
        {/*           REPLACE WITH VISIBLE MARKERS

        {filteredMarkers.map((marker) => {
          // changed to only pass through necessary props to get rid of minor error popup when using search
          const { id, latitude, longitude, title, description, color, catId } = marker;

          // Check if the marker's category is visible
          if (categoryVisibility[catId] === false) {
            return null; // Skip rendering this marker
          }

          return (
            <Marker
              key={id}
              coordinate={{
                latitude,
                longitude,
              }}
              title={title}
              description={description}
              pinColor={color ? color : "red"}
              onPress={() => onMarkerSelected(marker)}
              zIndex={selectedMarker?.id === id ? 1000 : 1} // marker to front
              style={
                selectedMarker?.id === id ? { transform: [{ scale: 1.5 }] } : {}
              } // biggering
              tracksViewChanges={selectedMarker?.id === id} // re-render selected marker
            />
          ); // end of filteredMarkers return statement
        })}
          */}

        

        {/* Directions */}
        {startLocation && selectedDestination && navigationStarted && (
          <MapViewDirections
            origin={startLocation}
            destination={{
              latitude: selectedDestination.latitude,
              longitude: selectedDestination.longitude,
            }}
            apikey={GOOGLE_API_KEY}
            strokeWidth={4}
            strokeColor={theme.dark ? "#FFF" : "#73000a"}
            mode={travelMode}
            onReady={(result) => {
              setRouteDetails({
                distance: result.distance,
                duration: result.duration,
              });
              setRouteSteps(result.legs[0].steps || []);
            }}
            onError={(error) => Alert.alert("Error getting directions", error)}
          />
        )}
      </MapView>

      {/* Modal for Custom Pin Instructions */}
      {/*}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCustomPinModal}
        onRequestClose={() => setShowCustomPinModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Tap anywhere on the map to create a custom pin.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowCustomPinModal(false)}
            >
              <Text style={styles.modalButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}

      {/* Custom Pin Actions */}
      {/*selectedMarker && selectedMarker.color === "blue" && (
        <View style={styles.pinActionsContainer}>
          <TouchableOpacity
            style={styles.pinActionButton}
            onPress={() => handleRenamePin(selectedMarker)}
          >
            <Text style={styles.pinActionText}>Rename</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pinActionButton}
            onPress={() => handleDeletePin(selectedMarker)}
          >
            <Text style={styles.pinActionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )*/}
      {selectedMarker && selectedMarker.color === "blue" && (
        <View style={styles.pinActionsContainer}>
          <TouchableOpacity
            style={styles.pinActionButton}
            onPress={() => showRenameModal(selectedMarker)}
          >
            <Text style={styles.pinActionText}>Rename</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pinActionButton}
            onPress={() => handleDeletePin(selectedMarker)}
          >
            <Text style={styles.pinActionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Adjusting Custom Pin (Renaming / New Description) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isRenameModalVisible}
        onRequestClose={() => setIsRenameModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Enter new title for the pin:</Text>
            <TextInput
              style={styles.modalInput}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <Text style={styles.modalText}>
              Enter new description for the pin:
            </Text>
            <TextInput
              style={styles.modalInput}
              value={newDescription}
              onChangeText={setNewDescription}
            />
            <Button title="Rename" onPress={handleRenamePin} />
            <Button
              title="Cancel"
              onPress={() => setIsRenameModalVisible(false)}
            />
          </View>
        </View>
      </Modal>

      {/* Travel Mode Buttons (Overlay) */}
      {showTravelModeButtons && (
        <View style={styles.travelModeOverlay}>
          <TouchableOpacity
            style={[
              styles.travelModeButton,
              travelMode === "DRIVING" && styles.activeTravelMode,
            ]}
            onPress={() => setTravelMode("DRIVING")}
          >
            <Text style={styles.travelModeText}>Driving</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.travelModeButton,
              travelMode === "WALKING" && styles.activeTravelMode,
            ]}
            onPress={() => setTravelMode("WALKING")}
          >
            <Text style={styles.travelModeText}>Walking</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.travelModeButton,
              travelMode === "BICYCLING" && styles.activeTravelMode,
            ]}
            onPress={() => setTravelMode("BICYCLING")}
          >
            <Text style={styles.travelModeText}>Biking</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Route Details and Stop Button */}
      {showRouteDetails && (
        <View
          testID="route-details-container"
          style={styles.routeDetailsContainer}
        >
          {/* Marker info here: Title, Description, Category, Tag, etc.
              You will need to change the variable in setSelectedDestination */}
          <View style={styles.titleContainer}>
            <Text style={styles.routeDetailsText}>
              {selectedDestination ? selectedDestination.title : ""}
            </Text>
            <View style={styles.exitButtonContainer}>
              <TouchableOpacity
                style={styles.exitButton}
                onPress={handleFavorite}
              >
                <FontAwesome
                  name={isFavorited ? "star" : "star-o"}
                  size={24}
                  color={theme.colors.garnetWhite}
                  testID="favorite-icon"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.exitButton}
                onPress={handleStopDirections}
              >
                <FontAwesome
                  name="times"
                  size={24}
                  color={theme.colors.garnetWhite}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Total Distance and Duration */}
          {routeDetails && (
            <>
              <Text style={styles.routeDetailsText}>
                Total Distance: {routeDetails.distance.toFixed(2)} miles
              </Text>
              <Text style={styles.routeDetailsText}>
                Total Duration: {Math.ceil(routeDetails.duration)} minutes
              </Text>
            </>
          )}

          {/* Step-by-Step Instructions */}
          {routeSteps && routeSteps.length > 0 ? (
            <ScrollView style={{ maxHeight: 150 }}>
              {routeSteps.map((step, index) => (
                <View key={index} style={{ marginBottom: 10 }}>
                  <Text style={styles.routeDetailsText}>
                    {step.html_instructions.replace(/<[^>]+>/g, "")}
                  </Text>
                  <Text style={styles.routeDetailsText}>
                    Distance: {step.distance.text}, Duration:{" "}
                    {step.duration.text}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.routeDetailsText}>
              Please click 'Start Nav'. Otherwise, there are no directions
              available.
            </Text>
          )}

          {/* Buttons */}
          <View style={styles.routeButtonsContainer}>
            {/* Start navigation button*/}
            <TouchableOpacity
              style={styles.routeButton}
              onPress={() => handleStartNavigation(selectedMarker)}
              ref={startNavButtonRef}
              buttonId="startNavButton"
            >
              <FontAwesome
                name="map"
                size={24}
                color={theme.colors.garnetWhite}
              />
              <Text style={styles.routeButtonText}>Start Nav</Text>
            </TouchableOpacity>

            {/* Set new start location button */}
            <TouchableOpacity
              style={styles.routeButton}
              onPress={handleChangeStartLocation}
              ref={setStartButtonRef}
              buttonId="setStartButton"
            >
              <FontAwesome
                name="play"
                size={24}
                color={theme.colors.garnetWhite}
              />
              <Text style={styles.routeButtonText}>Set Start</Text>
            </TouchableOpacity>

            {/* Reset Location Button */}
            <TouchableOpacity
              style={styles.routeButton}
              onPress={handleResetStartLocation}
              ref={resetLocationButtonRef}
              buttonId="resetLocationButton"
            >
              <FontAwesome
                name="times"
                size={24}
                color={theme.colors.garnetWhite}
              />
              <Text style={styles.routeButtonText}>Reset</Text>
            </TouchableOpacity>

            {/* Stop Directions Button */}
            <TouchableOpacity
              style={styles.routeButton}
              onPress={handleStopDirections}
              ref={stopDirectionsButtonRef}
              buttonId="stopDirectionsButton"
            >
              <FontAwesome
                name="stop"
                size={24}
                color={theme.colors.garnetWhite}
              />
              <Text style={styles.routeButtonText}>Stop</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TutorialOverlay
        step={tutorialStep}
        onNext={handleNextStep}
        onSkip={handleSkipTutorial}
      />
    </SafeAreaView>
  </CategoryVisibilityProvider>
  );
}
