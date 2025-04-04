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
  const { useState } = React;
  const { View, Text, Pressable } = require("react-native");

  return ({ code, section, name, instructor }) => {
    const [added, setAdded] = useState(false);

    return (
      <View testID={`class-${code}-${section}`}>
        <Text>{name}</Text>
        <Text>{instructor}</Text>
        <Pressable
          testID="toggle-add-class"
          onPress={() => setAdded((prev) => !prev)}
        >
          <Text testID="check-icon">
            {added ? "check-circle" : "plus-circle"}
          </Text>
        </Pressable>
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
    fromSearch: true
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

  it("shows check icon after class is added", async () => {
    const { getByTestId } = render(
      <ThemeContext.Provider value={{ theme: mockTheme }}>
        <AddClassSearchResults />
      </ThemeContext.Provider>
    );
  
    const toggleButton = getByTestId("toggle-add-class");
  
    // should show the plus at first
    expect(getByTestId("check-icon").props.children).toBe("plus-circle");
  
    // press button to toggle icon
    fireEvent.press(toggleButton);
  
    // should now be check after toggling icon
    expect(getByTestId("check-icon").props.children).toBe("check-circle");
  });
});
