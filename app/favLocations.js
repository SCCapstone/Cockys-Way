import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, Button, Alert } from 'react-native';
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import locations from '../assets/json/locations.json';

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

      // Validate the input ID
      const location = locations.find((loc) => loc.id === newLocationId);
      if (!location) {
        Alert.alert('Error', 'Invalid location ID.');
        return;
      }

      const userDoc = doc(db, 'favorites', user.uid);
      await setDoc(userDoc, { locations: arrayUnion(newLocationId) }, { merge: true });

      setFavorites((prevFavorites) => [...prevFavorites, location]);
      setNewLocationId('');
      Alert.alert('Success', 'Location added to favorites!');
    } catch (error) {
      console.error('Error adding location to favorites:', error);
      Alert.alert('Error', 'Failed to add location to favorites.');
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
      <Button title="Add to Favorites" onPress={addLocationToFavorites} />
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.address}>{item.address}</Text>
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
  itemContainer: {
    padding: 10,
    backgroundColor: '#730000', // Garnet background
    marginBottom: 10,
    borderRadius: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff', // White text
  },
  address: {
    fontSize: 14,
    color: '#fff', // White text
    marginTop: 5,
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
