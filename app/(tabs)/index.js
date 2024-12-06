import React, { useEffect, useState, useRef } from "react";
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import {
  StyleSheet,
  SafeAreaView,
  Alert,
  View,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "../../FirebaseConfig";
import { useRouter } from "expo-router";
import { SearchBar } from "react-native-elements";
import * as SplashScreen from "expo-splash-screen";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GOOGLE_API_KEY } from "@env";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Map page

export default function HomeScreen() {
  const router = useRouter();
  const [markers, setMarkers] = useState([]);
  const [filteredMarkers, setFilteredMarkers] = useState([]);
  const [search, setSearch] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);

  const INITIAL_REGION = {
    latitude: 34.00039991787572,
    longitude: -81.03594096158815,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const onMarkerSelected = (marker) => {
    Alert.alert(marker.title || "Marker Selected");

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
        const query = await getDocs(collection(FIRESTORE_DB, "locTest"));     // Changed to use what Chloe brought in
        const db_data = query.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMarkers(db_data);
        setFilteredMarkers(db_data);
      } catch (err) {
        Alert.alert("Error fetching data");
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

  // request location permissions
  useEffect(() => {
    const checkPermission = async () => {
      const savedPermission = await AsyncStorage.getItem("locationPermission");
      // check if user has already granted location permission
      if (savedPermission) {
        setLocationPermission(savedPermission === "granted");
        return;
      }

      // request if no perm saved
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setLocationPermission(true);
        AsyncStorage.setItem("locationPermission", "granted");
      } else {
        setLocationPermission(false);
        AsyncStorage.setItem("locationPermission", "denied");
      }
    };

    checkPermission();
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        // Hide the splash screen once the app is ready
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

  // Display user's current location on map
  useEffect(() => {
    const getLocation = async () => {
      // check if user granted access to location
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log(status);
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
      } else {
        Alert.alert("Permission denied, please grant location access");
      }
    };

    getLocation();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar
        placeholder="Search Here..."
        onChangeText={(text) => setSearch(text)}
        value={search}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
      />
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => router.push("/PinFilterMain")}>
        <View style={styles.accentBox}>
          <Text style={styles.filterButtonText}>Filter Pins</Text>
        </View>
      </TouchableOpacity>

      <MapView
        ref={mapRef}
        style={styles.map}
        apiKey={GOOGLE_API_KEY}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        showsUserLocation={true}
        followsUserLocation={true}
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
            onPress={() => onMarkerSelected(marker)}
          />
        ))}
      </MapView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    backgroundColor: "white",
    borderBottomColor: "transparent",
    borderTopColor: "transparent",
  },
  searchInputContainer: {
    backgroundColor: "#EDEDED",
  },
  map: {
    flex: 1,
  },
  filterButton: {
    alignSelf: "center", // Center horizontally
    justifyContent: "center", // Center vertically within the button
    alignItems: "center", // Align text in the center of the button
    width: 200, // Button width
    height: 30, // Button height
    borderRadius: 25, // Half of the height for an oval shape
    backgroundColor: "#e2e2e2", // Background color
    marginVertical: 10, // Space around the button
  },
  filterButtonText: {
    color: "black", // Text color
    fontSize: 16, // Text size
    fontWeight: "bold", // Text weight
  },
});
