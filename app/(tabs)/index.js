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
  ToastAndroid,
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
import {
  CategoryVisibilityProvider,
  CategoryVisibilityContext,
} from "../CategoryVisibilityContext";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

/*
      ERRORS AFTER 3/31 PIN FILTER MERGE:
      - this error has been here since the searchbar was even added, but
        using search bar shows pop-up saying 
          "A props object containing a "key" prop is being spread into JSX"
      - fix 4/1 by Isaac
        used just a text input with its own style
        apparently react-native-elements has some issues with search bars

      Not errors, but things to fix:
      - Locations with longer names will push the x button off the screen

*/
/*
  Home Screen
*/
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
  const [showCustomPinNotification, setShowCustomPinNotification] =
    useState(false); // previously named with Modal instead of Notification
  // adjusting custom pins
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Favorited Locations
  const [userFavorites, setUserFavorites] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);

  // category visibility toggle
  const { categoryVisibility, isInitialized } = useContext(
    CategoryVisibilityContext
  );

  // Get professor's office location if navigated from ProfessorInfo.js
  const { latitude, longitude, markerId } = useLocalSearchParams();
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [navigateToProfessorOffice, setNavigateToProfessorOffice] =
    useState(false);

  // Info Modal Constants
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Tutorial constants
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const filterButtonRef = useRef(null);
  const trafficButtonRef = useRef(null);
  const historyButtonRef = useRef(null);
  const customPinButtonRef = useRef(null);
  const followUserButtonRef = useRef(null);
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
    console.log("hello marker")
    console.log(marker);
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

  useEffect(() => {
    console.log(markerId);
    if (markerId && markers.length > 0) {
      const markerToFocus = markers.find(
        (marker) => marker.id === Number(markerId)
      );
      if (markerToFocus) {
        setTimeout(() => {
          onMarkerSelected(markerToFocus);
          router.replace("/");
        }
        , 500); 
      }
    }
  }, [markerId, markers]);

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
        const auth = getAuth(); // Check if the user is logged in
        const user = auth.currentUser;

        if (user) {
          const userId = user.uid;
          const userDocRef = doc(FIRESTORE_DB, "custom-pins", userId); // Fetch custom pins for the logged-in user
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            customPins = userDocSnap.data().pins || [];
          }
        }

        // Merge public markers with custom pins
        const allMarkers = [...db_data, ...customPins];

        setMarkers(allMarkers);
        //setFilteredMarkers(allMarkers);     // uncomment if fetching markers breaks
        setIsLoading(false);

        // Process each location to add alternate names to description
        for (const location of db_data) {
          // Ignore custom pins (made em all blue, so skip blue)
          if (location.color === "blue") {
            //console.log(`Skipping custom pin: ${location.title}`); // Debugging
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
            title: "Professor's Office",
            description: "Professor's office location",
            color: "yellow",
          };

          // added prof nav marker code
          setProfessorOfficeMarker(newMarker);

          setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
          setFilteredMarkers((prevMarkers) => [...prevMarkers, newMarker]);
          setSelectedMarker(newMarker);
          setSelectedDestination(newMarker);
          setNavigateToProfessorOffice(true);
        } // end of CODE FOR PROF OFFICE INFO
      } catch (err) {
        console.error("Error fetching markers:", err);
        Alert.alert("Error fetching data");
        setIsLoading(false);
      }
    };

    fetchMarkers();
    //  }, []); // ORIG. COMMENTED OUT FOR OFFICE TEST
  }, [latitude, longitude]); // end of fetching markers
  // might be able to replace above line with the line above it, but id dont want to deal with any
  // errors that may occur as a result atm

  const [visibleMarkers, setVisibleMarkers] = useState([]);

  // Filter visible markers based on category visibility
  useEffect(() => {
    if (isInitialized && markers.length > 0) {
      const filteredMarkers = markers.filter((marker) => {
        // WAS IT GENUINELY JUST BC I HAD !== FALSE INSTEAD OF === TRUE. Thats insane.
        return marker.custom || categoryVisibility[marker.catId] === true;
      });
      setVisibleMarkers(filteredMarkers);
    }
  }, [isInitialized, categoryVisibility, markers]);

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
        console.warn(
          `No valid alternate names found for location "${title}". Skipping update.`
        );
        return;
      }

      const cleanedAlternateNames = alternateNames
        .flat()
        .filter((name) => typeof name === "string" && name.trim().length > 0);

      if (cleanedAlternateNames.length === 0) {
        console.warn(
          `Skipping update for "${title}" as no valid alternate names remain.`
        );
        return;
      }

      const updatedDescription = `Alternate Names: ${cleanedAlternateNames.join(
        ", "
      )}`;

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

  // state to track prof office
  // we want prof office to be shown on map when navigated from ProfessorInfo,
  // even if it's hidden by category visibility
  const [professorOfficeMarker, setProfessorOfficeMarker] = useState(null);

  // move the map to selected marker when found
  useEffect(() => {
    //if (selectedMarker && mapRef.current) {
    if (
      navigateToProfessorOffice &&
      //&& selectedMarker   // testing to make prof off shown
      professorOfficeMarker &&
      mapRef.current
    ) {
      setTimeout(() => {
        mapRef.current.animateToRegion(
          {
            //latitude: selectedMarker.latitude,
            //longitude: selectedMarker.longitude,
            latitude: professorOfficeMarker.latitude,
            longitude: professorOfficeMarker.longitude,

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
  /*
      This includes:
      - Search results, if using search bar
      - Visible markers, if using Pin Filters
      - Office Location, if navigating to professor office
  */
  const markersToDisplay =
    search !== "" && searchResults.length === 0
      ? [] // No matches from search, show no markers
      : searchResults.length > 0
      ? searchResults
      : professorOfficeMarker
      ? [...visibleMarkers, professorOfficeMarker]
      : visibleMarkers;
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

      setMarkers((prevMarkers) => [...prevMarkers, newPin]);
      setFilteredMarkers((prevMarkers) => [...prevMarkers, newPin]);

      // just so we can see it was added right
      ToastAndroid.show("Custom pin added successfully!", ToastAndroid.SHORT);
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
          ToastAndroid.show(
            "Custom pin renamed successfully!",
            ToastAndroid.SHORT
          );
        } else {
          Alert.alert("Error", "No custom pins found for this user.");
        }
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
                Alert.alert(
                  "Error",
                  "You must be logged in to delete custom pins."
                );
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

                ToastAndroid.show(
                  "Custom pin deleted successfully!",
                  ToastAndroid.SHORT
                );
              } else {
                Alert.alert("Error", "No custom pins found for this user.");
              }
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
    setSelectedMarker(null);
    setShowTravelModeButtons(false);
    setShowRouteDetails(false);
    setRouteDetails(null);
    setRouteSteps([]);
    setNavigationStarted(false);
    setNavigateToProfessorOffice(false);
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
    // top bar buttons
    {
      title: "Filter Pins",
      description:
        "If you want to view more/less pins on the map, use this button or the search bar.\n\nPins are initially filtered to display college buildings only at startup",
      buttonId: "filterButton",
      position: "bottom",
    },
    {
      title: "Traffic View",
      description:
        "Toggle this button to show/hide traffic conditions on the map (Android only).",
      buttonId: "trafficButton",
      position: "bottom",
    },
    {
      title: "Route History",
      description: "Click this button to view your previous route history.",
      buttonId: "historyButton",
      position: "bottom",
    },
    {
      title: "Add Custom Pin",
      description:
        "Tap this button, then tap anywhere on the map to add your own custom location pin.",
      buttonId: "customPinButton",
      position: "bottom",
    },
    {
      title: "Follow User Location",
      description:
        "Toggle this button to make the map automatically follow your current location.",
      buttonId: "followUserButton",
      position: "bottom",
    },

    // route details button
    {
      title: "Start Navigation",
      description:
        "Click this button to start navigation to the selected destination.",
      buttonId: "startNavButton",
      position: "top",
    },
    {
      title: "Set New Start Location",
      description:
        "Click this button to set the selected destination as the new start location.",
      buttonId: "setStartButton",
      position: "top",
    },
    {
      title: "Reset Location",
      description:
        "Click this button to reset the start location to your current location.",
      buttonId: "resetLocationButton",
      position: "top",
    },
    {
      title: "Stop Directions",
      description: "Click this button to stop the current navigation.",
      buttonId: "stopDirectionsButton",
      position: "top",
    },
  ];

  // Change style of current button in tutorial
  const highlightButton = (buttonId) => {
    if (filterButtonRef.current)
      filterButtonRef.current.setNativeProps({ style: styles.filterButton });
    if (trafficButtonRef.current)
      trafficButtonRef.current.setNativeProps({ style: styles.trafficButton });
    if (historyButtonRef.current)
      historyButtonRef.current.setNativeProps({ style: styles.historyButton });
    if (customPinButtonRef.current)
      customPinButtonRef.current.setNativeProps({
        style: styles.customPinButton,
      });
    if (followUserButtonRef.current)
      followUserButtonRef.current.setNativeProps({
        style: styles.customPinButton,
      });

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
      case "filterButton":
        if (filterButtonRef.current)
          filterButtonRef.current.setNativeProps({
            style: styles.highlightedButton,
          });
        break;
      case "trafficButton":
        if (trafficButtonRef.current)
          trafficButtonRef.current.setNativeProps({
            style: styles.highlightedButton,
          });
        break;
      case "historyButton":
        if (historyButtonRef.current)
          historyButtonRef.current.setNativeProps({
            style: styles.highlightedButton,
          });
        break;
      case "customPinButton":
        if (customPinButtonRef.current)
          customPinButtonRef.current.setNativeProps({
            style: styles.highlightedButton,
          });
        break;
      case "followUserButton":
        if (followUserButtonRef.current)
          followUserButtonRef.current.setNativeProps({
            style: styles.highlightedButton,
          });
        break;

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
        <View
          style={[
            styles.tutorialOverlay,
            currentStep.position === "top"
              ? styles.tutorialOverlayTop
              : styles.tutorialOverlayBottom,
          ]}
        >
          <View style={styles.tutorialContent}>
            {/* Display current step out of total steps at the top right */}
            <View style={styles.tutorialFlex}>
              <Text style={styles.tutorialTitle}>{currentStep.title}</Text>
              <View style={styles.tutorialStepIndicator}>
                <Text style={styles.tutorialStepText}>
                  Step {step + 1} of {TUTORIAL_STEPS.length}
                </Text>
              </View>
            </View>
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
    if (!tutorialCompleted && tutorialStep >= 5) {
      setFilteredMarkers((prevMarkers) => [...prevMarkers, TUTORIAL_MARKER]);
      setSelectedMarker(TUTORIAL_MARKER);
      setSelectedDestination(TUTORIAL_MARKER);
      onMarkerSelected(TUTORIAL_MARKER);
    } else if (tutorialCompleted || tutorialStep < 5) {
      setFilteredMarkers((prevMarkers) =>
        prevMarkers.filter((marker) => marker.id !== TUTORIAL_MARKER.id)
      );
      setSelectedMarker(null);
      setSelectedDestination(null);
      setShowRouteDetails(false);
      setShowTravelModeButtons(false);
    }
  }, [tutorialCompleted, tutorialStep]);

  if (
    isLoading ||
    //|| markers.length === 0                   // UNCOMMENT IF THIS BREAKS 3/31/25
    !isInitialized
  ) {
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
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search Here..."
            placeholderTextColor={theme.colors.text}
            onChangeText={(text) => setSearch(text)}
            value={search}
            style={styles.textInput}
          />
        </View>
        <View style={styles.buttonContainer}>
          {/* Button to filter pins*/}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => router.push("/PinFilterMain")}
            testID = "filterButton"
            ref={filterButtonRef}
            buttonId="filterButton"
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
              ref={trafficButtonRef}
              buttonId="trafficButton"
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
            ref={historyButtonRef}
            buttonId="historyButton"
          >
            <FontAwesome
              name="book"
              size={24}
              color={theme.colors.garnetWhite}
            />
          </TouchableOpacity>

          {/* Button to add custom pin */}
          <TouchableOpacity
            style={styles.customPinButton}
            onPress={() => {
              //setShowCustomPinModal(true);
              setShowCustomPinNotification(true);
              setCreatingCustomPin(true);
            }}
            ref={customPinButtonRef}
            buttonId="customPinButton"
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
            ref={followUserButtonRef}
            buttonId="followUserButton"
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
          
          {/* Info Button */}
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setShowInfoModal(true)}
            testID="infoButton"
          >
            <FontAwesome name="info-circle" size={24} color={theme.colors.garnetWhite} />
          </TouchableOpacity>
        </View>

        {/* Info Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showInfoModal}
          onRequestClose={() => setShowInfoModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitleInfo}>Button Information</Text>
              <ScrollView>
                <View style={styles.modalContent}>
                  <Text style={styles.modalText}>
                    <FontAwesome name="map-pin" size={18} /> Filter Pins Icon - Allows user to filter pins based on category (ie, building type)
                  </Text>
                  <Text style={styles.modalText}>
                    <FontAwesome name="exclamation-triangle" size={18} /> Traffic Icon - Show/Hide Traffic on Map
                  </Text>
                  <Text style={styles.modalText}>
                    <FontAwesome name="book" size={18} /> Route History Icon - View your previous route history
                  </Text>

                  <Text style={styles.modalText}>
                    <FontAwesome
                      name="map-marker"
                      size={18}
                      color={theme.colors.text}
                      style={{ marginRight: 2, alignSelf: "center" }} // Had to add it like this to keep it aligned with text
                    />
                    <Text style={styles.plusText}>+</Text> Add Custom Pin Icon - Add a custom pin to the map
                  </Text>

                  <Text style={styles.modalText}>
                    <FontAwesome name="location-arrow" size={18} /> Follow User Icon - Toggle map to follow your location
                  </Text>
                  <Text style={styles.modalText}>
                    <FontAwesome name="refresh" size={18} /> Tutorial Refresh Icon - Reset/Restart the Tutorial
                  </Text>
                </View>
              </ScrollView>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowInfoModal(false)}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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

          {/* Render all markers. Accounts for Searchbar, filtered pins, and default CategoryVisibilityContext. */}
          {markersToDisplay.map((marker) => {
            const { id, latitude, longitude, title, description, color } =
              marker;

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
                  selectedMarker?.id === id
                    ? { transform: [{ scale: 1.5 }] }
                    : {}
                } // Enlarge selected marker
                tracksViewChanges={selectedMarker?.id === id} // Re-render selected marker
              />
            );
          })}

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
              onError={(error) =>
                Alert.alert("Error getting directions", error)
              }
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
                placeholder={selectedMarker?.title || "Enter new title"}
                value={newTitle}
                onChangeText={setNewTitle}
              />
              <Text style={styles.modalText}>
                Enter new description for the pin:
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder={
                  selectedMarker?.description || "Enter new description"
                }
                value={newDescription}
                onChangeText={setNewDescription}
              />
              <View style={styles.modalButtonContainer}>
                <Button
                  style={styles.renameConfirmationButton}
                  title="Cancel"
                  onPress={() => setIsRenameModalVisible(false)}
                  color={theme.colors.primary}
                />
                <Button
                  style={styles.renameConfirmationButton}
                  title="Rename"
                  onPress={handleRenamePin}
                  color={theme.colors.primary}
                />
              </View>
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
              <Text
                style={styles.titleText}
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                {selectedDestination ? selectedDestination.title : ""}
              </Text>
              <View style={styles.exitButtonContainer}>
                {selectedDestination?.id !== "searched-location" && (
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
                )}
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
