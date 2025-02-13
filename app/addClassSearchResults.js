import { FlatList, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import fetchCourseList from "../hook/fetchCourseList";
import Class from "../components/Class";

/*
export const getInfo = (subject, semester) => {
  console.log(fetchCourseList(subject, semester));
  return fetchCourseList(subject, semester);
};
*/    // Commented out previous getInfo

export const getInfo = async (subject, semester) => {
  try {
    console.log("Fetching courses for: ", subject, semester);
    const data = await fetchCourseList(subject, semester);
    console.log("API Response:", data); // for debugging
    return data;

  } catch (error) {
    console.error("Error fetching courses: ", error);
    return { data: []}; // make sure its always returning something so it doesnt break everything again
  } // end try-catch block
};

const AddClassSearchResults = () => {
  const { semester, subject, number } = useLocalSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

/*
  const info = getInfo(subject, semester);
  let courseList = info.data;
  useEffect(() => {
    // console.log(courseList[0]);

    if (courseList && number) {
      courseList = courseList.filter(
        (course) => course.code === `${subject} ${number}`
      );
    }

    setCourses(courseList);
  }, [info.data, number, subject]);
*/  // Commented out original for testing loading

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);

    try {
      const info = await getInfo(subject, semester); // <-- Awaiting the async function
      let courseList = info?.data || []; // Ensure it's an array

      if (courseList.length > 0 && number) {
        courseList = courseList.filter(
          (course) => course.code === `${subject} ${number}`
        );
      }

      setCourses(courseList);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } // end try-catch
    setLoading(false);
  };

  fetchData();
}, [semester, subject, number]);
//}, [semester, number, subject]);

/*
  const renderCourse = (course) => { // orig
    console.log(course);  // orig
    return (
      <Class
        crn={course.item.crn}
        code={course.item.code}
        section={course.item.section}
        name={course.item.title}
        instructor={course.item.instr}
        meeting={course.item.meets}
        fromSearch
        srcdb={course.item.srcdb}
      />
    );*/    // commented out orig for testing -CRB

    const renderCourse = ({ item }) => (
      <Class
        crn={item.crn}
        code={item.code}
        section={item.section}
        name={item.title}
        instructor={item.instr}
        meeting={item.meets}
        fromSearch
        srcdb={item.srcdb}
      />
    ); // end renderCourse

    if (loading) {
    //  return null;
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#73000A" />
            <Text style={styles.loadingText}>Loading courses...</Text>
          </View>
        );
    } // end of if loading
  //};

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Click the add button on a class to add it to your schedule:
      </Text>
      {courses.length > 0 ? ( // added
      <FlatList
        data={courses}
        renderItem={renderCourse} // added
        keyExtractor={(item) => item.crn.toString()} // added
//        renderItem={(courses) => renderCourse(courses)} // commented out orig. for testing
        contentContainerStyle={{ gap: 20 }}
      />
      ) : (
        <Text style={styles.noResultsText}>No courses found.</Text>
      )} 
    </View>
  );
};

export default AddClassSearchResults;

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    paddingHorizontal: 20,
  },

  header: {
    textAlign: "center",
    fontSize: 25,
    marginBottom: 20,
  },



  headerIcon: {
    marginHorizontal: 30,
    gap: 10,
    padding: 100,
    margin: 100,
    borderWidth: 10,
    borderColor: "green",
  },

  list: {
    flex: 1,
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#73000A",
  },
  noResultsText: {
    textAlign: "center",
    fontSize: 18,
    color: "gray",
    marginTop: 20,
  },
});
