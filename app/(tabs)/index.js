import React, { useEffect, useState, useRef } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
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
} from "react-native";
import { addDoc, updateDoc, doc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "../../FirebaseConfig";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SearchBar } from "react-native-elements";
import * as SplashScreen from "expo-splash-screen";
import * as Location from "expo-location";
import MapViewDirections from "react-native-maps-directions";
import { GOOGLE_API_KEY } from "@env";
import styles from "../../homestyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome from "@expo/vector-icons/FontAwesome";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function HomeScreen() {
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
  const mapRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true); // testing to see if loading works?
  // Creating custom pins
  const [creatingCustomPin, setCreatingCustomPin] = useState(false);
  const [customPinLocation, setCustomPinLocation] = useState(null);
  // adjusting custom pins
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Get professor's office location if navigated from ProfessorInfo.js
  const { officeAddress } = useLocalSearchParams();
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [navigateToProfessorOffice, setNavigateToProfessorOffice] = useState(false);

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

    setShowTravelModeButtons(true);
    setShowRouteDetails(true);

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

    // Zoom in on marker region
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: marker.latitude - 0.0025, //subtraction will make marker more centered on screen
          longitude: marker.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        2500 // 2500 is duration of zoom in ms
      );
    }
  };

  // Fetch markers from Firebase
  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        //const query = await getDocs(collection(FIRESTORE_DB, "markers"));   // OG
        const query = await getDocs(collection(FIRESTORE_DB, "locTest")); // Changed to use what Chloe brought in
        const db_data = query.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMarkers(db_data);
        setFilteredMarkers(db_data);
        setIsLoading(false);

        // When coming from Professor Info page
        if (officeAddress) {
          const cleanedAddress = officeAddress.split(",")[0].trim(); // remove room number from the office location
          //const foundMarker = db_data.find((marker) => marker.title === officeAddress);
          const foundMarker = db_data.find((marker) => marker.title === cleanedAddress);
          console.log(cleanedAddress);
          // LOCATION DATA SUCCESSFULLY RECEIVED FROM PROF

          if (foundMarker) {
            setSelectedMarker(foundMarker);

            // new after getting cleaned address working
            setSelectedDestination({
              latitude: foundMarker.latitude,
              longitude: foundMarker.longitude,
            });

            // zoom into prof office
            if (mapRef.current) {
              mapRef.current.animateToRegion(
                {
                  latitude: foundMarker.latitude,
                  longitude: foundMarker.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                },
                2000 // Zoom-in duration in milliseconds
              );
            }

            // zoom in to prof location as soon as map loads
            setNavigateToProfessorOffice(true);

          } else {
            Alert.alert("Professor's office location not found on the map.");
          }
        } // end of NEW CODE FOR PROF OFFICE INFO


      } catch (err) {
        Alert.alert("Error fetching data");
        setIsLoading(false);
      }
    };

    fetchMarkers();
//  }, []); // ORIG. COMMENTED OUT FOR OFFICE TEST
  }, [officeAddress]);

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


  // Update filtered markers based on search input
  useEffect(() => {
    if (search === "") { // ORIG
      setFilteredMarkers(markers);
    } else {
      const filtered = markers.filter((marker) =>
        marker.title.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredMarkers(filtered);
    }
    console.log("Filtered Markers:", filteredMarkers); // debugging error when using search
  }, [search, markers]);

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
      const newPin = {
        latitude,
        longitude,
        title: "Custom Pin",
        description: "User-added pin",
        color: "blue",
      };
      //await addDoc(collection(FIRESTORE_DB, "locTest"), newPin);
      const docRef = await addDoc(collection(FIRESTORE_DB, "locTest"), newPin);
      newPin.id = docRef.id;
      setMarkers((prevMarkers) => [...prevMarkers, newPin]);
      setFilteredMarkers((prevMarkers) => [...prevMarkers, newPin]);
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
  // originally started as just to rename. will adjust to add ability to change description too.
  /*const handleRenamePin = async (pin) => {
    //const newTitle = prompt("Enter new title for the pin:", pin.title);
    if (newTitle && newDescription) {
      try {
        await updateDoc(doc(FIRESTORE_DB, "locTest", pin.id), { title: newTitle });
        setMarkers((prevMarkers) =>
          prevMarkers.map((marker) =>
            marker.id === pin.id ? { ...marker, title: newTitle } : marker
          )
        );
        setFilteredMarkers((prevMarkers) =>
          prevMarkers.map((marker) =>
            marker.id === pin.id ? { ...marker, title: newTitle } : marker
          )
        );
        setIsRenameModalVisible(false);
      } catch (error) {
        Alert.alert("Error renaming pin", error.message);
      }
    }
  };*/
  const handleRenamePin = async () => {
    if (newTitle && newDescription) {
      try {
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
      } catch (error) {
        Alert.alert("Error renaming pin", error.message);
      }
    }
  };
  
  // delete custom pin
  /*
  const handleDeletePin = async (pin) => {
    try {
      await deleteDoc(doc(FIRESTORE_DB, "locTest", pin.id));
      setMarkers((prevMarkers) => prevMarkers.filter((marker) => marker.id !== pin.id));
      setFilteredMarkers((prevMarkers) => prevMarkers.filter((marker) => marker.id !== pin.id));
    } catch (error) {
      Alert.alert("Error deleting pin", error.message);
    }
  };
  */
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
              await deleteDoc(doc(FIRESTORE_DB, "locTest", pin.id));
              setMarkers((prevMarkers) => prevMarkers.filter((marker) => marker.id !== pin.id));
              setFilteredMarkers((prevMarkers) => prevMarkers.filter((marker) => marker.id !== pin.id));
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
    setSelectedDestination(null);
    setShowTravelModeButtons(false);
    setShowRouteDetails(false);
    setRouteDetails(null);
  };

  // Change the start location to selected marker
  const handleChangeStartLocation = () => {
    if (selectedDestination) {
      setStartLocation({
        latitude: selectedDestination.latitude,
        longitude: selectedDestination.longitude,
      });
    }
  };

  // Reset start location to user's current location
  const handleResetStartLocation = () => {
    if (userLocation) {
      setStartLocation(userLocation);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#73000A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar
        placeholder="Search Here..."
        onChangeText={(text) => setSearch(text)}
        value={search}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
      />
      <View style={styles.buttonContainer}>
        {/* Button to filter pins*/}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => router.push("/PinFilterMain")}
        >
          <View style={styles.accentBox}>
            <FontAwesome name="map-pin" size={24} color="#73000A" />
          </View>
        </TouchableOpacity>

        {/* Button to show/hide traffic */}
        <TouchableOpacity
          style={styles.trafficButton}
          onPress={() => setShowTraffic(!showTraffic)}
        >
          <FontAwesome name="exclamation-triangle" size={24} color="#73000A" />
        </TouchableOpacity>

        {/* Button to route history screen */}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push("/routeHistory")}
        >
          <FontAwesome name="book" size={24} color="#73000A" />
        </TouchableOpacity>

        {/* Button to add custom pin */}
        <TouchableOpacity
          style={styles.customPinButton}
          onPress={() => setCreatingCustomPin(true)}
        >
          <FontAwesome name="map-marker" size={24} color="#73000A" />
          <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        apiKey={GOOGLE_API_KEY}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        showsUserLocation={true}
        followsUserLocation={true}
        showsTraffic={showTraffic}
        onPress={handleMapPress}
      >

        {/* render markers normally */}
        {/*{markers.map((marker) => (
        //  <Marker
        //    key={marker.id}
        //    coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
        //    title={marker.title}
        //    pinColor={selectedMarker?.id === marker.id ? "blue" : "red"} // Highlight selected marker
        //  />
        //))}
        */}

        {/* display all markers */}
        {/*markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            pinColor={selectedMarker?.id === marker.id ? "blue" : "red"} // Highlight selected marker
          />
        ))*/}
        {/* Commented out above. Originally showed ALL markers. See "Display filtered markers" below.*/}

        {/* display prof. office if selected */}
        {selectedDestination && (
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
        )}
        {/* End of displaying prof office if selected*/}


        {/* Display filtered markers */}
        {/*filteredMarkers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            description={marker.description}
            pinColor={marker.color ? marker.color : "red"}
            onPress={() => onMarkerSelected(marker)}
            zIndex={selectedMarker?.id === marker.id ? 1000 : 1} // marker to front
            style={selectedMarker?.id === marker.id ? { transform: [{ scale: 1.5 }] } : {}} // biggering
            tracksViewChanges={selectedMarker?.id === marker.id} // re-render selected marker
          />
        ))*/}
        {filteredMarkers.map((marker) => {
          // changed to only pass through necessary props to get rid of minor error popup when using search
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
              style={selectedMarker?.id === id ? { transform: [{ scale: 1.5 }] } : {}} // biggering
              tracksViewChanges={selectedMarker?.id === id} // re-render selected marker
            />
          ); // end of filteredMarkers return statement
        })}

        {/* Directions */}
        {startLocation && selectedDestination && (
          <MapViewDirections
            origin={startLocation}
            destination={{
              latitude: selectedDestination.latitude,
              longitude: selectedDestination.longitude,
            }}
            apikey={GOOGLE_API_KEY}
            strokeWidth={4}
            strokeColor="#73000a"
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

      { /* Custom Pin Actions */}
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
          <Text style={styles.modalText}>Enter new description for the pin:</Text>
          <TextInput
            style={styles.modalInput}
            value={newDescription}
            onChangeText={setNewDescription}
          />
          <Button title="Rename" onPress={handleRenamePin} />
          <Button title="Cancel" onPress={() => setIsRenameModalVisible(false)} />
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
            <Text style={styles.travelModeText}>Bicycling</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Route Details and Stop Button */}
      {showRouteDetails && routeDetails && (
        <View style={styles.routeDetailsContainer}>
          {/* Marker info here: Title, Description, Category, Tag, etc.
              You will need to change the variable in setSelectedDestination */}
          <Text style={styles.routeDetailsText}>
            {selectedDestination ? selectedDestination.title : ""}
          </Text>

          {/* Total Distance and Duration */}
          <Text style={styles.routeDetailsText}>
            Total Distance: {routeDetails.distance.toFixed(2)} miles
          </Text>
          <Text style={styles.routeDetailsText}>
            Total Duration: {Math.ceil(routeDetails.duration)} minutes
          </Text>

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
            <Text style={styles.routeDetailsText}>No steps available.</Text>
          )}

          {/* Buttons */}
          <View style={styles.routeButtonsContainer}>
            {/* Set new start location button */}
            <TouchableOpacity
              style={styles.routeButton}
              onPress={handleChangeStartLocation}
            >
              <FontAwesome name="play" size={24} color="#73000A" />
              <Text style={styles.routeButtonText}>Set Start</Text>
            </TouchableOpacity>

            {/* Reset Location Button */}
            <TouchableOpacity
              style={styles.routeButton}
              onPress={handleResetStartLocation}
            >
              <FontAwesome name="times" size={24} color="#73000A" />
              <Text style={styles.routeButtonText}>Reset Loc</Text>
            </TouchableOpacity>

            {/* Stop Directions Button */}
            <TouchableOpacity
              style={styles.routeButton}
              onPress={handleStopDirections}
            >
              <FontAwesome name="stop" size={24} color="#73000A" />
              <Text style={styles.routeButtonText}>Stop Dir</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
