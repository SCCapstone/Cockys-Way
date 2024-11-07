import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import fetchInfo from "../hook/fetchInfo";

export default function Directory() {
  const { data, isLoading, error } = fetchInfo("directory");

  // Display loading spinner while fetching data
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Display error message if fetch fails
  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Directory</Text>
      {console.log(data[0])}
      {data.map((course, index) => (
        <Text key={course.crn}>{course.crn}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
