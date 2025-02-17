import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  FlatList,
  Modal,
  Image, ActivityIndicator,
  ActivityIndicator,
} from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { FIRESTORE_DB } from "../../FirebaseConfig";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";

import Class from "../../components/Class";
import { getAuth } from "firebase/auth";

export default function Schedule() {
  const router = useRouter();

  const auth = getAuth();
  const user = auth.currentUser;

  const db = FIRESTORE_DB;
  const [courses, setCourses] = useState([]);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [loading, setLoading] = useState(true); // Chloe added loading

  useEffect(() => {
    if (!user) {
      console.log("no user found");
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, "schedules", user.uid, "courses"),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(list);
        setLoading(false);
      },
      (error) => {
        console.log("Error fetching real-time updates: ", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleDeletePress = (course) => {
    setCourseToDelete(course);
    setModalVisibility(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    console.log(courseToDelete);

    try {
      await deleteDoc(
        doc(db, "schedules", user.uid, "courses", courseToDelete.id)
      );
      console.log("Deleted course:", courseToDelete.id);
    } catch (error) {
      console.log("Error deleting course:", error);
    }

    setIsModalVisible(false);
    setCourseToDelete(null);
  };

  const renderCourse = (course) => {
    // console.log('in render course');
    // console.log(course);
    return (
      <Class
        crn={course.item.id}
        code={course.item.code}
        section={course.item.section}
        name={course.item.name}
        instructor={course.item.instructor}
        meeting={course.item.meeting}
        srcdb={course.item.srcdb}
        onDeletePress={() => handleDeletePress(course.item)}
      />
    )
  }

  // Loading Wheel
    if (loading) {
      return (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#73000A" />
          </View>
      );
    }

  return (
    <>
      {user ? (
        <>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#73000A" />
            </View>
          ) : (
            <View style={styles.courses}>
              <FlatList
                data={courses}
                renderItem={(courses) => renderCourse(courses)}
                contentContainerStyle={{ gap: 20 }}
              />
            </View>
          )}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisibility}
            onRequestClose={() => setModalVisibility(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>
                  Are you sure you want to delete {courseToDelete?.name} from
                  your schedule?
                </Text>
                <View style={styles.modalButtons}>
                  <Pressable
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisibility(false)}
                  >
                    <Text style={styles.cancelText}>No</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={() => {
                      confirmDelete();
                      setModalVisibility(false);
                    }}
                  >
                    <Text style={styles.confirmText}>Yes</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
          <TouchableOpacity
            onPress={() => {
              router.push("../addClassForm");
            }}
            style={styles.addButton}
          >
            <Text style={styles.addText}>Add a Class</Text>
            <FontAwesome5
              style={styles.addIcon}
              name="plus"
              size={20}
              color="black"
            />
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.container}>
          <Image
            style={styles.image}
            source={require("../../assets/images/cockys-way.png")}
          />
          <Text style={styles.noUser}>
            Looks like you're not logged in, tap the Profile icon in the top
            right corner to login and view/edit your schedule!
          </Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  courses: {
    paddingHorizontal: 20,
    paddingTop: 15,
    width: "100%",
    gap: 15,
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
    zIndex: 999,
  },

  addText: {
    fontSize: 20,
  },

  addIcon: {
    // marginLeft: 10
  },
  noUser: {
    fontSize: 30,
    paddingHorizontal: 20,
    // alignItems: "center",
    // justifyContent: "center",
    // flex: 1
  },

  container: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    // paddingBottom: 20
    // borderWidth: 3,
    // borderColor: "#000000"
  },

  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
  },

  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },

  modalText: {
    fontSize: 25,
    marginBottom: 10,
  },

  modalButtons: {
    flexDirection: "row",
    marginTop: 10,
  },

  modalButton: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 5,
    // borderColor: "#000000",
    // borderWidth: 2,
    flex: 1,
  },

  cancelButton: {
    backgroundColor: "#AAAAAA",
  },

  cancelText: {
    color: "#000000",
    textAlign: "center",
    fontSize: 20,
  },

  confirmButton: {
    backgroundColor: "#73000A",
  },

  confirmText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 20,
  },
  // Loading Wheel
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
  },
  // Loading Wheel
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
  },
});
