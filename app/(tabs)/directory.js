import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { FIRESTORE_DB } from "../../FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "expo-router";
import getItemLayout from "react-native-section-list-get-item-layout";

export default function Directory() {
  // Used for navigation
  const router = useRouter();

  // Used for fetching data from Firestore DB
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Used for search feature
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // Fetch data from Firestore DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = await getDocs(
          collection(FIRESTORE_DB, "staff-directory")
        );
        const db_data = query.docs.map((doc) => doc.data());

        // Placeholder data to prevent quota overage
        /*const db_data = [
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
          {
            "Faculty/Staff": "Faculty",
            Name: "Anderson, Brandi, LICSW, SSW, CFSW, RYT",
            Title:
              "Director of the I. DeQuincey Newman Institute and Director of Innovative ACCESS (Access, Culture, Community Engagement, and Student Success)",
            "Secondary Title": "",
            Phone: "777-2064",
            Email: "bbrisker@email.sc.edu",
            Keywords: "",
            Department: "",
            College: "College of Social Work",
          },
          {
            "Faculty/Staff": "Faculty",
            Name: "Bell, Nathaniel",
            Title: "Director of Research and Evaluation",
            "Secondary Title": "",
            Phone: "803-576-6781",
            Email: "nateb@mailbox.sc.edu",
            Keywords: "",
            Department: "IFS/IHPR Institute for Families in Society",
            College: "College of Social Work",
          },
          {
            "Faculty/Staff": "Faculty",
            Name: "Bosio-McArdle, Jennifer , MSW",
            Title: "Interim Undergraduate Program Director/Lecturer",
            "Secondary Title": "",
            Phone: "803-777-0383",
            Email: "bosio@mailbox.sc.edu",
            Keywords: "",
            Department: "",
            College: "College of Social Work",
          },
          {
            "Faculty/Staff": "Faculty",
            Name: "Browne, Teri, Ph.D., MSW",
            Title: "Dean",
            "Secondary Title": "Professor",
            Phone: "803-777-6258",
            Email: "brownetm@mailbox.sc.edu",
            Keywords:
              "professor, academic, teri, browne, associate, dean, faculty, research",
            Department: "",
            College: "College of Social Work",
          },
          {
            "Faculty/Staff": "Staff",
            Name: "Carter-Moore, Felissa",
            Title: "Assistant Dean for Finance and Administration",
            "Secondary Title": "",
            Phone: "803-777-3349",
            Email: "fcarter@mailbox.sc.edu",
            Keywords: "administrative, dean, finance, administration",
            Department: "",
            College: "College of Social Work",
          },
          {
            "Faculty/Staff": "Staff",
            Name: "Cato, Camea, M.Ed.",
            Title: "Graduate Academic Advisor",
            "Secondary Title": "",
            Phone: "803-777-6492",
            Email: "catocam@mailbox.sc.edu",
            Keywords: "",
            Department: "",
            College: "College of Social Work",
          },
        ];*/
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

  // Filter data based on value in search bar. If search bar is empty, show all data
  useEffect(() => {
    if (search === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredData(filtered);
    }

    const filtered = data.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredData(filtered);
  }, [search, data]);

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

  // Format name to be First Last (and cuts off titles, middle initials, etc.)
  const formatName = (name) => {
    const parts = name.split(/[\s,]+/);
    if (parts.length >= 2) {
      return `${parts[1]} ${parts[0]}`;
    } else {
      return name;
    }
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const sections = alphabet.map((letter) => ({
    title: letter,
    data: data.filter((item) => item.name.startsWith(letter)),
  }));

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        placeholder="Search by Name"
        value={search}
        onChangeText={(text) => setSearch(text)}
        style={styles.searchBar}
      />
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {filteredData.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={styles.staffBox}
            onPress={() =>
              router.push({
                pathname: "professorInfo",
                params: { item: JSON.stringify(item) },
              })
            }
          >
            <Text style={styles.staffText}>{formatName(item.name)}</Text>
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
  searchBar: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    margin: 10,
    width: "90%",
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
