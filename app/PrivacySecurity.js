import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Pressable,
} from 'react-native';
import { useFonts, Abel_400Regular } from '@expo-google-fonts/abel';
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

export default function PrivacySecurityScreen() {
  const navigation = useNavigation(); // Used to navigate between screens
  const [isEnabled, setIsEnabled] = React.useState(false); // State for location services toggle
  const [modalVisible, setModalVisible] = React.useState(false); // State for dialog visibility
  const user = getAuth().currentUser; // Current authenticated user

  // Initialize Firestore
  const firestore = getFirestore();

  // Fetch settings from Firestore when the component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      if (user) { // Ensure user is authenticated
        try {
          const userDoc = doc(firestore, "settings", user.uid); // Reference user's document
          const userSnapshot = await getDoc(userDoc); // Fetch the document from Firestore

          if (userSnapshot.exists()) {
            // Get locationEnabled setting from the document or default to false
            const userData = userSnapshot.data();
            const locationEnabled = userData.settings?.locationEnabled || false;
            setIsEnabled(locationEnabled); // Set the toggle state
          } else {
            console.log("No settings document found for user.");
          }
        } catch (error) {
          console.error("Error fetching user settings:", error);
        }
      } else {
        console.error("No UID provided");
      }
    };

    fetchSettings(); // Call the fetch function
  }, [user]); // Runs whenever the user changes

  // Update the privacy and security settings in Firestore
  const updatePrivacySecuritySettings = async (newSettings) => {
    if (user) {
      try {
        const userDoc = doc(firestore, "settings", user.uid); // Reference user's document
        await setDoc(userDoc, { settings: newSettings }, { merge: true }); // Update settings with merge
        console.log("Privacy and Security settings updated successfully");
      } catch (error) {
        console.error("Error updating privacy and security settings:", error);
      }
    } else {
      console.error("No UID provided");
    }
  };

  // Toggle switch state and update settings in Firestore
  const toggleSwitch = () => {
    const newState = !isEnabled; // Calculate the new state
    setIsEnabled(newState); // Update local state
    updatePrivacySecuritySettings({ locationEnabled: newState }); // Update Firestore
  };

  // Delete the user's data from Firestore
  const deleteUserData = async () => {
    if (user) {
      try {
        const userDoc = doc(firestore, "settings", user.uid); // Reference user's document
        await deleteDoc(userDoc); // Delete the document from Firestore
        console.log("User data deleted successfully");
        Alert.alert("Data Deleted", "Your data has been successfully deleted.");
        setModalVisible(false); // Close the confirmation dialog
      } catch (error) {
        console.error("Error deleting user data:", error);
        Alert.alert("Error", "There was an error deleting your data.");
      }
    } else {
      console.error("No UID provided");
    }
  };

  // Load custom fonts and ensure splash screen hides after fonts are ready
  let [fontsLoaded] = useFonts({
    Abel_400Regular,
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Privacy and Security</Text>

      {/* Delete My Data Button */}
      <View style={styles.settingItem}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setModalVisible(true)} // Show confirmation dialog
        >
          <Text style={styles.deleteButtonText}>Delete my data</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for delete confirmation */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} // Close dialog when requested
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Warning</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete all your data? This action cannot
              be undone.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalButton}
                onPress={() => setModalVisible(false)} // Close dialog without action
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonDanger]}
                onPress={deleteUserData} // Call delete user data function
              >
                <Text style={styles.modalButtonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Location Services Toggle */}
      <View style={styles.settingItem}>
        <View style={styles.accentBoxSmall}>
          <Text style={styles.settingText}>Location Services</Text>
          <Switch
            trackColor={{ false: "#000000", true: "#FFFFFF" }} // Track colors for switch
            thumbColor={isEnabled ? "#F3F3F3" : "#FFFFFF"} // Thumb color based on state
            ios_backgroundColor="#F3F3F3" // iOS-specific background
            onValueChange={toggleSwitch} // Handle toggle change
            value={isEnabled} // Bind to isEnabled state
          />
        </View>
      </View>
    </ScrollView>
  );
}

// Styles for the screen
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
    color: '#73000A', // Garnet color for header
    fontFamily: 'Abel_400Regular',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0', // Light grey divider
  },
  deleteButton: {
    backgroundColor: '#73000A', // Garnet background
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#FFFFFF', // White text
    textAlign: 'center',
  },
  accentBoxSmall: {
    backgroundColor: '#73000A', // Garnet background
    padding: 5,
    borderRadius: 5,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 22.5,
    color: '#FFFFFF', // White text
    fontFamily: 'Abel_400Regular',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
    width: '45%',
    alignItems: 'center',
  },
  modalButtonDanger: {
    backgroundColor: '#FF5C5C', // Red background for delete
  },
  modalButtonText: {
    color: '#FFFFFF', // White text
    fontWeight: 'bold',
  },
});
