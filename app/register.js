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

import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import { FIREBASE_API_KEY } from "@env";

const Register = () => {
  // Manage Email and Password State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
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
      color: "#FFF",
      fontSize: 25,
      textAlign: "center",
    },
    registerButtonText: {
      color: colors.primary,
      fontSize: 17,
      textAlign: "center",
      marginTop: 10,
    },
    registerButtonPosition: {
      marginTop: "40%",
    },
  });

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
      router.push("/");
    } catch (error) {
      alert("Registration Failed!");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.container}>
        <Image
          style={styles.image}
          source={require("../assets/images/cockys-way.png")}
        />
        <View style={styles.form}>
          <Text style={styles.title}>Register</Text>

          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="Type Your Email"
            placeholderTextColor={colors.text}
            value={email}
            autoCapitalize="none"
            onChangeText={(text) => setEmail(text)}
          />
          <Text style={styles.label}>Password:</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="Type Your Password"
            placeholderTextColor={colors.text}
            autoCapitalize="none"
            secureTextEntry={true}
            onChangeText={(text) => setPassword(text)}
          />

          <Text style={styles.label}>Confirm Password:</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="Confirm Your Password"
            placeholderTextColor={colors.text}
            autoCapitalize="none"
            secureTextEntry={true}
            onChangeText={(text) => setPasswordConfirmation(text)}
          />

          {loading ? (
            <View style={{ marginTop: 20 }}>
              <ActivityIndicator size="large" color="#73000A" />
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.button}
                title="Register"
                onPress={register}
                testID={"register-button"}
              >
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={[styles.registerButton, styles.registerButtonPosition]}
        title="Login"
        onPress={() => {
          router.push("/login");
        }}
      >
        <Text style={styles.registerButtonText}>
          Already have an account? Login!
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Register;
