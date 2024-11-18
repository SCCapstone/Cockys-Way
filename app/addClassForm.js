import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Dropdown } from 'react-native-element-dropdown';
import { useRouter } from 'expo-router';

const data = [
  { label: 'Fall 2024', value: 'fall2024' },
  { label: 'Spring 2025', value: 'spring2025' }
];

const AddClassForm = () => {
  const router = useRouter();

  const [semester, setSemester] = useState(null);
  const [subject, setSubject] = useState("");
  const [number, setNumber] = useState("");

  return (
    <View style={styles.container}>
      <Text style={[styles.header, styles.center]}>Enter Class Search Criteria:</Text>
      <Text style={[styles.subheader, styles.center]}>A * denotes a required field.</Text>
      <View style={styles.form}>
        <Text style={styles.label}>Semester*</Text>
        <Dropdown
          style={styles.input}
          placeholderStyle={{ fontSize: 20 }} 
          selectedTextStyle={{ fontSize: 20 }}
          data={data}
          value={semester}
          labelField="label"
          valueField="value"
          placeholder="Semester"
          onChange={item => {
            setSemester(item.value)
          }}
        />
        <Text style={styles.label}>Subject* (CSCE, ENGL, MATH, etc.)</Text>
        <TextInput 
          style={styles.input}
          placeholder="Subject"
          onChangeText={text => setSubject(text)}
        />
        <Text style={styles.label}>Course Number (101, 240, 567, etc.)</Text>
        <TextInput
          style={styles.input} 
          placeholder="Course Number"
          keyboardType="numeric"
          onChangeText={text => setNumber(text)}
        />
        <TouchableOpacity
          style={styles.submit}
          onPress={() => {
            console.log('hello its pressed')
            router.push("/addClassSearchResults");
          }}
        >
          <Text style={styles.submitText}>Search For Classes</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default AddClassForm

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    paddingHorizontal: 20,
    gap: 50, 
    flex: 1
  },

  header: {
    fontSize: 30,
  },

  subheader: {
    fontSize: 25,
    fontStyle: "italic",
  },

  center: {
    textAlign: "center"
  },
  
  form: {
    paddingHorizontal: 20,
  },

  label: {
    fontSize: 20,
  },

  input: {
    fontSize: 20,
    borderColor: "black",
    borderWidth: 2,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 5,
    borderRadius: 10,
    marginBottom: 20,
  },

  submit: {
    backgroundColor: '#73000A',
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10,
  },

  submitText: {
    color: "#FFFFFF",
    fontSize: 20,
  }

})