import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { FIRESTORE_DB } from "../../FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "expo-router";
import getItemLayout from "react-native-section-list-get-item-layout";

export default function Directory() {
  const router = useRouter();

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = await getDocs(
          collection(FIRESTORE_DB, "staff-directory")
        );
        const db_data = query.docs.map((doc) => doc.data());
        setData(db_data);
      } catch (err) {
        setError(err);
        alert("Error fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#73000A" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error.message}</Text>
      </View>
    );
  }

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const sections = alphabet.map((letter) => ({
    title: letter,
    data: data.filter((item) => item.Name.startsWith(letter)),
  }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {console.log(data)}
        {data.map((item) => (
          <TouchableOpacity
            key={item.Name}
            style={styles.staffBox}
            onPress={() =>
              router.push({
                pathname: "professorInfo",
                params: { item: JSON.stringify(item) },
              })
            }
          >
            <Text style={styles.staffText}>{item.Name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/* <div>, but for R
import React from 'react';
import { View, Text } from 'react-native';

const App = () => {
  return (
    <View style={{ padding: 20, backgroundColor: 'lightgray' }}>
      <Text>Hello, this is a box!</Text>
    </View>
  );
};

export default App;
*/

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  staffBox: {
    padding: 20,
    margin: 10,
    backgroundColor: "#73000A",
    borderBlockColor: "#000",
    borderWidth: 4,
  },
  staffText: {
    color: "#fff",
    fontSize: 30,
  },
});
