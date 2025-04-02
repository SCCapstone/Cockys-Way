import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import fetchCourseList from "../hook/fetchCourseList";
import Class from "../components/Class";
import fetchCourseInfo from "../hook/fetchCourseInfo";
import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";

export const getInfo = (subject, semester) => {
  console.log(fetchCourseList(subject, semester));
  return fetchCourseList(subject, semester);
};

const AddClassSearchResults = () => {
  const { semester, subject, number } = useLocalSearchParams();
  const [courses, setCourses] = useState([]);
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  const styles = StyleSheet.create({
    container: {
      paddingTop: 30,
      paddingHorizontal: 20,
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      textAlign: "center",
      fontSize: 25,
      marginBottom: 20,
      color: colors.text,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  const info = getInfo(subject, semester);
  let courseList = info.data;
  const isLoading = info.isLoading;

  useEffect(() => {
    if (courseList && number) {
      courseList = courseList.filter(
        (course) => course.code === `${subject} ${number}`
      );
    }
    setCourses(courseList);
  }, [info.data, number, subject]);

  const renderCourse = (course) => {
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
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Click the add button on a class to add it to your schedule:
      </Text>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#73000A" />
        </View>
      ) : courses.length === 0 ? (
        <Text style={[styles.header, { textAlign: "center" }]}>
          No courses found for this search.
        </Text>
      ) : (
        <FlatList
          data={courses}
          renderItem={(courses) => renderCourse(courses)}
          contentContainerStyle={{ gap: 20 }}
        />
      )}
    </View>
  );
};

export default AddClassSearchResults;
