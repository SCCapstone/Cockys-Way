import { View, Text, StyleSheet, Image, SafeAreaView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import defaultImage from "../assets/professorInfo/200x200.png";

export default function ProfessorInfo() {
  const { item } = useLocalSearchParams();
  const professor = JSON.parse(item);

  // Manage office hours indicator
  // Need to import office hour schedules
  const currentHour = new Date().getHours();
  const indicator =
    currentHour > 9 && currentHour < 17 ? "Available" : "Unavailable";
  const circleColor = indicator === "Available" ? "#39C75A" : "#FF0000";

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{professor.Name}</Text>
      <Text style={styles.subtitle}>{professor.Title}</Text>
      <View style={styles.topInfo}>
        <View style={styles.midBox}>
          <Image
            style={styles.image}
            // Will switch around when we determine how to store images
            source={
              professor.image
                ? { uri: "data:image/png;base64," + professor.image }
                : defaultImage
            }
          />
        </View>
        <View style={[styles.midBox, styles.quickLook]}>
          <Text style={styles.quickLookText}>Office Status</Text>
          <View style={styles.topInfo}>
            <FontAwesome
              size={15}
              style={[styles.circle, { color: circleColor }]}
              name="circle"
            />
            <Text style={styles.quickLookText}>{indicator}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
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
  topInfo: {
    flexDirection: "row",
    marginTop: 20,
  },
  midBox: {
    flex: 1,
    alignItems: "center",
    margin: 5,
  },
  image: {
    minWidth: 200,
    minHeight: 200,
  },
  quickLook: {
    backgroundColor: "#D5B4BA",
    alignItems: "left",
    padding: 10,
  },
  quickLookText: {
    fontSize: 20,
  },
  circle: {
    marginTop: 5,
    marginRight: 10,
  },
});
