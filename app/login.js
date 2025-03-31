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
import { signInWithEmailAndPassword } from "firebase/auth";
import { router } from "expo-router";
import { ThemeContext } from "../ThemeContext";
import { useContext } from "react";

const Login = () => {
  // Manage Email and Password State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      backgroundColor: colors.background,
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
      marginBottom: 10,
      textAlign: "center",
      color: colors.primary,
      fontWeight: "bold",
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
      color: colors.alwaysWhite,
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
      marginTop: "50%",
    },
  });

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      const user = response.user;
      console.log("User Logged In:");
      console.log(user);
      router.push("/");
      // Eventually will do something else
    } catch (error) {
      alert("Login Failed!");
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
          <Text style={styles.title}>Login</Text>

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

          {loading ? (
            <ActivityIndicator size="large" color="#73000A" />
          ) : (
            <>
              <TouchableOpacity
                style={styles.button}
                title="Login"
                onPress={signIn}
                testID="login-button"
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
        style={styles.registerButton} // Removed 'styles.registerButtonPosition' ; causes bug where the text is not visible.
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
