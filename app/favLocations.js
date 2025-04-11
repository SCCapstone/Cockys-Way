import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import { useRouter } from "expo-router";

const FavLocations = () => {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const db = getFirestore();

  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 10,
      color: colors.text,
    },
    input: {
      height: 40,
      borderColor: colors.border,
      borderWidth: 1,
      marginBottom: 10,
      paddingHorizontal: 8,
      borderRadius: 5,
      color: colors.text,
      backgroundColor: colors.card,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingVertical: 10,
      borderRadius: 5,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    addButtonText: {
      color: colors.card,
      fontWeight: "bold",
      fontSize: 16,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      margin: 5,
    },
    itemContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 10,
      backgroundColor: colors.primary,
      borderRadius: 5,
      marginBottom: 10,
    },
    name: {
      flex: 1,
      fontSize: 16,
      fontWeight: "bold",
      color: colors.alwaysWhite,
    },
    removeButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.disabledDay,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 10,
    },
    removeButtonText: {
      color: colors.garnetWhite,
      fontSize: 20,
      fontWeight: "bold",
    },
    noFavorites: {
      fontSize: 16,
      textAlign: "center",
      color: colors.text,
      marginTop: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  const fetchFavorites = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert(
          "Sign In Required",
          "Please sign in to access your favorite locations.",
          [{ text: "OK", onPress: () => console.log("Sign-in required") }]
        );
        setFavorites([]);
        setLoading(false);
        return;
      }

      // Fetch user's favorite location IDs
      const userDocRef = doc(db, "favorites", user.uid);
      const userDoc = await getDoc(userDocRef);
      const favoriteIds = userDoc.exists()
        ? userDoc.data().locations || []
        : [];

      if (favoriteIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      // Fetch all locations from the `locTest` collection
      const locationsRef = collection(db, "locTest");
      const locationsSnapshot = await getDocs(locationsRef);

      // Filter locations by favorite IDs and include titles
      const matchedLocations = favoriteIds.map((id) => {
        const location = locationsSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .find((loc) => loc.id === id);
        return location || { id, title: `Location ID: ${id}` }; // Fallback to ID if location is not found
      });

      setFavorites(matchedLocations);
    } catch (error) {
      console.error("Error fetching favorite locations:", error);
      Alert.alert("Error", "Failed to load favorite locations.");
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const removeLocationFromFavorites = async (locationId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert(
          "Sign In Required",
          "Please sign in to remove a location from your favorites.",
          [{ text: "OK", onPress: () => console.log("Sign-in required") }]
        );
        return;
      }

      // Remove the location ID from the user's favorites
      const userDocRef = doc(db, "favorites", user.uid);
      await updateDoc(userDocRef, { locations: arrayRemove(locationId) });

      Alert.alert("Success", "Location removed from favorites!");
      fetchFavorites(); // Refresh the list after removing
    } catch (error) {
      console.error("Error removing location from favorites:", error);
      Alert.alert("Error", "Failed to remove location from favorites.");
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#730000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorite Locations</Text>

      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() =>
                router.push({ pathname: "/", params: { markerId: item.id } })
              }
            >
              <Text style={styles.name}>
                {item.title || `Location ID: ${item.id}`}
              </Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeLocationFromFavorites(item.id)}
              >
                <Text style={styles.removeButtonText}>−</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noFavorites}>No favorite locations found.</Text>
      )}
    </View>
  );
};

export default FavLocations;
