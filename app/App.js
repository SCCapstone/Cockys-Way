import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello, Cruel World!</Text>
      <Text>Ryan Was here! And I'm solving a merge conflict! and johnny</Text>
      <Text>Isaac was here! Hi Isaac, Ryan was here! resolving conflict</Text>
      <Text>Jacob was here! banana apples</Text>
      <Text style={styles.johnny}>
        Johnny was here! as was Jacob hahaha lmaorofl i love pizza
      </Text>
      <Text style={styles.johnny}>
        This is Johnny's code merging to main from my branch
      </Text>
      <Text>This was creates on Ryan's branch to merge into main</Text>
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
  title: {
    fontWeight: "bold",
    fontSize: "25px",
    marginBottom: 20,
  },
  johnny: {
    fontStyle: "italic",
  },
});
