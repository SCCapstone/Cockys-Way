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
  TextInput,
} from "react-native";
import { useFonts, Abel_400Regular } from "@expo-google-fonts/abel";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import { useRouter } from "expo-router";

export const deleteUser = async ({
  user,
  firestore,
  setModalVisible,
  password,
  setPasswordError,
  router,
}) => {
  if (!user) {
    Alert.alert("Sign In Required", "Please sign in to delete your account.");
    return;
  }

  try {
    // Force reauthentication
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);

    // Delete user data from Firestore before deleting the account
    await deleteUserData(user, firestore, setModalVisible, false);

    await AsyncStorage.removeItem("routeHistory");

    // Delete Auth account
    await user.delete();

    Alert.alert(
      "Account Deleted",
      "Your account and data have been successfully deleted."
    );
    if (setModalVisible) {
      setModalVisible(false);
    }
    if (router) {
      router.replace("/");
    }
  } catch (error) {
    console.error("Error during account deletion:", error);

    if (error.code === "auth/wrong-password") {
      if (setPasswordError) {
        setPasswordError("Incorrect password, please try again.");
      }
    } else {
      if (setPasswordError) {
        setPasswordError("Something went wrong. Please try again.");
      }
      Alert.alert("Error", error.message || "Unexpected error occurred.");
    }
  }
};

const deleteUserData = async (
  user,
  firestore,
  setModalVisible,
  showAlert = true
) => {
  if (!user) {
    Alert.alert("Sign In Required", "Please sign in to delete your data.");
    return;
  }

  try {
    const simpleCollections = ["settings", "custom-pins", "favorites"];

    for (const collectionName of simpleCollections) {
      const docRef = doc(firestore, collectionName, user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await deleteDoc(docRef);
      }
    }

    const coursesRef = collection(firestore, "schedules", user.uid, "courses");
    const coursesSnap = await getDocs(coursesRef);

    for (const courseDoc of coursesSnap.docs) {
      await deleteDoc(courseDoc.ref);
    }

    await deleteDoc(doc(firestore, "schedules", user.uid));

    await AsyncStorage.removeItem("routeHistory");

    if (showAlert) {
      Alert.alert("Data Deleted", "Your data has been successfully deleted.");
    }
    setModalVisible(false);
  } catch (error) {
    console.error("Error deleting user data:", error);
    Alert.alert("Error", "There was an error deleting your data.");
  }
};

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] =
    useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
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
    passwordInput: {
      width: "100%",
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 5,
      padding: 10,
      marginBottom: 15,
      color: colors.text,
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
    errorText: {
      color: "red",
      marginTop: 5,
      marginBottom: 10,
      fontSize: 14,
      textAlign: "center",
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
                onPress={() => deleteUserData(user, firestore, setModalVisible)}
              >
                <Text style={styles.modalButtonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteAccountModalVisible}
        onRequestClose={() => setDeleteAccountModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalText}>
              Are you sure you want to permanently delete your account and all
              related data?
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalButton}
                onPress={() => setDeleteAccountModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={() => {
                  setDeleteAccountModalVisible(false);
                  setPasswordModalVisible(true);
                }}
              >
                <Text style={styles.modalButtonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={passwordModalVisible}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Re-enter Password</Text>
            <Text style={styles.modalText}>
              Please enter your password to confirm account deletion.
            </Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              color={colors.garnetWhite}
              placeholderTextColor={colors.garnetWhite}
              onChangeText={setPassword}
            />
            {passwordError !== "" && (
              <Text style={styles.errorText}>{passwordError}</Text>
            )}
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalButton}
                onPress={() => {
                  setPasswordError("");
                  setPasswordModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={() => {
                  deleteUser({
                    user,
                    firestore,
                    setModalVisible: setPasswordModalVisible,
                    password,
                    setPasswordError,
                    router,
                  });
                }}
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
      <View style={styles.settingItem}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setDeleteAccountModalVisible(true)}
        >
          <Text style={styles.deleteButtonText}>Delete my account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
