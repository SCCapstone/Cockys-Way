import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function FavLocationsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Favorite Locations</Text>
      <View style={styles.content}>
        <Text style={styles.text}>
          Here you can manage your favorite locations.
        </Text>
        {/* Add more content as needed */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F3F3F3",
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#73000A",
  },
  content: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 5,
  },
  text: {
    fontSize: 18,
    color: "#000000",
  },
});
