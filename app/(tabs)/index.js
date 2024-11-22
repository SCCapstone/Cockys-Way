import React, { useEffect, useState, useRef } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { StyleSheet, SafeAreaView, Alert } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "../../FirebaseConfig";
import { useRouter } from "expo-router";
//import { GOOGLE_API_KEY } from "@env";

//Map page

// need to get permissions of user
// const getUserCurrentLocation = () => {
//   Geolocation.getCurrentPosition(position => {
//     console.log(position);
//   });
// };

export default function HomeScreen() {
  const router = useRouter();
  const [markers, setMarkers] = useState([]);
  const mapRef = useRef(null);

  //fetch markers from Firebase
  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const query = await getDocs(collection(FIRESTORE_DB, "markers"));
        const db_data = query.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        setMarkers(db_data);
      } catch (err) {
        Alert.alert("Error fetching data");
      }
    };

    fetchMarkers();
  }, []);

  const INITIAL_REGION = {
    latitude: 34.00039991787572,
    longitude: -81.03594096158815,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const onMarkerSelected = (marker) => {
    Alert.alert(marker.title || "Marker Selected");

    //zoom in on marker region
    if(mapRef.current){
      mapRef.current.animateToRegion({
        latitude: marker.latitude,
        longitude: marker.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 2500); //2500 is dur of zoom in ms
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        key={markers.length}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton
        ref={mapRef}
      >
        {markers.map((marker) => (
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
      </MapView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
