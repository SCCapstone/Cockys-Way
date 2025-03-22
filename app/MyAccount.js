import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useFonts, Abel_400Regular } from "@expo-google-fonts/abel";
import * as SplashScreen from "expo-splash-screen";
import {
  getAuth,
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";

SplashScreen.preventAutoHideAsync();

export default function MyAccountScreen() {
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordForAuth, setPasswordForAuth] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const firestore = getFirestore();
  const auth = getAuth();
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
    infoBox: {
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 5,
      marginBottom: 10,
    },
    infoLabel: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.alwaysWhite,
      fontFamily: "Abel_400Regular",
    },
    infoValue: {
      fontSize: 18,
      color: colors.alwaysWhite,
      fontFamily: "Abel_400Regular",
    },
    inputField: {
      backgroundColor: colors.card,
      padding: 10,
      borderRadius: 5,
      fontSize: 18,
      color: colors.text,
      marginTop: 10,
      borderWidth: 1,
      borderColor: colors.text,
    },
    editButton: {
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 5,
      marginTop: 10,
      alignItems: "center",
    },
    changePasswordButton: {
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 5,
      marginTop: 10,
      alignItems: "center",
    },
    buttonText: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.alwaysWhite,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalBox: {
      width: "80%",
      padding: 20,
      backgroundColor: colors.card,
      borderRadius: 10,
      alignItems: "center",
    },
    modalInput: {
      width: "100%",
      borderWidth: 1,
      borderColor: colors.text,
      padding: 10,
      borderRadius: 5,
      marginBottom: 10,
      textAlign: "center",
      color: colors.text,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginTop: 10,
    },
    modalButton: {
      marginTop: 10,
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 5,
      alignItems: "center",
    },
  });

  const handleAuthenticate = async () => {
    setIsLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        passwordForAuth
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      setIsEditing(true);
      setIsAuthenticating(false);
      Alert.alert(
        "Success",
        "Authentication successful! You can now update your account."
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Authentication failed. Please ensure your password is correct."
      );
    }
    setIsLoading(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewEmail("");
    setNewPassword("");
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const auth = getAuth();
      if (!auth.currentUser) {
        Alert.alert("Error", "No authenticated user found.");
        return;
      }

      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        passwordForAuth
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      if (newEmail.trim() !== "") {
        updateEmail(auth.currentUser, newEmail)
          .then(() => {
            Alert.alert("Success", "Your email has been updated!");
          })
          .catch((error) => {
            console.log(error);
          });

        setNewEmail("");
        setIsLoading(false);
        return;
      }

      if (newPassword.trim() !== "") {
        await updatePassword(auth.currentUser, newPassword);
        Alert.alert("Success", "Your password has been updated!");
      }

      setNewEmail("");
      setNewPassword("");
      setPasswordForAuth("");
      setIsEditing(false);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert(
          "Sign In Required",
          "Please sign in to view your account details."
        );
        return;
      }
      const userData = {
        email: user.email || "N/A",
        phoneNumber: user.phoneNumber || "N/A",
        uid: user.uid,
      };
      setUserInfo(userData);
    };
    fetchUserInfo();
  }, [auth]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>My Account</Text>
      {userInfo &&
        Object.entries(userInfo).map(([key, value]) => (
          <View style={styles.infoBox} key={key}>
            <Text style={styles.infoLabel}>{key.replace(/_/g, " ")}:</Text>
            <Text style={styles.infoValue}>{value.toString()}</Text>
          </View>
        ))}
      {!isAuthenticating && !isEditing && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsAuthenticating(true)}
        >
          <Text style={styles.buttonText}>Edit Account Information</Text>
        </TouchableOpacity>
      )}
      <Modal visible={isAuthenticating} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter current password"
              secureTextEntry
              value={passwordForAuth}
              onChangeText={setPasswordForAuth}
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleAuthenticate}
            >
              <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
                Authenticate
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={isEditing} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <TextInput
              style={styles.modalInput}
              placeholder="New Email (Leave blank if unchanged)"
              value={newEmail}
              onChangeText={setNewEmail}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="New Password (Leave blank if unchanged)"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <TouchableOpacity
                style={[styles.modalButton, { flex: 1, marginRight: 5 }]}
                onPress={handleCancel}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { flex: 1, marginLeft: 5 }]}
                onPress={handleSaveChanges}
              >
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {isLoading && <ActivityIndicator size="large" color="#73000A" />}
    </ScrollView>
  );
}
