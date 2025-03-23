import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
  ActivityIndicator,
  ToastAndroid,
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
import { Calendar, CalendarList, Agenda } from "react-native-calendars";
import moment from "moment";
import { useContext } from "react";
import { ThemeContext } from "../../ThemeContext";

export default function Schedule() {
  const router = useRouter();

  const auth = getAuth();
  const user = auth.currentUser;

  const db = FIRESTORE_DB;
  const [courses, setCourses] = useState([]);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [calenderVisibility, setCalendarVisibility] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  const [currentDay, setCurrentDay] = useState("");
  const [currentCourses, setCurrentCourses] = useState([]);
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  const styles = StyleSheet.create({
    background: {
      backgroundColor: colors.background,
      flex: 1,
    },
    courses: {
      paddingHorizontal: 20,
      paddingTop: 15,
      width: "100%",
      gap: 15,
    },

    calendarContainer: {
      paddingHorizontal: 20,
      paddingTop: 15,
      width: "100%",
    },

    addButton: {
      backgroundColor: "#AAAAAA",
      position: "absolute",
      bottom: 85,
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
      color: colors.text,
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
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
    },

    modalText: {
      fontSize: 25,
      marginBottom: 10,
      color: colors.text,
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
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    bottomContainer: {
      // paddingHorizontal: 20,
      position: "absolute",
      bottom: 0,
      width: "100%",
      // borderColor: "red",
      // borderWidth: 2,
      paddingHorizontal: 20,
      backgroundColor: "#AAAAAA",
    },

    switchViewButton: {
      // borderColor: "#000000",
      // borderWidth: 3,
      width: "100%",
      backgroundColor: "#73000A",
      borderRadius: 10,
      paddingVertical: 5,
      marginVertical: 10,
      // fontSize: 20,
      // marginHorizontal: 20,
      // paddingHorizontal: 20,
      // paddingHorizontal: 15,
    },

    switchViewText: {
      fontSize: 30,
      textAlign: "center",
      color: "#FFFFFF",
    },
  });

  useEffect(() => {
    if (!user) {
      console.log("no user found");
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
        setIsLoading(false);
      },
      (error) => {
        console.log("Error fetching real-time updates: ", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (courses.length > 0) {
      const parsedDates = parseMeetingTimes(courses);
      setMarkedDates(parsedDates);
    }
  }, [courses]);

  const parseMeetingTimes = (courses) => {
    const daysMap = {
      M: "Monday",
      T: "Tuesday",
      W: "Wednesday",
      Th: "Thursday",
      F: "Friday",
    };
  
    const semesterDates = {
      "202408": { start: "2024-08-08", end: "2024-12-16" },
      "202501": { start: "2025-01-13", end: "2025-05-17" },
    };
  
    let markedDates = {};
  
    courses.forEach((course) => {
      if (!course.meeting || !course.srcdb || !semesterDates[course.srcdb]) return;
  
      let { start, end } = semesterDates[course.srcdb];
      let startDate = moment(start);
      let endDate = moment(end);
  
      // Extracting days properly by ensuring "Th" is captured as its own entity
      let meetingStr = course.meeting.replace(/Th/g, "X"); // Temporarily replace "Th" to avoid confusion with "T"
      let matches = meetingStr.match(/(X|M|T|W|F)/g); // Now match days correctly
      if (matches) {
        matches = matches.map((d) => (d === "X" ? "Th" : d)); // Convert "X" back to "Th"
  
        matches.forEach((dayAbbrev) => {
          let dayFull = daysMap[dayAbbrev];
  
          if (dayFull) {
            let currentDate = startDate.clone();
            while (currentDate.isSameOrBefore(endDate)) {
              if (currentDate.format("dddd") === dayFull) {
                let formattedDate = currentDate.format("YYYY-MM-DD");
                markedDates[formattedDate] = { marked: true };
              }
              currentDate.add(1, "day");
            }
          }
        });
      }
    });
  
    return markedDates;
  };

  const daysMap = {
    M: "Monday",
    T: "Tuesday",
    W: "Wednesday",
    Th: "Thursday",
    F: "Friday",
  };
  
  const semesterDates = {
    "202408": { start: "2024-08-08", end: "2024-12-16" },
    "202501": { start: "2025-01-13", end: "2025-05-17" },
  };
  
  const getCoursesForDay = (selectedDate, courses) => {
    let selectedMoment = moment(selectedDate);
    let selectedWeekday = selectedMoment.format("dddd"); // Get full weekday name
    let relevantCourses = [];
  
    courses.forEach((course) => {
      if (!course.meeting || !course.srcdb || !semesterDates[course.srcdb]) return;
  
      let { start, end } = semesterDates[course.srcdb];
      let startDate = moment(start);
      let endDate = moment(end);
  
      // Ensure the selected date is within the course's semester range
      if (!selectedMoment.isBetween(startDate, endDate, null, "[]")) return;
  
      // Process meeting string to extract days properly
      let meetingStr = course.meeting.replace(/Th/g, "X"); // Temporarily replace "Th" with "X"
      let matches = meetingStr.match(/(X|M|T|W|F)/g);
      if (matches) {
        matches = matches.map((d) => (d === "X" ? "Th" : d)); // Convert "X" back to "Th"
  
        // If the course meets on the selected weekday, add to results
        if (matches.some((dayAbbrev) => daysMap[dayAbbrev] === selectedWeekday)) {
          relevantCourses.push(`${course.code}-${course.section}: ${course.name} at ${course.meeting}`);
        }
      }
    });
  
    return relevantCourses;
  };

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

    ToastAndroid.show(
      `${courseToDelete?.name} has successfully been deleted from your schedule!`,
      ToastAndroid.LONG
    );

    setIsModalVisible(false);
    setCourseToDelete(null);
  };

  const renderCourse = (course) => {
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
    );
  };

  return (
    <>
      {user ? (
        <>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#73000A" />
            </View>
          ) : calenderVisibility ? (
            <View style={[styles.calendarContainer, styles.background]}>
              <Calendar
                markedDates={markedDates}
                onDayPress={(day) => {
                  setCurrentDay(day.dateString);
                  setCurrentCourses(getCoursesForDay(day.dateString, courses));
                }}
                onDayLongPress={(day) => {
                  console.log('hey long press');
                }}
              />
              <View style={styles.toggleSection}>
                <Text>
                  {currentDay
                    ? currentDay
                    : "Select a date to view what's planned!"}
                </Text>
                <Text>{currentCourses}</Text>
              </View>
            </View>
          ) : (
            <View style={[styles.courses, styles.background]}>
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
          {!calenderVisibility && (
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
          )}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              onPress={() => {
                setCalendarVisibility(!calenderVisibility);
                setCurrentDay("");
                setCurrentCourses([]);
                // console.log("currentDay: "+ currentDay)
              }}
              style={styles.switchViewButton}
            >
              <Text style={styles.switchViewText}>
                Switch to {calenderVisibility ? "List" : "Calendar"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={[styles.container, styles.background]}>
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
