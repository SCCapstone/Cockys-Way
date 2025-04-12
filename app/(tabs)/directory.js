import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { FIRESTORE_DB } from "../../FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { ThemeContext } from "../../ThemeContext";
import { useContext } from "react";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const ITEM_HEIGHT = 100;

// Format name to be First Last (and cuts off titles, middle initials, etc.)
export const formatName = (name) => {
  if (!name || typeof name !== "string") return "";

  const parts = name.split(/[\s,]+/);
  if (parts.length >= 2) {
    return `${parts[1]} ${parts[0]}`;
  } else {
    return name;
  }
};

export default function Directory() {
  // Used for navigation
  const router = useRouter();

  // Used for fetching data from Firestore DB
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Used for search feature
  const { search: searchParam } = useLocalSearchParams();
  const [search, setSearch] = useState(searchParam || "");
  const [filteredData, setFilteredData] = useState([]);
  const flatListRef = useRef(null);

  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      justifyContent: "flex-start",
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    mainContent: {
      flexDirection: "row",
      flex: 1,
    },
    scrollViewContainer: {
      flexGrow: 1,
      paddingTop: 10,
    },
    scrollView: {
      flex: 1,
    },
    searchBar: {
      height: 40,
      borderColor: colors.border,
      backgroundColor: colors.border,
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      margin: 10,
      width: "95%",
      color: colors.garnetWhite,
    },
    staffBox: {
      padding: 20,
      margin: 10,
      backgroundColor: colors.primary,
      borderColor: colors.border,
      borderWidth: 4,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    staffText: {
      color: colors.alwaysWhite,
      fontSize: 30,
      fontFamily: "Abel",
    },
    letterContainer: {
      width: 30,
      marginTop: 20,
      flexShrink: 0,
      maxHeight: "100%",
    },
    letter: {
      paddingTop: 5,
    },
    letterFont: {
      fontSize: 16,
      color: colors.garnetWhite,
    },
    letterOverlay: {
      position: "absolute",
      top: 20,
      right: 0,
      width: 30,
      height: "95%",
      justifyContent: "center",
      alignItems: "center",
    },
  });

  /* Scroll to the first item that starts with the pressed
   * letter in the FlatList using alphabet bar
   */
  const handleLetterPress = (letter) => {
    const index = filteredData.findIndex((item) =>
      item.name.startsWith(letter)
    );
    if (index !== -1) {
      let pos = 0;
      if (index > 5) {
        pos = -1;
      }
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: pos,
      });
    }
  };

  // Fetch data from Firestore DB
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

  useEffect(() => {
    if (searchParam) {
      setSearch(searchParam);
    }
  }, [searchParam]);

  // Filter data based on value in search bar. If search bar is empty, show all data
  useEffect(() => {
    if (search === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter((item) =>
        formatName(item.name).toLowerCase().includes(search.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [search, data]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
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

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        placeholder="Search by Name"
        placeholderTextColor={colors.text}
        value={search}
        onChangeText={(text) => setSearch(text)}
        style={styles.searchBar}
      />
      <View style={styles.mainContent}>
        <View style={{ flex: 1, marginRight: 30 }}>
          <FlatList
            data={filteredData}
            renderItem={({ item }) => (
              <TouchableOpacity
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
            )}
            keyExtractor={(item) => item.name}
            ref={flatListRef}
            getItemLayout={(data, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
          />
        </View>
        <View style={styles.letterOverlay}>
          <FlatList
            data={alphabet}
            keyExtractor={(item) => item}
            initialNumToRender={26}
            maxToRenderPerBatch={26}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleLetterPress(item)}
                style={styles.letter}
              >
                <Text style={styles.letterFont}>{item}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ alignItems: "center" }}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
