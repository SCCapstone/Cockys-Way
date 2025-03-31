import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";

export default function RouteHistory() {
  const [routeHistory, setRouteHistory] = useState([]);
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 16,
      color: colors.primary,
    },
    routeItem: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.white,
      backgroundColor: colors.card,
      borderRadius: 8,
      marginBottom: 12,
    },
    routeText: {
      fontSize: 16,
      marginBottom: 4,
      color: colors.text,
    },
    deleteButton: {
      backgroundColor: colors.primary,
      padding: 8,
      borderRadius: 4,
      alignItems: "center",
      marginTop: 8,
    },
    deleteButtonText: {
      color: colors.alwaysWhite,
      fontSize: 14,
    },
    noHistoryText: {
      fontSize: 16,
      textAlign: "center",
      marginTop: 16,
      color: colors.alwaysWhite,
    },
    clearButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 16,
    },
    clearButtonText: {
      color: colors.alwaysWhite,
      fontSize: 16,
    },
  });

  const isValidRoute = (item) => {
    return (
      item &&
      item.title &&
      item.startLocation &&
      item.startLocation.latitude !== undefined &&
      item.startLocation.longitude !== undefined &&
      item.endLocation &&
      item.endLocation.latitude !== undefined &&
      item.endLocation.longitude !== undefined &&
      item.travelMode &&
      item.timestamp
    );
  };

  const cleanRouteHistory = async () => {
    try {
      const history = await AsyncStorage.getItem("routeHistory");
      if (history) {
        const parsedHistory = JSON.parse(history);
        const validHistory = parsedHistory.filter(isValidRoute);

        if (validHistory.length !== parsedHistory.length) {
          await AsyncStorage.setItem(
            "routeHistory",
            JSON.stringify(validHistory)
          );
          setRouteHistory(validHistory);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error cleaning route history: ", error);
      return false;
    }
  };

  //Fetch route history
  useEffect(() => {
    const fetchRouteHistory = async () => {
      try {
        await cleanRouteHistory();

        const history = await AsyncStorage.getItem("routeHistory");
        if (history) {
          // Sort by timestamp
          const parsedHistory = JSON.parse(history);
          const sortedHistory = parsedHistory.sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
          });
          setRouteHistory(sortedHistory);
        }
      } catch (error) {
        console.error("Route history fetch error: ", error);
      }
    };

    fetchRouteHistory();
  }, []);

  //Delete a route
  const deleteRoute = async (index) => {
    try {
      const updatedHistory = routeHistory.filter((_, i) => i !== index);
      await AsyncStorage.setItem(
        "routeHistory",
        JSON.stringify(updatedHistory)
      );
      setRouteHistory(updatedHistory);
    } catch (error) {
      console.error("Error deleting route: ", error);
    }
  };

  // Clear all route history
  const clearRouteHistory = async () => {
    try {
      await AsyncStorage.removeItem("routeHistory");
      setRouteHistory([]);
    } catch (error) {
      console.error("Error clearing route history:", error);
    }
  };

  // Safely render location text
  const renderLocationText = (label, location) => {
    if (
      !location ||
      location.latitude === undefined ||
      location.longitude === undefined
    ) {
      return (
        <Text style={[styles.routeText, { color: colors.error }]}>
          {label}: Invalid location data
        </Text>
      );
    }
    return (
      <Text style={styles.routeText}>
        {label}: {location.latitude}, {location.longitude}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Route History</Text>

      {routeHistory.length > 0 ? (
        <FlatList
          data={routeHistory}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.routeItem}>
              <Text style={styles.routeText}>
                Title: {item.title || "Untitled"}
              </Text>
              {renderLocationText("Start", item.startLocation)}
              {renderLocationText("End", item.endLocation)}
              <Text style={styles.routeText}>
                Mode: {item.travelMode || "Unknown"}
              </Text>
              <Text style={styles.routeText}>
                Date:{" "}
                {item.timestamp
                  ? new Date(item.timestamp).toLocaleString()
                  : "Unknown date"}
              </Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteRoute(index)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noHistoryText}>No route history available</Text>
      )}

      <TouchableOpacity style={styles.clearButton} onPress={clearRouteHistory}>
        <Text style={styles.clearButtonText}>Clear All History</Text>
      </TouchableOpacity>
    </View>
  );
}
