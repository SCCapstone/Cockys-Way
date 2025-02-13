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


// loading wheel already implemented -CRB
const ForgotPassword = () => {
  // Manage Email and Password State
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;

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
    <SafeAreaView>
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

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    justifyContent: "center",
  },
  inputBox: {
    padding: 12,
    borderWidth: 2,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#73000A",
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
    color: "#73000A",
    fontWeight: "bold",
    maxWidth: "80%",
    paddingTop: 15,
    paddingBottom: 5,
  },
  label: {
    color: "#73000A",
    fontSize: 18,
    marginBottom: 3,
  },
  button: {
    backgroundColor: "#73000A",
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
