import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { useLocalSearchParams } from 'expo-router';
import fetchInfo from '../hook/fetchInfo';
import Class from '../components/Class';


const AddClassSearchResults = () => {
    const { semester, subject, number } = useLocalSearchParams();
    const [courses, setCourses] = useState([]);

    const info = fetchInfo(subject);
    const courseList = info.data;
    useEffect(() => {

        if(courseList && number) {
            setCourses(courseList.filter(course => course.code === `${subject} ${number}`));
        } else {
            console.log('ayy lmao')
            setCourses(courseList);
        }

    }, [info])


    const renderCourse = (course) => {
        return (
            <Class 
                code={course.item.code}
                section={course.item.section}
                name={course.item.title}
                instructor={course.item.instr}
                meeting={course.item.meets}
                fromSearch
            />
        )
    }

    return (
    <View style={styles.container}>
        <Text
            style={styles.header}
        >
            Click the add button on a class to add it to your schedule:
        </Text>
        <FlatList 
            data={courses}
            renderItem={(courses) => renderCourse(courses)}
            contentContainerStyle={{ gap: 20 }}
        />
    </View>
    )
}

export default AddClassSearchResults

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
        borderColor: "green"
    },
    
    list: {
        flex: 1,
        width: '100%'
    },

})