import { View, Text, StyleSheet, Pressable, TouchableOpacity } from "react-native";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRouter } from "expo-router";

import Class from "../../components/Class";

export default function Schedule() {
  const router = useRouter();

  return (
    <>
      <View>
        <View style={styles.courses}>
          <Class 
            subject={"CSCE"}
            number={"355"}
            section={"001"}
            name={"Foundations of Computation"}
            instructor={"James O'Reilly"}
            meeting={"TuTh, 11:40am - 12:55pm"}
          />
          <Class 
            subject={"CSCE"}
            number={"567"}
            section={"001"}
            name={"Visualization Tools"}
            instructor={"Brian Hipp"}
            meeting={"MW, 2:30pm - 3:35pm"}
          />
          <Class 
            subject={"MATH"}
            number={"344"}
            section={"001"}
            name={"Applied Linear Algebra"}
            instructor={"Changhui Tan"}
            meeting={"TuTh, 2:50pm - 4:05pm"}
            fromSearch
          />
        </View>
      </View>
      <View>
      <TouchableOpacity
        onPress={() => {
          router.push("../addClassForm");
        }}
        style={styles.addButton}
      >
        <Text style={styles.addText}>Add a Class</Text>
        <FontAwesome5 style={styles.addIcon} name="plus" size={20} color="black" />
      </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  courses: {
    paddingHorizontal: 20,
    width: "100%",
    gap: 15
  },

  addButton: {
    backgroundColor: "#AAAAAA",
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
    gap: 5,
    borderRadius: 10, 
    padding: 10,
    alignItems: "center",
    zIndex: 999
  },

  addText: {
    fontSize: 20
  },

  addIcon: {
    // marginLeft: 10
  }
});
