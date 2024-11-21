import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router';
import fetchInfo from '../hook/fetchInfo';
import Class from '../components/Class';


const AddClassSearchResults = () => {
    const { semester, subject, number } = useLocalSearchParams();
    const [courses, setCourses] = useState([]);

    const info = fetchInfo(subject);
    useEffect(() => {
        console.log(info.data[0]);
        setCourses(info.data)
    }, [info])

    // const arr = [
    //     {
    //         id: 1,
    //         text: "hello",
    //     },
    //     {
    //         id: 2,
    //         text: "hello",
    //     },
    //     {
    //         id: 3,
    //         text: "hello",
    //     },
    //     {
    //         id: 4,
    //         text: "hello",
    //     },
    //     {
    //         id: 2,
    //         text: "hello",
    //     },
    //     {
    //         id: 2,
    //         text: "hello",
    //     },
    //     {
    //         id: 2,
    //         text: "hello",
    //     },
        
    // ];

    // const renderItem = (course) => {

    //     console.log(course);
    //     // console.log(course.text);
    //     return (
    //         // <Class 
    //         //     subject={course.item.code}
    //         //     number={course.item.no}
    //         //     section={course.item.section}
    //         //     name={course.item.title}
    //         //     instructor={course.item.instr}
    //         //     meeting={course.item.meets}
    //         //     fromSearch
    //         // />
    //         <View style={styles.red}>
    //             <Text>{course.item.id}</Text>
    //             <Text>{course.item.text}</Text>
    //             {/* <Text>{course.item.code}</Text> */}
    //         </View>
    //     )
    // }

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
        
        {/* <FlatList 
            data={courses}
            renderItem={({ item }) => renderCourse({ item })}
            style={styles.list}
        /> */}

        <Text>end</Text>
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