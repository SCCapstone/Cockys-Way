import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import locations from '../assets/json/locations.json'; // Path to the JSON file

const FavLocations = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLocationId, setNewLocationId] = useState('');
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('No user is logged in.');
        }

        const userDoc = doc(db, 'favorites', user.uid);
        const userData = await getDoc(userDoc);

        if (userData.exists()) {
          const favoriteIds = userData.data().locations || [];
          const filteredLocations = locations.filter((location) =>
            favoriteIds.includes(location.id)
          );
          setFavorites(filteredLocations);
        } else {
          setFavorites([]);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [db, auth]);

  const addLocationToFavorites = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'No user is logged in.');
        return;
      }

      const locationId = parseInt(newLocationId, 10); // Ensure it's a number
      const location = locations.find((loc) => loc.id === locationId);
      if (!location) {
        Alert.alert('Error', 'Invalid location ID.');
        return;
      }

      const userDoc = doc(db, 'favorites', user.uid);
      await setDoc(userDoc, { locations: arrayUnion(locationId) }, { merge: true });

      setFavorites((prevFavorites) => [...prevFavorites, location]);
      setNewLocationId('');
      Alert.alert('Success', 'Location added to favorites!');
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

      const userDoc = doc(db, 'favorites', user.uid);
      await setDoc(userDoc, { locations: arrayRemove(locationId) }, { merge: true });

      setFavorites((prevFavorites) =>
        prevFavorites.filter((location) => location.id !== locationId)
      );
      Alert.alert('Success', 'Location removed from favorites!');
    } catch (error) {
      console.error('Error removing location from favorites:', error);
      Alert.alert('Error', 'Failed to remove location from favorites.');
    }
  };

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
              <Text style={styles.name}>{item.name}</Text>
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
    marginLeft: 10, // Add some space between text and button
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
