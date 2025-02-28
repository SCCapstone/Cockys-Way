import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { Dropdown } from "react-native-element-dropdown";
import { useRouter } from "expo-router";

const data = [
  { label: "Fall 2024", value: "202408" },
  { label: "Spring 2025", value: "202501" },
];

const AddClassForm = () => {
  const router = useRouter();

  const [semester, setSemester] = useState(null);
  const [subject, setSubject] = useState("");
  const [number, setNumber] = useState("");
  const [errors, setErrors] = useState({});

  // Validate inputs for errors
  const validateInputs = () => {
    const newErrors = {};
    if (
      !semester ||
      semester.length === 0 ||
      semester == " " ||
      semester == ""
    ) {
      newErrors.semester = "Semester is required";
    }
    if (!subject || subject.length === 0 || subject == " " || subject == "") {
      newErrors.subject = "Subject is required";
    }
    if (
      (number && isNaN(number)) ||
      number == " " ||
      number == "" ||
      number == null ||
      number < 101
    ) {
      newErrors.number = "Course number must be a number greater than 100";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // If input is valid, it'll route to the results
  const handleSubmit = () => {
    if (validateInputs()) {
      router.push({
        pathname: "/addClassSearchResults",
        params: { semester, subject, number },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.header, styles.center]}>
        Enter Class Search Criteria:
      </Text>
      <Text style={[styles.subheader, styles.center]}>
        A * denotes a required field.
      </Text>
      <View style={styles.form}>
        <Text style={styles.label}>Semester *</Text>
        <Dropdown
          style={[styles.input, errors.semester && styles.errorInput]}
          placeholderStyle={{ fontSize: 20 }}
          selectedTextStyle={{ fontSize: 20 }}
          data={data}
          value={semester}
          labelField="label"
          valueField="value"
          placeholder="Semester"
          onChange={(item) => {
            setSemester(item.value);
            setErrors({ ...errors, semester: null });
          }}
        />
        {errors.semester && (
          <Text style={styles.errorText}>{errors.semester}</Text>
        )}

        <Text style={styles.label}>Subject *</Text>
        <TextInput
          style={[styles.input, errors.subject && styles.errorInput]}
          placeholder="Subject (CSCE, ENGL, MATH, etc.)"
          value={subject}
          onChangeText={(text) => {
            setSubject(text.toUpperCase());
            setErrors({ ...errors, subject: null });
          }}
        />
        {errors.subject && (
          <Text style={styles.errorText}>{errors.subject}</Text>
        )}

        <Text style={styles.label}>Course Number *</Text>
        <TextInput
          style={[styles.input, errors.number && styles.errorInput]}
          placeholder="Course Number (101, 240, 567, etc.)"
          keyboardType="numeric"
          value={number}
          onChangeText={(text) => {
            setNumber(text);
            setErrors({ ...errors, number: null });
          }}
        />
        {errors.number && <Text style={styles.errorText}>{errors.number}</Text>}

        <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
          <Text style={styles.submitText}>Search For Classes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddClassForm;

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    paddingHorizontal: 20,
    gap: 50,
    flex: 1,
  },

  header: {
    fontSize: 30,
  },

  subheader: {
    fontSize: 25,
    fontStyle: "italic",
  },

  center: {
    textAlign: "center",
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

  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },

  submit: {
    backgroundColor: "#73000A",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10,
  },

  submitText: {
    color: "#FFFFFF",
    fontSize: 20,
  },
});
