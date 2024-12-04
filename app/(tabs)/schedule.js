import { View, Text, StyleSheet, Pressable, TouchableOpacity, FlatList } from "react-native";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { FIRESTORE_DB } from "../../FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";


import Class from "../../components/Class";
import { getAuth } from "firebase/auth";

export default function Schedule() {
  const router = useRouter();

  const auth = getAuth();
  const user = auth.currentUser;

  const db = FIRESTORE_DB;
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const getData = async() => {
      if(!user) {
        console.log("no user found");
        return;
      }
      const docRef = doc(db, "schedules", user.uid);
      const docSnap = await getDoc(docRef);

      if(docSnap.exists()) {
        setCourses(docSnap.data().courses);
      } else {
        console.log("no document found")
      }
    }
    
    getData();
  }, [user]);
  //

  const renderCourse = (course) => {
    return (
      <Class 
        code={course.item.code}
        section={course.item.section}
        name={course.item.name}
        instructor={course.item.instructor}
        meeting={course.item.meeting}
      />
    )
  }

  return (
    <>
        {user ? 
          <>
            <View style={styles.courses}>
              <FlatList 
                data={courses}
                renderItem={(courses) => renderCourse(courses)}
                contentContainerStyle={{ gap: 20 }}
              />
            </View> 
              <TouchableOpacity
                onPress={() => {
                  router.push("../addClassForm");
                }}
                style={styles.addButton}
              >
                <Text style={styles.addText}>Add a Class</Text>
                <FontAwesome5 style={styles.addIcon} name="plus" size={20} color="black" />
              </TouchableOpacity>
            </>
          :
            <Text style={styles.noUser}>Tap the Profile icon in the top right corner to login and view/edit your schedule!</Text>         
        }
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
  },
  noUser: {
    fontSize: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center"
  }
});
