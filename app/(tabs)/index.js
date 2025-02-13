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
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "../../FirebaseConfig";
import { useRouter } from "expo-router";
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

  const INITIAL_REGION = {
    latitude: 34.00039991787572,
    longitude: -81.03594096158815,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const onMarkerSelected = (marker) => {
    Alert.alert(marker.title || "Marker Selected");

    setSelectedDestination({
      latitude: marker.latitude,
      longitude: marker.longitude,
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
          latitude: marker.latitude,
          longitude: marker.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
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
      } catch (err) {
        Alert.alert("Error fetching data");
        setIsLoading(false);
      }
    };

    fetchMarkers();
  }, []);

  // Update filtered markers based on search input
  useEffect(() => {
    if (search === "") {
      setFilteredMarkers(markers);
    } else {
      const filtered = markers.filter((marker) =>
        marker.title.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredMarkers(filtered);
    }
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

  /*
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }
*/ // Old isLoading
// CHLOE NEW CODE
    if (isLoading) {
      return (
          <View style={styless.loadingContainer}>
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
      >
        {filteredMarkers.map((marker) => (
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
          />
        ))}

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

const styless = StyleSheet.create({
  // New Chloe code for loading wheel
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
  },
  });
