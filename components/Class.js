import { StyleSheet, Text, View, Pressable } from 'react-native'
import React from 'react'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const Class = ({ subject, number, section, name, instructor, meeting, fromSearch = false }) => {
    const [notification, setNotification] = useState(false);

    return (
    <View style={styles.course}>
      <View style={styles.courseText}>
        <Text style={styles.courseHeader}>{subject} {number}-{section}</Text>
        <Text style={styles.courseInfo}>{name}</Text>
        <Text style={styles.courseInfo}>{instructor}</Text>
        <Text style={styles.courseInfo}>{meeting}</Text>
      </View>
      <View style={styles.courseIcons}>
        {fromSearch ? 
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
                onPress={() => {}}
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

export default Class

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