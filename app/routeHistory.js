import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RouteHistory() {
  const [routeHistory, setRouteHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  //Fetch route history
  useEffect(() => {
    const fetchRouteHistory = async () => {
      try {
        const history = await AsyncStorage.getItem("routeHistory");
        if (history) {
          setRouteHistory(JSON.parse(history));
        }
      } catch (error) {
        console.error("Route history fetch error: ", error);
      }

      setLoading(false);
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

  // show loading circle while pulling data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#73000A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Route History</Text>

      {routeHistory.length > 0 ? (
        <FlatList
          data={routeHistory}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.routeItem}>
              <Text style={styles.routeText}>Title: {item.title}</Text>
              <Text style={styles.routeText}>
                Start: {item.startLocation.latitude},{" "}
                {item.startLocation.longitude}
              </Text>
              <Text style={styles.routeText}>
                End: {item.endLocation.latitude}, {item.endLocation.longitude}
              </Text>
              <Text style={styles.routeText}>Mode: {item.travelMode}</Text>
              <Text style={styles.routeText}>
                Date: {new Date(item.timestamp).toLocaleString()}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  routeItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  routeText: {
    fontSize: 16,
    marginBottom: 4,
  },
  deleteButton: {
    backgroundColor: "#73000a",
    padding: 8,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 8,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 14,
  },
  noHistoryText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
  clearButton: {
    backgroundColor: "#73000a",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  // New Chloe code for loading wheel
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
  },
});
