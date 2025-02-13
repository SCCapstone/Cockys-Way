import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFonts, Abel_400Regular } from '@expo-google-fonts/abel';
import * as SplashScreen from 'expo-splash-screen';
import { getAuth, updatePassword, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore"; 
import { getFirestore } from "firebase/firestore";

// Prevent splash screen from hiding until fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function MyAccountScreen() {
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordForAuth, setPasswordForAuth] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const firestore = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Sign In Required", "Please sign in to view your account details.");
        return;
      }

      const uid = user.uid;
      const userData = {
        email: user.email || "N/A",
        phoneNumber: user.phoneNumber || "N/A",
        uid: user.uid,
      };

      try {
        const userDocRef = doc(firestore, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const firestoreData = userDoc.data();
          const { settings, locations, displayName, providerId, ...filteredData } = firestoreData;
          setUserInfo({ ...userData, ...filteredData });
        } else {
          setUserInfo(userData);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load user data.");
        setUserInfo(userData);
      }
    };

    fetchUserInfo();
  }, [firestore, auth]);

  let [fontsLoaded] = useFonts({ Abel_400Regular });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // loading Wheel
  if (!fontsLoaded) {
    //return null;
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#73000A" />
      </View>
    );
  }

  const handleAuthenticate = async () => {
    if (!auth.currentUser) {
      Alert.alert("Error", "No user is signed in.");
      return;
    }

    if (passwordForAuth.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, passwordForAuth);
      await reauthenticateWithCredential(auth.currentUser, credential);
      setIsEditing(true);
      setIsAuthenticating(false);
    } catch (error) {
      Alert.alert("Error", "Authentication failed. Please ensure your password is correct.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>My Account</Text>
      {userInfo && Object.entries(userInfo).map(([key, value]) => (
        <View style={styles.infoBox} key={key}>
          <Text style={styles.infoLabel}>{key.replace(/_/g, ' ')}:</Text>
          <Text style={styles.infoValue}>{value.toString()}</Text>
        </View>
      ))}
      {!isEditing && !isAuthenticating && (
        <TouchableOpacity style={styles.editButton} onPress={() => setIsAuthenticating(true)}>
          <Text style={styles.buttonText}>Edit Account Information</Text>
        </TouchableOpacity>
      )}
      {isAuthenticating && (
        <>
          <TextInput
            style={styles.inputField}
            placeholder="Enter your current password"
            placeholderTextColor="#000"
            secureTextEntry
            value={passwordForAuth}
            onChangeText={setPasswordForAuth}
          />
          <TouchableOpacity style={styles.changePasswordButton} onPress={handleAuthenticate}>
            <Text style={styles.buttonText}>Authenticate</Text>
          </TouchableOpacity>
        </>
      )}
      {isEditing && (
        <>
          <TextInput
            style={styles.inputField}
            placeholder="New Email (Leave blank if unchanged)"
            placeholderTextColor="#000"
            value={newEmail}
            onChangeText={setNewEmail}
          />
          <TextInput
            style={styles.inputField}
            placeholder="New Password (Leave blank if unchanged)"
            placeholderTextColor="#000"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity style={styles.changePasswordButton} onPress={() => setIsEditing(false)}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#F3F3F3', 
  },
  header: { 
    fontSize: 30, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: '#73000A', 
    fontFamily: 'Abel_400Regular', 
  },
  infoBox: { 
    backgroundColor: '#73000A', 
    padding: 10, 
    borderRadius: 5, 
    marginBottom: 10, 
  },
  infoLabel: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    fontFamily: 'Abel_400Regular', 
  },
  infoValue: { 
    fontSize: 18, 
    color: '#FFFFFF', 
    fontFamily: 'Abel_400Regular', 
  },
  inputField: { 
    backgroundColor: '#F3F3F3', 
    padding: 10, 
    borderRadius: 5, 
    fontSize: 18, 
    color: '#000000', 
    marginTop: 10, 
    borderWidth: 1, 
    borderColor: '#000000', 
  },
  editButton: { 
    backgroundColor: '#73000A', 
    padding: 10, 
    borderRadius: 5, 
    marginTop: 10, 
    alignItems: 'center', 
  },
  changePasswordButton: { 
    backgroundColor: '#73000A', 
    padding: 10, 
    borderRadius: 5, 
    marginTop: 10, 
    alignItems: 'center', 
  },
  buttonText: { 
    fontSize: 18, 
    color: '#FFFFFF', 
  },
  
  // Loading Wheel
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
  },
});
