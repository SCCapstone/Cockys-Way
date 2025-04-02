import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  Linking,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import axios from "axios";
import { ThemeContext } from "../ThemeContext";
import { useContext } from "react";
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

const bounds = {
  north: 34.302685,
  south: 33.75846,
  east: -80.826204,
  west: -81.4305,
};

const addressBounds = (lat, long) => {
  return (
    lat <= bounds.north &&
    lat >= bounds.south &&
    long <= bounds.east &&
    long >= bounds.west
  );
};

const searchAddress = async (address) => {
  console.log("ORIGINAL ADDRESS " + address);
  let cleanedAddress = address
    .trim()
    .replace(/\s{2,}/g, " ")
    .replace(/-\d{4}$/, "")
    .replace(/(Room|Rm|Suite|Ste)\s*\d+/gi, "")
    .replace(/\b(University of South Carolina|UofSC)\b/gi, "")
    .replace(/\bCollege of.*?(?=\d{3,}\s\w)/gi, "")
    .replace(/\bDepartment of.*?(?=\d{3,}\s\w)/gi, "")
    .replace(/^\s*,\s*/, "")
    .replace(/(Columbia)(?!,)/i, "$1,")
    .replace(/([a-zA-Z])(\d)/g, "$1 $2")
    .replace(/(\d)([A-Z][a-z]+)/g, "$1 $2");
  if (!/columbia,?\s*(sc|south carolina)/i.test(cleanedAddress)) {
    cleanedAddress += ", Columbia, SC";
  }
  console.log("CLEANED ADDRESS " + cleanedAddress);
  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address: cleanedAddress,
          key: GOOGLE_API_KEY,
        },
      }
    );
    console.log("DATA");
    console.log(response);

    const filteredData = response.data.results.filter((location) => {
      const lat = location.geometry.location.lat;
      const lon = location.geometry.location.lng;
      return addressBounds(lat, lon);
    });

    return filteredData;
  } catch (error) {
    console.error("Error searching address:", error);
    throw error;
  }
};

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
  //const professor = JSON.parse(item);
  const [professor, setProfessor] = useState(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  const styles = StyleSheet.create({
    background: {
      backgroundColor: colors.background,
    },
    container: {
      alignItems: "center",
      paddingBottom: 30,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 30,
      fontWeight: "bold",
      marginTop: 20,
      color: colors.primary,
    },
    subtitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.primary,
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
      backgroundColor: colors.lightGarnet,
      alignItems: "left",
      padding: 10,
    },
    quickLookHeader: {
      fontSize: 23,
      color: colors.primary,
    },
    quickLookText: {
      fontSize: 20,
      marginTop: 10,
      color: colors.text,
    },
    circle: {
      marginRight: 10,
      marginTop: 10,
    },
    line: {
      borderBottomColor: colors.primary,
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
      color: colors.text,
    },
    radius: {
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    navigateButton: {
      backgroundColor: colors.primary,
      padding: 10,
      marginTop: 10,
      borderRadius: 5,
      alignItems: "center",
    },
    navigateButtonText: {
      color: colors.alwaysWhite,
      fontSize: 18,
      fontWeight: "bold",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: colors.primary,
    },
  });

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
  }

  // Function to navigate to office location on the map
  const navigateToOffice = async () => {
    if (!professor.office) {
      Alert.alert("No office information available");
      return;
    }

    setNavigating(true);
    try {
      const response = await searchAddress(professor.office);
      console.log(response);

      if (response.length > 0) {
        const location = response[0];
        const latitude = location.geometry.location.lat;
        const longitude = location.geometry.location.lng;

        router.push({
          pathname: "/(tabs)",
          params: { latitude, longitude },
        });
        console.log("SENT TO MAP");
      } else {
        Alert.alert("Address not found.");
      }
    } catch (error) {
      console.error("Error searching address:", error);
      Alert.alert("Error searching address.");
    } finally {
      setNavigating(false);
    }
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
  const officeHours = sortOfficeHours(professor.officeHours);

  // updates the indicator and circle color based on the professor's office hours
  const indicator = checkHours(officeHours) ? "Available" : "Unavailable";
  const circleColor = indicator === "Available" ? "#39C75A" : "#FF0000";
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      style={styles.background}
    >
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

        {professor.office ? (
          <>
            <Text style={styles.quickLookText}>{professor.office}</Text>
            {navigating ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ marginTop: 10 }}
              />
            ) : (
              <TouchableOpacity
                style={styles.navigateButton}
                onPress={navigateToOffice}
              >
                <Text style={styles.navigateButtonText}>
                  Navigate to Office
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text style={styles.quickLookText}>
            No office information available.
          </Text>
        )}
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
      {(professor.website || professor.email || professor.phone) && (
        <View style={[styles.officeInfo, styles.quickLook, styles.radius]}>
          <Text style={[styles.quickLookHeader]}>Let's Connect:</Text>
          {/* TODO: NEED TO UPDATE WITH OFFICE INFO IN DB */}
          {professor.email && (
            <View style={[styles.flexRow, styles.spacer]}>
              <FontAwesome name="at" size={30} color="#73000A" />
              <Text
                style={[styles.social]}
                onPress={() => Linking.openURL(`mailto:${professor.email}`)}
              >
                {professor.email}
              </Text>
            </View>
          )}
          {professor.phone && (
            <View style={[styles.flexRow, styles.spacer]}>
              <FontAwesome name="phone" size={30} color="#73000A" />
              <Text style={[styles.social]}>{professor.phone}</Text>
            </View>
          )}
          {professor.website && (
            <View style={[styles.flexRow, styles.spacer]}>
              <FontAwesome name="globe" size={30} color="#73000A" />
              <Text
                style={[styles.social]}
                onPress={() => Linking.openURL(professor.website)}
              >
                My Website
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
