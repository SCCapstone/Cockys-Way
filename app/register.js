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
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { router } from "expo-router";

import { FIREBASE_API_KEY } from "@env";

const Login = () => {
  // Manage Email and Password State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  const register = async () => {
    if (password !== passwordConfirmation) {
      alert("Passwords do not match!");
      return;
    } else if (password.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }
    setLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      alert("Succesfully Registered!");
    } catch (error) {
      alert("Registration Failed!");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Image
          style={styles.image}
          source={require("../assets/images/cockys-way.png")}
        />
        {/* Show loading wheel while registering*/}
        {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#73000A" />
              <Text style={styles.loadingText}>Registering...</Text>
            </View>
          ) : (
        <View style={styles.form}>
          <Text style={styles.title}>Register</Text>

          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="Type Your Email"
            value={email}
            autoCapitalize="none"
            onChangeText={(text) => setEmail(text)}
            
            editable={!loading} // makes it so user cant input when it's loading
          />
          <Text style={styles.label}>Password:</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="Type Your Password"
            autoCapitalize="none"
            secureTextEntry={true}
            onChangeText={(text) => setPassword(text)}
            
            editable={!loading} // makes it so user cant input when it's loading
          />

          <Text style={styles.label}>Confirm Password:</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="Confirm Your Password"
            autoCapitalize="none"
            secureTextEntry={true}
            onChangeText={(text) => setPasswordConfirmation(text)}
            
            editable={!loading} // makes it so user cant input when it's loading
          />
   
              <TouchableOpacity
                style={[styles.button, loading && styles.disabledButton]}
                title="Register"
                onPress={register}

                disabled={loading} // Disable button while loading
              >
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>

        </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.registerButton, styles.registerButtonPosition]}
        title="Register"
        onPress={() => {
          if (!loading) {
            router.push("/login");
          }
        }}
        disabled={loading} // disable while loading
      >
        <Text style={styles.registerButtonText}>
          Already have an account? Login!
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Login;

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
// Gray out a button while its disabled
  disabledButton: {
    backgroundColor: "#AAA",
  },
  buttonText: {
    color: "#fff",
    fontSize: 25,
    textAlign: "center",
  },
  registerButtonText: {
    color: "#73000A",
    fontSize: 17,
    textAlign: "center",
    marginTop: 10,
  },
  registerButtonPosition: {
    marginTop: "40%",
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#73000A",
  },
});
