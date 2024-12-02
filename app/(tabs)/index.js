import React, { useEffect, useState, useRef } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { StyleSheet, SafeAreaView, Alert, View, Text, Switch, ScrollView, TouchableOpacity } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "../../FirebaseConfig";
import { useRouter } from "expo-router";
import { SearchBar } from "react-native-elements";
import * as SplashScreen from "expo-splash-screen";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

//import { GOOGLE_API_KEY } from "@env";

// Map page

// need to get permissions of user
// const getUserCurrentLocation = () => {
//   Geolocation.getCurrentPosition(position => {
//     console.log(position);
//   });
// };

export default function HomeScreen() {
  useEffect(() => {
    async function prepare() {
      console.log("TESTING TO HIDE SPLASH SCREEN");
      // Hide the splash screen once the app is ready
      await SplashScreen.hideAsync();
    }

    prepare();
  }, []);
  const router = useRouter();
  const [markers, setMarkers] = useState([]);
  const [filteredMarkers, setFilteredMarkers] = useState([]);
  const [search, setSearch] = useState("");
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
        const query = await getDocs(collection(FIRESTORE_DB, "markers"));
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

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar
        placeholder="Search Here..."
        onChangeText={(text) => setSearch(text)}
        value={search}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
      />
      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/PinFilterMain')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>This is a Test Button for Filter Pins</Text>
        </View>
      </TouchableOpacity>


      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
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
});
