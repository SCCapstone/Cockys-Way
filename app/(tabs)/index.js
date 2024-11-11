import React from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { useNavigation } from "expo-router";
import { markers } from "../../assets/markers";
//import Geolocation from '@react-native-community/geolocation';

//Map page

const INITIAL_REGION = {
  latitude: 34.00039991787572,
  longitude: -81.03594096158815,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const onMarkerSelected = (marker) => {
  Alert.alert(marker.name);
};

// need to get permissions of user
// const getUserCurrentLocation = () => {
//   Geolocation.getCurrentPosition(position => {
//     console.log(position);
//   });
// };

export default function HomeScreen() {
  const navigation = useNavigation();
  // getUserCurrentLocation();

  return (
    // provider={PROVIDER_GOOGLE}
    // this requires using Google's Map APIs, which has a free trial
    // trial is a very key word
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton
        mapType="mutedStandard"
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker}
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
