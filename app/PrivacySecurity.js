import React, { useEffect, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useFonts, Abel_400Regular } from '@expo-google-fonts/abel';
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

export default function PrivacySecurityScreen() {
  const navigation = useNavigation();
  const [isEnabled, setIsEnabled] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [loading, setLoading] = useState(true);
  const user = getAuth().currentUser;

  const firestore = getFirestore();

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) {
        Alert.alert(
          "Sign In Required",
          "Please sign in to access your privacy and security settings.",
          [{ text: "OK", onPress: () => console.log("Sign-in prompt acknowledged") }]
        );
        setLoading(false);
        return;
      }

      try {
        const userDoc = doc(firestore, "settings", user.uid);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const locationEnabled = userData.settings?.locationEnabled || false;
          setIsEnabled(locationEnabled);
        } else {
          console.log("No settings document found for user.");
        }
      } catch (error) {
        console.error("Error fetching user settings:", error);
      }
      setLoading(false);
    };

    fetchSettings();
  }, [user]);

  const updatePrivacySecuritySettings = async (newSettings) => {
    if (!user) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to update your privacy and security settings.",
        [{ text: "OK", onPress: () => console.log("Sign-in prompt acknowledged") }]
      );
      return;
    }

    try {
      const userDoc = doc(firestore, "settings", user.uid);
      await setDoc(userDoc, { settings: newSettings }, { merge: true });
      console.log("Privacy and Security settings updated successfully");
    } catch (error) {
      console.error("Error updating privacy and security settings:", error);
    }
  };

  const toggleSwitch = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    updatePrivacySecuritySettings({ locationEnabled: newState });
  };

  const deleteUserData = async () => {
    if (!user) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to delete your data.",
        [{ text: "OK", onPress: () => console.log("Sign-in prompt acknowledged") }]
      );
      return;
    }

    try {
      const userDoc = doc(firestore, "settings", user.uid);
      await deleteDoc(userDoc);
      console.log("User data deleted successfully");
      Alert.alert("Data Deleted", "Your data has been successfully deleted.");
      setModalVisible(false);
    } catch (error) {
      console.error("Error deleting user data:", error);
      Alert.alert("Error", "There was an error deleting your data.");
    }
  };

  let [fontsLoaded] = useFonts({
    Abel_400Regular,
  });
    // Loading Wheel
    if (!fontsLoaded || loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#73000A" />
        </View>
      );
    }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Privacy and Security</Text>

      <View style={styles.settingItem}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.deleteButtonText}>Delete my data</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
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
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonDanger]}
                onPress={deleteUserData}
              >
                <Text style={styles.modalButtonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.settingItem}>
        <View style={styles.accentBoxSmall}>
          <Text style={styles.settingText}>Location Services</Text>
          <Switch
            trackColor={{ false: "#000000", true: "#FFFFFF" }}
            thumbColor={isEnabled ? "#F3F3F3" : "#FFFFFF"}
            ios_backgroundColor="#F3F3F3"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
      </View>
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  deleteButton: {
    backgroundColor: '#73000A',
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  accentBoxSmall: {
    backgroundColor: '#73000A',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 22.5,
    color: '#FFFFFF',
    fontFamily: 'Abel_400Regular',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    backgroundColor: '#FF5C5C',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Loading Wheel
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
  },
});
