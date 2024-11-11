import { View, Text, StyleSheet } from "react-native";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function Schedule() {
  return (
    <View >
      {/* <Text style={styles.header}>Schedule</Text> */}
      <View style={styles.courses}>
        {/* example course box layout */}
        <View style={styles.course}>
          <View style={styles.courseText}>
            <Text style={styles.courseHeader}>CSCE 355</Text>
            <Text style={styles.courseInfo}>Foundations of Computation</Text>
            <Text style={styles.courseInfo}>James O'Reilly</Text>
            <Text style={styles.courseInfo}>TuTh, 11:40am - 12:55pm</Text>
          </View>
          <View style={styles.courseIcons}>
            {/* <FontAwesome5 name="bell-slash" size={24} color="black" /> */}
            <FontAwesome5 name="bell" size={24} color="#FFFFFF" />
            <FontAwesome5 name="trash-alt" size={24} color="#FFFFFF" />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    fontSize: 30
  },

  courses: {
    // margin: 20,
    paddingHorizontal: 20,
    width: "100%"
  },

  course: {
    width: "100%",
    backgroundColor: "#73000A",
    borderWidth: 3,
    borderColor: "#000000",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 10,
  },

  courseText: {
    // flexWrap: "wrap",
    width: "90%",
    // flex: 1,
    borderWidth: 5,
    borderColor: "green",
    flex: 1,
    flexShrink: 0
  },

  courseInfo: {
    color: "#FFFFFF",
    fontSize: 20,
    flexShrink: 0
  },

  courseHeader: {
    color: "#FFFFFF",
    fontSize: 30
  },

  courseIcons: {
    flexDirection: "row",
    gap: 10,
    borderWidth: 5,
    borderColor: "green"
  }
});
