import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const FavLocations = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLocationId, setNewLocationId] = useState('');
  const auth = getAuth();
  const db = getFirestore();

  const fetchFavorites = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is logged in.');
      }

      // Fetch user's favorite location IDs
      const userDocRef = doc(db, 'favorites', user.uid);
      const userDoc = await getDoc(userDocRef);
      const favoriteIds = userDoc.exists() ? userDoc.data().locations || [] : [];

      if (favoriteIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      // Fetch all locations from the `locTest` collection
      const locationsRef = collection(db, 'locTest');
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
      console.error('Error fetching favorite locations:', error);
      Alert.alert('Error', 'Failed to load favorite locations.');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const addLocationToFavorites = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'No user is logged in.');
        return;
      }

      const locationId = parseInt(newLocationId, 10); // Ensure it's a number
      if (!locationId) {
        Alert.alert('Error', 'Invalid location ID.');
        return;
      }

      // Add the location ID to the user's favorites
      const userDocRef = doc(db, 'favorites', user.uid);
      await updateDoc(userDocRef, { locations: arrayUnion(locationId) });

      Alert.alert('Success', 'Location added to favorites!');
      setNewLocationId('');
      fetchFavorites(); // Refresh the list after adding
    } catch (error) {
      console.error('Error adding location to favorites:', error);
      Alert.alert('Error', 'Failed to add location to favorites.');
    }
  };

  const removeLocationFromFavorites = async (locationId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'No user is logged in.');
        return;
      }

      // Remove the location ID from the user's favorites
      const userDocRef = doc(db, 'favorites', user.uid);
      await updateDoc(userDocRef, { locations: arrayRemove(locationId) });

      Alert.alert('Success', 'Location removed from favorites!');
      fetchFavorites(); // Refresh the list after removing
    } catch (error) {
      console.error('Error removing location from favorites:', error);
      Alert.alert('Error', 'Failed to remove location from favorites.');
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
      <TextInput
        style={styles.input}
        placeholder="Enter Location ID"
        value={newLocationId}
        onChangeText={setNewLocationId}
      />
      <TouchableOpacity style={styles.addButton} onPress={addLocationToFavorites}>
        <Text style={styles.addButtonText}>Add to Favorites</Text>
      </TouchableOpacity>
      <View style={styles.separator} />
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={styles.name}>{item.title || `Location ID: ${item.id}`}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeLocationFromFavorites(item.id)}
              >
                <Text style={styles.removeButtonText}>−</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noFavorites}>No favorite locations found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#73000A',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#730000',
    marginBottom: 10,
    borderRadius: 5,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  noFavorites: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FavLocations;
