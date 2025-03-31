import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import AddClassSearchResults from "../../app/addClassSearchResults";
import * as router from "expo-router";
import * as fetchHook from "../../hook/fetchCourseList";
import { ThemeContext } from "../../ThemeContext";

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Ionicons: (props) => <Text testID={props.testID}>{props.name}</Text>,
  };
});

jest.mock("../../components/Class", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return (props) => {
    console.log("Mock Class props:", props);
    return (
      <View>
        <Text>{props.name}</Text>
        <Text>{props.instructor}</Text>
      </View>
    );
  };
});

// Mock the route parameters
jest.spyOn(router, "useLocalSearchParams").mockReturnValue({
  subject: "CSCE",
  semester: "202501",
  number: "101",
});

// Mock theme
const mockTheme = {
  colors: {
    background: "#fff",
    text: "#000",
  },
};

// Sample course data
const mockCourseData = [
  {
    crn: "12345",
    code: "CSCE 101",
    section: "001",
    title: "Intro to CS",
    instr: "Prof. Smith",
    meets: "MWF 10:00-10:50",
    srcdb: "202501",
  },
];

// Mock fetchCourseList hook
jest.spyOn(fetchHook, "default").mockReturnValue({
  data: mockCourseData,
  isLoading: false,
});

describe("AddClassSearchResults", () => {
  it("renders the header text", () => {
    const { getByText } = render(
      <ThemeContext.Provider value={{ theme: mockTheme }}>
        <AddClassSearchResults />
      </ThemeContext.Provider>
    );
    expect(
      getByText("Click the add button on a class to add it to your schedule:")
    ).toBeTruthy();
  });

  it("renders filtered course", async () => {
    const { getByText } = render(
      <ThemeContext.Provider value={{ theme: mockTheme }}>
        <AddClassSearchResults />
      </ThemeContext.Provider>
    );

    await waitFor(() => {
      expect(getByText("Intro to CS")).toBeTruthy();
      expect(getByText("Prof. Smith")).toBeTruthy();
    });
  });
});
