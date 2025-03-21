// Login Page Imports
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";

// Firebase Imports
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { router } from "expo-router";
import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import { color } from "react-native-elements/dist/helpers";

const ForgotPassword = () => {
  // Manage Email and Password State
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const styles = StyleSheet.create({
    background: {
      backgroundColor: colors.background,
      flex: 1,
    },
    container: {
      marginHorizontal: 20,
      justifyContent: "center",
    },
    inputBox: {
      padding: 12,
      borderWidth: 2,
      marginBottom: 10,
      borderColor: colors.border,
      color: colors.text,
      backgroundColor: colors.border,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 10,
      textAlign: "center",
      color: colors.primary,
    },
    image: {
      width: 150,
      height: 150,
      alignSelf: "center",
      marginBottom: 20,
      marginTop: "20%",
    },
    notice: {
      fontSize: 18,
      marginBottom: 20,
      color: colors.primary,
      fontWeight: "bold",
      maxWidth: "80%",
      paddingTop: 15,
      paddingBottom: 5,
    },
    label: {
      color: colors.primary,
      fontSize: 18,
      marginBottom: 3,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 10,
      borderRadius: 100,
      marginTop: 20,
    },
    buttonText: {
      color: "#fff",
      fontSize: 25,
      textAlign: "center",
    },
  });

  const sendEmail = () => {
    setLoading(true);
    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("Password Reset Email Sent!");
        router.push("/");
      })
      .catch((error) => {
        alert("Failed to Send Password Reset Email!");
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.container}>
        <Image
          style={styles.image}
          source={require("../assets/images/cockys-way.png")}
        />
        <View style={styles.form}>
          <Text style={styles.title}>Forgot Password</Text>

          <Text style={styles.notice}>
            Provide the link associated with your account and we'll send a link
            to reset your password.
          </Text>

          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="Type Your Email"
            placeholderTextColor={colors.text}
            value={email}
            autoCapitalize="none"
            onChangeText={(text) => setEmail(text)}
          />

          {loading ? (
            <View style={{ marginTop: 20 }}>
              <ActivityIndicator size="large" color="#73000A" />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.button}
              title="Forgot Password"
              onPress={sendEmail}
            >
              <Text style={styles.buttonText}>Send Email</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ForgotPassword;
