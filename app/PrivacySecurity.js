import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { useFonts, Abel_400Regular } from "@expo-google-fonts/abel";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";

export default function PrivacySecurityScreen() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const user = getAuth().currentUser;
  const firestore = getFirestore();
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: colors.background },
    header: {
      fontSize: 30,
      fontWeight: "bold",
      marginBottom: 20,
      color: colors.primary,
      fontFamily: "Abel_400Regular",
    },
    settingItem: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    deleteButton: {
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 5,
      flex: 1,
    },
    deleteButtonText: {
      fontSize: 20,
      color: colors.alwaysWhite,
      textAlign: "center",
    },
    accentBoxSmall: {
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 5,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    settingText: {
      fontSize: 22.5,
      color: colors.alwaysWhite,
      fontFamily: "Abel_400Regular",
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
      width: "80%",
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 10,
      color: colors.text,
    },
    modalText: {
      fontSize: 16,
      marginBottom: 20,
      textAlign: "center",
      color: colors.text,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
    modalButton: {
      padding: 10,
      borderRadius: 5,
      backgroundColor: "#AAAAAA",
      width: "45%",
      alignItems: "center",
    },
    modalConfirmButton: {
      backgroundColor: colors.primary,
    },
    modalButtonText: {
      color: colors.alwaysWhite,
      fontWeight: "bold",
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) {
        Alert.alert(
          "Sign In Required",
          "Please sign in to access your privacy and security settings."
        );
        return;
      }
      try {
        const userDoc = doc(firestore, "settings", user.uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setIsEnabled(userData.settings?.locationEnabled || false);
        }
      } catch (error) {
        console.error("Error fetching user settings:", error);
      }
    };
    fetchSettings();
  }, [user]);

  const updatePrivacySecuritySettings = async (newSettings) => {
    if (!user) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to update your settings."
      );
      return;
    }
    try {
      await setDoc(
        doc(firestore, "settings", user.uid),
        { settings: newSettings },
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  const deleteUserData = async () => {
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to delete your data.");
      return;
    }
    try {
      await deleteDoc(doc(firestore, "settings", user.uid));
      Alert.alert("Data Deleted", "Your data has been successfully deleted.");
      setModalVisible(false);
    } catch (error) {
      console.error("Error deleting user data:", error);
      Alert.alert("Error", "There was an error deleting your data.");
    }
  };

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
                style={[styles.modalButton, styles.modalConfirmButton]}
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
            onValueChange={() => {
              const newState = !isEnabled;
              setIsEnabled(newState);
              updatePrivacySecuritySettings({ locationEnabled: newState });
            }}
            value={isEnabled}
          />
        </View>
      </View>
    </ScrollView>
  );
}
