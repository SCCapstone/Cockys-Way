import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  Linking,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

// for geolocation data
import axios from "axios";
import { GOOGLE_API_KEY } from "@env";

import defaultImage from "../assets/professorInfo/200x200.png";

const daysOfWeek = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

// Checks if the professor is currently in their office
export const checkHours = (officeHours) => {
  const currentDay = daysOfWeek[new Date().getDay()];
  if (currentDay == "saturday" || currentDay == "sunday") return false;
  const hours = officeHours[currentDay];

  if (!hours) return false;

  // Convert string of time into minutes to compare to current
  const [start, end] = hours.split("-").map((time) => {
    let [hour, minute] = time
      .trim()
      .replace(/ (AM|PM)/, "")
      .split(":")
      .map(Number);
    if (time.includes("PM") && hour !== 12) hour += 12;
    if (time.includes("AM") && hour === 12) hour = 0; // Handle midnight case
    return hour * 60 + minute;
  });

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return currentMinutes >= start && currentMinutes <= end;
};

export default function ProfessorInfo() {
  const { item } = useLocalSearchParams();
  const [professor, setProfessor] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Nav for sending user to office location
  const [fetchingLocation, setFetchingLocation] = useState(false); // location fetching state


  useEffect(() => {
    if (item) {
      try {
        setProfessor(JSON.parse(item));
      } catch (error) {
        console.error("Error parsing professor data:", error);
      }
    }
    setLoading(false);
  }, [item]);

  if (!professor || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#73000A" />
        <Text style={styles.loadingText}>Loading Professor details...</Text>
      </View>
    );
  } // end if loading



// Convert office address to coords with lat & long
const getCoordinates = async (address) => {
  setFetchingLocation(true);
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address: address,
          key: GOOGLE_API_KEY,
        },
      }
    );

    if (response.data.status === "OK") {
      const location = response.data.results[0].geometry.location;
      return location;
    } else {
      console.error("Geocoding API error:", response.data.status);
      return null;
    }

  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;

  } finally {
    setFetchingLocation(false);
  }
};








  // Function to send user to prof office location on the map page
const navigateToOffice = () => {
    //const router = useRouter();
    if (!professor.office) {
      alert("Office address not available.");
      return;
    } // office not given so just stop looking

    //const location = await getCoordinates(professor.office);
    //if (location) {
      /*
      router.push({
        pathname: "/(tabs)/index", // MAP PAGE
        params: {
          latitude: location.lat,
          longitude: location.lng,
          title: professor.name + "'s Office",
        },
      });
      */
      //router.push({
      //router.navigate({
      router.replace({
        pathname: "/(tabs)", 
        params: {
          officeAddress: professor.office,
          title: professor.name + "'s Office",
        },
      });
      console.log(professor.office);

    //} else {
    //  alert("Unable to find office location.");
    //}
  };


  











  // Handles sorting the office hours by day of the week so
  // that they are displayed in the correct order
  const sortOfficeHours = (officeHours) => {
    const sortedOfficeHours = {};
    daysOfWeek.forEach((day) => {
      if (officeHours[day]) {
        sortedOfficeHours[day] = officeHours[day];
      }
    });
    return sortedOfficeHours;
  };

  // saves the sorted office hours to a variable
  const officeHours = sortOfficeHours(professor.officeHours || {}); // should handle if prof has no hrs listed

  // updates the indicator and circle color based on the professor's office hours
  const indicator = checkHours(officeHours) ? "Available" : "Unavailable";
  const circleColor = indicator === "Available" ? "#39C75A" : "#FF0000";
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{professor.name}</Text>
      <Text style={styles.subtitle}>{professor.title}</Text>
      
      <View style={styles.topInfo}>
        <View style={styles.midBox}>
          <Image
            style={styles.image}
            // Will switch around when we determine how to store images
            // Need to check if we can use portraits on UofSC site
            source={
              professor.image
                ? { uri: "data:image/png;base64," + professor.image }
                : defaultImage
            }
          />
        </View>
        <View style={[styles.midBox, styles.quickLook]}>
          <Text style={styles.quickLookHeader}>Office Status:</Text>
          <View style={styles.flexRow}>
            <FontAwesome
              size={17}
              style={[styles.circle, { color: circleColor }]}
              name="circle"
            />
            <Text style={styles.quickLookText}>{indicator}</Text>
          </View>
          <Text style={[styles.quickLookHeader, { marginTop: 20 }]}>
            Affiliation:
          </Text>
          <Text style={styles.quickLookText}>{professor.college}</Text>
        </View>
      </View>

      <View style={styles.line}></View>
      <View style={[styles.officeInfo, styles.quickLook]}>
        <Text style={styles.quickLookHeader}>Office Information:</Text>

        {/* TODO: NEED TO UPDATE WITH OFFICE INFO IN DB */}
        {professor.office ? (
          <Text style={styles.quickLookText}>{professor.office}</Text>
        ) : (
          <Text style={styles.quickLookText}>
            No office information available.
          </Text>
        )}

        {/* should send user to office location on map */}
        <TouchableOpacity
          style={styles.navigateButton}
          onPress={navigateToOffice}
          //disabled={fetchingLocation} // ✅ Disable button while fetching
        >
          {/*{fetchingLocation ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>*/}
              <FontAwesome name="map-marker" size={20} color="#fff" />
              <Text style={styles.navigateButtonText}>Navigate to Office</Text>
        </TouchableOpacity>



      </View>
      <View style={styles.line}></View>
      <View style={[styles.officeInfo, styles.quickLook]}>
        <Text style={styles.quickLookHeader}>Office Hours:</Text>
        {officeHours &&
          Object.entries(officeHours).map(([day, hours]) =>
            hours ? (
              <Text key={day} style={styles.quickLookText}>
                {day.charAt(0).toUpperCase() + day.slice(1)}: {hours}
              </Text>
            ) : null
          )}
      </View>
      <View style={styles.line}></View>
      <View style={[styles.officeInfo, styles.quickLook, styles.radius]}>
        <Text style={[styles.quickLookHeader]}>Let's Connect:</Text>

        {/* TODO: NEED TO UPDATE WITH OFFICE INFO IN DB */}
        <View style={[styles.flexRow, styles.spacer]}>
          <FontAwesome name="at" size={30} color="#73000A" />
          <Text
            style={[styles.social]}
            onPress={() => Linking.openURL(`mailto:${professor.email}`)}
          >
            {professor.email}
          </Text>
        </View>

        <View style={[styles.flexRow, styles.spacer]}>
          <FontAwesome name="phone" size={30} color="#73000A" />
          <Text style={[styles.social]}>{professor.phone}</Text>
        </View>
        
        <View style={[styles.flexRow, styles.spacer]}>
          <FontAwesome name="globe" size={30} color="#73000A" />
          <Text
            style={[styles.social]}
            onPress={() => Linking.openURL(professor.website)}
          >
            My Website
          </Text>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 20,
    color: "#73000A",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#73000A",
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  topInfo: {
    flexDirection: "row",
    marginTop: 20,
    width: "95%",
  },
  midBox: {
    flex: 1,
    alignItems: "center",
    margin: 5,
  },
  image: {
    height: 225,
    width: 200,
  },
  quickLook: {
    backgroundColor: "#D5B4BA",
    alignItems: "left",
    padding: 10,
  },
  quickLookHeader: {
    fontSize: 23,
    color: "#73000A",
  },
  quickLookText: {
    fontSize: 20,
    marginTop: 10,
  },
  circle: {
    marginRight: 10,
    marginTop: 10,
  },
  line: {
    borderBottomColor: "#73000A",
    borderBottomWidth: 2,
    width: "95%",
    marginTop: 2,
    marginBottom: 2,
  },
  officeInfo: {
    width: "95%",
    margin: 5,
  },
  spacer: {
    marginTop: 20,
  },
  social: {
    marginLeft: 30,
    fontSize: 20,
  },
  radius: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  // Navigate to Office
  navigateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#73000A",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  navigateButtonText: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 10,
  },
  // Loading Wheel
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#73000A",
  },
});
