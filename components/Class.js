import { StyleSheet, Text, View, Pressable, ToastAndroid } from "react-native";
import React, { useEffect } from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../FirebaseConfig";
import { getAuth } from "firebase/auth";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { Button, Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

import fetchCourseInfo from "../hook/fetchCourseInfo";

let hasShownEmulatorAlert = false;

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
  const [notificationIcon, setNotificationIcon] = useState(false);
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(undefined);
  const notificationListener = useRef();
  const responseListener = useRef();

  const DAY_MAP = { M: 1, T: 2, W: 3, Th: 4, F: 5 };

  const scheduleCourseNotifications = async (meeting, expoPushToken) => {
    if (!meeting || meeting.length === 0) return;
    const sessions = meeting.split("; ");

    for (const session of sessions) {
      const [daysPart, timePart] = session.split(" ");
      const firstPeriod = timePart.match(/[ap]/)?.[0];

      if (!firstPeriod) continue;

      const startTime = timePart.split("-")[0];
      let [hour, minute] = startTime.match(/\d+/g).map(Number);

      if (firstPeriod === "p" && hour !== 12) hour += 12;
      if (firstPeriod === "a" && hour === 12) hour = 0;

      minute -= 30;
      if (minute < 0) {
        minute += 60;
        hour -= 1;
      }

      for (const day of Object.keys(DAY_MAP)) {
        if (daysPart.includes(day)) {
          const notificationTime = new Date();
          notificationTime.setHours(hour, minute, 0, 0);
          notificationTime.setDate(
            notificationTime.getDate() +
              ((DAY_MAP[day] - notificationTime.getDay() + 7) % 7)
          );

          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${name} is about to start!`,
              body: "Class starts in 30 minutes!",
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: notificationTime,
              repeats: true,
            },
          });
        }
      }
    }
  };

  const cancelScheduledNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  async function sendPushNotification(expoPushToken) {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: `${name} is about to start!`,
      body: "Class starts in 30 minutes!",
      data: { someData: "goes here" },
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  }

  function handleRegistrationError(errorMessage) {
    alert(errorMessage);
    throw new Error(errorMessage);
  }

  async function registerForPushNotificationsAsync() {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        handleRegistrationError(
          "Permission not granted to get push token for push notification!"
        );
        return;
      }
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        handleRegistrationError("Project ID not found");
      }
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log(pushTokenString);
        return pushTokenString;
      } catch (e) {
        handleRegistrationError(`${e}`);
      }
    } else {
      if (!hasShownEmulatorAlert) {
        hasShownEmulatorAlert = true;
        handleRegistrationError(
          "You MUST use a physical device for push notifications.\nEmulators do not support push notifications. "
        );
      }
    }
  }

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ""))
      .catch((error) => setExpoPushToken(`${error}`));

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    const checkIfCourseIsAdded = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) return;

      const docRef = doc(FIRESTORE_DB, "schedules", user.uid, "courses", crn);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setAdded(true);
      }
    };

    checkIfCourseIsAdded();
  }, [crn]);

  const toggleInSchedule = async () => {
    const db = FIRESTORE_DB;

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.log("no user found when trying to add course");
      return;
    }
    const docRef = doc(db, "schedules", user.uid, "courses", crn);
    try {
      if (!added) {
        await setDoc(docRef, {
          code: code,
          instructor: instructor,
          meeting: meeting,
          name: name,
          section: section,
          srcdb: srcdb,
        });
        setAdded(true);
        ToastAndroid.show(
          `${name} has successfully been added to your schedule!`,
          ToastAndroid.LONG
        );
      } else {
        await deleteDoc(docRef);
        setAdded(false);
        ToastAndroid.show(
          `${name} has been removed from your schedule`,
          ToastAndroid.LONG
        );
      }
    } catch (error) {
      console.log("error when adding class: " + error);
    }
  };

  const navigateToCourseInfo = () => {
    router.push({
      pathname: "../courseInfo",
      params: { crn, srcdb, instructor, meeting },
    });
  };

  //added testID to the class component 30 MARCH 2025
  return (
    <View style={styles.course} testID={`class-${code}-${section}`}>
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
              toggleInSchedule();
            }}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: pressed ? "#450006" : "#73000A",
              },
            ]}
          >
            <FontAwesome
              name={added ? "check-circle" : "plus-circle"}
              size={30}
              color="#FFFFFF"
            />
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={async () => {
                if (!notificationIcon) {
                  await scheduleCourseNotifications(meeting, expoPushToken);
                } else {
                  await cancelScheduledNotifications();
                }
                setNotificationIcon(!notificationIcon);
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
                name={notificationIcon ? "bell" : "bell-slash"}
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
