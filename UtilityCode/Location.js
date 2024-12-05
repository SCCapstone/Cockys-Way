/*
import { StyleSheet, Text, View, Pressable } from 'react-native'
import React from 'react'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { FIRESTORE_DB } from '../FirebaseConfig';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';
*/


// node Location.js

const fs = require("fs");

// Define the Location class
class Location {
  constructor(catId, lat, lng, mapId, id, mrkId, name, favorited, visibility) {
    this.catId = catId;
    this.lat = lat;
    this.lng = lng;
    this.mapId = mapId;
    this.id = id;
    this.mrkId = mrkId;
    this.name = name;
    this.favorited = favorited;
    this.visibility = visibility;
  }
}

// Function to load locations from the text file and create Location objects
function loadLocationsFromFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf8"); // Read the file
    const locationsArray = JSON.parse(data); // Parse JSON data

    const locations = locationsArray.map(locationData => {
      return new Location(
        locationData.catId,
        locationData.lat,
        locationData.lng,
        locationData.mapId,
        locationData.id,
        locationData.mrkId,
        locationData.name
      );
    });

    return locations; // Return the array of Location objects
  } catch (error) {
    console.error("Error reading or parsing the file:", error);
    return [];
  }
}

// Main Execution
const locations = loadLocationsFromFile("formatted_locations.json");

// Print the loaded locations
locations.forEach(location => {
  console.log(location);
});

//       node Location.js



















/*
const fs = require("fs");

// Define the Location class
class Location {
  constructor(catId, lat, lng, mapId, id, mrkId, name, favorited, visibility) {
    this.catId = catId;
    this.lat = lat;
    this.lng = lng;
    this.mapId = mapId;
    this.id = id;
    this.mrkId = mrkId;
    this.name = name;
    this.favorited = favorited;
    this.visibility = visibility;
  }
}

// Function to load locations from the text file and create Location objects
function loadLocationsFromFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf8"); // Read the file
    const locationsArray = JSON.parse(data); // Parse JSON data

    const locations = locationsArray.map(locationData => {
      return new Location(
        locationData.catId,
        locationData.lat,
        locationData.lng,
        locationData.mapId,
        locationData.id,
        locationData.mrkId,
        locationData.name,
        locationData.favorited,
        locationData.visibility
      );
    });

    return locations; // Return the array of Location objects
  } catch (error) {
    console.error("Error reading or parsing the file:", error);
    return [];
  }
} // End loadLocationsFromFile

// Main Execution
const locations = loadLocationsFromFile("locations.txt");

// Print the loaded locations
locations.forEach(location => {
  console.log(location);
});


*/






















/*
        Copied Class.js.
        Am currently restructuring that to work with Location data:


*/

/*
const Location = ({ crn, code, section, name, instructor, meeting, fromSearch = false }) => {
    const [notification, setNotification] = useState(false);
    const router = useRouter();

    const addToSchedule = async() => {

        const db = FIRESTORE_DB;

        const auth = getAuth();
        const user = auth.currentUser;

        if(!user) {
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
                section: section
            });
        } catch (error) {
            console.log("error when adding class: " + error);
        }

        router.push("../(tabs)/schedule");

    }

    const deleteFromSchedule = async() => {
        const db = FIRESTORE_DB;

        const auth = getAuth();
        const user = auth.currentUser;

        if(!user) {
            console.log("no user found when trying to delete course");
            return;
        }
        console.log('crn:' + crn);
        try {
            const docRef = doc(db, "schedules", user.uid, "courses", crn);
            await deleteDoc(docRef);
        } catch (error) {
            console.log("error: " + error)
        }
    }

    return (
    <View style={styles.course}>
      <View style={styles.courseText}>
        <Text style={styles.courseHeader}>{code}-{section}</Text>
        <Text style={styles.courseInfo}>{name}</Text>
        <Text style={styles.courseInfo}>{instructor}</Text>
        <Text style={styles.courseInfo}>{meeting}</Text>
      </View>
      <View style={styles.courseIcons}>
        {fromSearch ? 
        <Pressable
            onPress={() => {
                addToSchedule();
            }}
            style={({pressed}) => [
                {
                backgroundColor: pressed ? '#450006' : 'transparent'
                },
                styles.button,
            ]}
        >
            <FontAwesome name="plus-circle" size={30} color="#FFFFFF" />
        </Pressable> : 
        <>
            <Pressable
                onPress={() => {
                    setNotification(!notification)
                }}
                style={({pressed}) => [
                    {
                    backgroundColor: pressed ? '#450006' : 'transparent'
                    },
                    styles.button,
                ]}
            >
                <FontAwesome5 name={ notification ? "bell" : "bell-slash" } size={30} color="#FFFFFF" />
            </Pressable>
            <Pressable
                onPress={() => {
                    deleteFromSchedule();
                }}
                style={({pressed}) => [
                    {
                    backgroundColor: pressed ? '#450006' : 'transparent'
                    },
                    styles.button,
                ]}
            >
                <FontAwesome5 name="trash-alt" size={30} color="#FFFFFF" />
            </Pressable>
        </>
        }
      </View>
    </View>
  )
}

export default Location

*/


/*          Style Info. Change.


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
        padding: 5
    },

    courseText: {
        width: "90%",
        flex: 1,
        flexShrink: 0
    },

    courseHeader: {
        color: "#FFFFFF",
        fontSize: 30
    },

    courseInfo: {
        color: "#FFFFFF",
        fontSize: 20,
        flexShrink: 0
      },

    courseIcons: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center"
    },

    button: {
        padding: 5,
    },
})
*/
