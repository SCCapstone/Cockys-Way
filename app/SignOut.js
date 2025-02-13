// SignOut Page Imports
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";

// Firebase Imports
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { signOut } from "firebase/auth";
import { router } from "expo-router";

// loading wheel already implemented -CRB
export default function SignOut() {
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      console.log("User Signed Out");
      router.push("/");
    } catch (error) {
      alert("Sign Out Failed!");
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
          <Text style={styles.title}>Sign Out</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#73000A" />
          ) : (
            <TouchableOpacity
              style={styles.button}
              title="Sign Out"
              onPress={handleSignOut}
            >
              <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: "center",
    color: "#73000A",
    fontWeight: "bold",
  },
  image: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 20,
    marginTop: "20%",
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
