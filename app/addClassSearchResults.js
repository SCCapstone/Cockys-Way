import { FlatList, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import fetchCourseList from "../hook/fetchCourseList";
import Class from "../components/Class";

import fetchCourseInfo from "../hook/fetchCourseInfo";

export const getInfo = (subject, semester) => {
  console.log(fetchCourseList(subject, semester));
  return fetchCourseList(subject, semester);
};

const AddClassSearchResults = () => {
  const { semester, subject, number } = useLocalSearchParams();
  const [courses, setCourses] = useState([]);

  const test = fetchCourseInfo(40532, 202501);
  console.log('ayo da test');
  console.log(test);

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

  const renderCourse = (course) => {
    console.log(course);
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
      <FlatList
        data={courses}
        renderItem={(courses) => renderCourse(courses)}
        contentContainerStyle={{ gap: 20 }}
      />
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
});
