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
import FontAwesome from "@expo/vector-icons/FontAwesome";
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
        /*const query = await getDocs(
          collection(FIRESTORE_DB, "staff-directory")
        );
        const db_data = query.docs.map((doc) => doc.data());*/
        const db_data = [
          {
            College: "School of Public Health",
            Department: "Health Promotion, Education, and Behavior,",
            Email: "zwemer@mailbox.sc.edu",
            "Faculty/Staff": "Staff",
            Keywords: "Health Promotion, Education, and Behavior, HPEB",
            Name: "Zwemer, Joni",
            Phone: "803-777-8615",
            "Secondary Title": "",
            Tags: "Health Promotion Education and Behavior,",
            Title: "Administrative Coordinator",
          },
          {
            College: "School of Public Health",
            Department: "Health Promotion, Education, and Behavior,",
            Email: "rpmalone@email.sc.edu",
            "Faculty/Staff": "Faculty",
            Keywords: "Health Promotion, Education, and Behavior, HPEB",
            Name: "Malone, Ryan",
            Phone: "803-777-4253",
            "Secondary Title": "",
            Tags: "Health Promotion Education and Behavior,",
            Title: "Associate Professor",
          },
        ];
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
            <FontAwesome name="chevron-right" size={30} color="#fff" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    // alignItems: "center",
  },
  staffBox: {
    padding: 20,
    margin: 10,
    backgroundColor: "#73000A",
    borderBlockColor: "#000",
    borderWidth: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  staffText: {
    color: "#fff",
    fontSize: 30,
  },
});
