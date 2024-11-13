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

const Login = () => {
  // Manage Email and Password State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      alert("Congrats! You were authenticated!");
      // Eventually will do something else
    } catch (error) {
      alert("Login Failed!");
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
        <View style={styles.form}>
          <Text style={styles.title}>Login:</Text>

          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="Type Your Email"
            value={email}
            autoCapitalize="none"
            onChangeText={(text) => setEmail(text)}
          />
          <Text style={styles.label}>Password:</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="Type Your Password"
            autoCapitalize="none"
            secureTextEntry={true}
            onChangeText={(text) => setPassword(text)}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <>
              <TouchableOpacity
                style={styles.button}
                title="Login"
                onPress={signIn}
              >
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                title="Register"
                onPress={() => {
                  router.push("/forgotPassword");
                }}
              >
                <Text style={styles.registerButtonText}>Forgot Password?</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={[styles.registerButton, styles.registerButtonPosition]}
        title="Register"
        onPress={() => {
          router.push("/register");
        }}
      >
        <Text style={styles.registerButtonText}>
          Don't have an account? Register!
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
    marginBottom: 10,
    textAlign: "center",
    color: "#",
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
    marginTop: "50%",
  },
});
