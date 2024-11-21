import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  Linking,
  ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import defaultImage from "../assets/professorInfo/200x200.png";

export default function ProfessorInfo() {
  const { item } = useLocalSearchParams();
  const professor = JSON.parse(item);

  const checkHours = (officeHours) => {
    const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    const currentDay = daysOfWeek[new Date().getDay()];
    const hours = officeHours[currentDay];

    if (!hours) return false;

    const [start, end] = hours.split("-").map((time) => {
      let [hour, minute] = time
        .trim()
        .replace(/ (AM|PM)/, "")
        .split(":")
        .map(Number);
      if (time.includes("PM") && hour !== 12) hour += 12;
      return hour * 60 + minute;
    });

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return currentMinutes >= start && currentMinutes <= end;
  };
  const indicator = checkHours(professor.officeHours)
    ? "Available"
    : "Unavailable";
  const circleColor = indicator === "Available" ? "#39C75A" : "#FF0000";
  console.log(professor.officeHours);
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
        {professor.officeHours &&
          Object.entries(professor.officeHours).map(([day, hours]) =>
            hours ? (
              <Text key={day} style={styles.quickLookText}>
                {day.charAt(0).toUpperCase() + day.slice(1)}: {hours}
              </Text>
            ) : null
          )}
      </View>
      <View style={styles.line}></View>
      <View style={[styles.officeInfo, styles.quickLook]}>
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
    flex: 1,
    alignItems: "center",
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
});
