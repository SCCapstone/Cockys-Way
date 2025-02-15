import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import fetchCourseInfo from '../hook/fetchCourseInfo'

export const getInfo = (crn, srcdb) => {
  return fetchCourseInfo(crn, srcdb);
}

export const cleanString = (string) => {
  if (!string) return;
  return string.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

const courseInfo = () => {
  const { crn, srcdb, instructor, meeting } = useLocalSearchParams();
  const [info, setInfo] = useState({});
  
  const temp = getInfo(crn, srcdb);

  useEffect(() => {
    setInfo(temp.data);
  }, [temp.data])

  // console.log(info)
  // console.log(info.code);

  return (
    <View>
      { info ?
      <>
      <View style={styles.container}>
        <Text style={styles.title}>{info.code} - {info.section}</Text>
        <Text style={styles.subtitle}>{info.title}</Text>
        <Text style={styles.subtitle}>{instructor}</Text>
        <Text style={styles.header}>Meeting times:</Text>
        <Text style={styles.info}>{cleanString(info.meeting_html)}</Text>
        <Text style={styles.header}>Credits:</Text>
        <Text style={styles.info}>{info.hours_html}</Text>
        <Text style={styles.header}>Description:</Text>
        <Text style={styles.info}>{cleanString(info.description)}</Text>
        <Text style={styles.header}>Seats:</Text>
        <Text style={styles.info}>{cleanString(info.seats)}</Text>
        <Text style={styles.header}>Restrictions:</Text>
        <Text style={styles.info}>{cleanString(info.registration_restrictions)}</Text>
      </View>
      </>
        :
        <Text>Loading...</Text>
      }
    </View>
  )
}

export default courseInfo

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20
  },

  title: {
    paddingTop: 15,
    fontSize: 35,
    textAlign: "center"
  },

  subtitle: {
    fontSize: 27,
    textAlign: "center"
  },

  header: {
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 15,
  },
  
  info: {
    fontSize: 18,
  }
})