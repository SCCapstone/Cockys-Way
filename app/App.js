import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Hello, Cruel World!</Text>
      <Text>Ryan Was here!</Text>
      <Text>Isaac was here!</Text>
      <Text>Jacob was here!</Text>
      <Text style={styles.johnny}>Johnny was here!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  johnny: {
    fontStyle: 'italic',
  },
});
