// Login Page Imports
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  TextInput,
  Button,
  StyleSheet,
} from "react-native";

// Firebase Imports
import { FIREBASE_AUTH } from "../FirebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

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

  const register = async () => {
    setLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Eventually will do something else
      alert("Registered!");
    } catch (error) {
      alert("Registration Failed!");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.title}>Login:</Text>

        <TextInput
          style={styles.inputBox}
          placeholder="Email"
          value={email}
          autoCapitalize="none"
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          style={styles.inputBox}
          placeholder="Password"
          autoCapitalize="none"
          secureTextEntry={true}
          onChangeText={(text) => setPassword(text)}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            <Button style={styles.button} title="Login" onPress={signIn} />
            <Button style={styles.button} title="Register" onPress={register} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flex: 1,
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
  },
});
