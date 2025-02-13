import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  Linking,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

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
//  const professor = JSON.parse(item); // ORIG.
  const [professor, setProfessor] = useState(null);
  const [loading, setLoading] = useState(true);

//    NEW CODE TO ACCOUNT FOR LOADING -CRB
  useEffect(() => {
    if (item) {
      try {
        setProfessor(JSON.parse(item)); // ✅ Parse professor data
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
//    END NEW CODE FOR LOADING -CRB




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
//  const officeHours = sortOfficeHours(professor.officeHours); // COMMENTED OUT ORIG.
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
