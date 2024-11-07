import { View, Text, StyleSheet } from "react-native";

export default function Schedule() {
  return (
    <View style={styles.container}>
      <Text>Schedule Screen</Text>
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
