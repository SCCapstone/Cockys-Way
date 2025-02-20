import { StyleSheet, Text, View, Pressable, ToastAndroid } from "react-native";
import React from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../FirebaseConfig";
import { getAuth } from "firebase/auth";
import { useRouter } from "expo-router";

import fetchCourseInfo from "../hook/fetchCourseInfo";

const Class = ({
  crn,
  code,
  section,
  name,
  instructor,
  meeting,
  srcdb,
  fromSearch = false,
  onDeletePress,
}) => {
  const [notification, setNotification] = useState(false);
  const router = useRouter();

  const addToSchedule = async () => {
    const db = FIRESTORE_DB;

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.log("no user found when trying to add course");
      return;
    }

    try {
      const docRef = doc(db, "schedules", user.uid, "courses", crn);
      await setDoc(docRef, {
        code: code,
        instructor: instructor,
        meeting: meeting,
        name: name,
        section: section,
        srcdb: srcdb,
      });
    } catch (error) {
      console.log("error when adding class: " + error);
    }
    ToastAndroid.show(`${name} has successfully been added to your schedule!`, ToastAndroid.LONG);
    router.push("../(tabs)/schedule");
  };

  const navigateToCourseInfo = () => {
    router.push({
      pathname: "../courseInfo",
      params: { crn, srcdb, instructor, meeting }
    })
  }

  return (
    <View style={styles.course}>
      <View style={styles.courseText}>
        <Text style={styles.courseHeader}>
          {code}-{section}
        </Text>
        <Text style={styles.courseInfo}>{name}</Text>
        <Text style={styles.courseInfo}>{instructor}</Text>
        <Text style={styles.courseInfo}>{meeting}</Text>
      </View>
      <View style={styles.courseIcons}>
        {fromSearch ? (
          <Pressable
            onPress={() => {
              addToSchedule();
            }}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: pressed ? "#450006" : "#73000A",
              },
              
            ]}
          >
            <FontAwesome name="plus-circle" size={30} color="#FFFFFF" />
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={() => {
                setNotification(!notification);
              }}
              style={({ pressed }) => [
                {
                  backgroundColor: pressed ? "#450006" : "transparent",
                },
                styles.button,
              ]}
              testID="toggle-bell"
            >
              <FontAwesome5
                testID="bell-icon"
                name={notification ? "bell" : "bell-slash"}
                size={30}
                color="#FFFFFF"
              />
            </Pressable>
            <Pressable
              onPress={onDeletePress}
              testID="delete-course"
              style={({ pressed }) => [
                {
                  backgroundColor: pressed ? "#450006" : "transparent",
                },
                styles.button,
              ]}
            >
              <FontAwesome5 name="trash-alt" size={30} color="#FFFFFF" />
            </Pressable>
          </>
        )}
        <Pressable
        onPress={navigateToCourseInfo}
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? "#450006" : "transparent",
            },
            styles.button,
          ]}
        >
          <FontAwesome5 name="info-circle" size={30} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
};

export default Class;

const styles = StyleSheet.create({
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
    padding: 5,
  },

  courseText: {
    width: "90%",
    flex: 1,
    flexShrink: 0,
  },

  courseHeader: {
    color: "#FFFFFF",
    fontSize: 30,
  },

  courseInfo: {
    color: "#FFFFFF",
    fontSize: 20,
    flexShrink: 0,
  },

  courseIcons: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  button: {
    padding: 5,
  },
});
