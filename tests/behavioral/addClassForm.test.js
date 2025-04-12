import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import AddClassForm from "../../app/(tabs)/schedule/addClassForm";
import { ThemeContext } from "../../ThemeContext";

const mockTheme = {
  theme: {
    colors: {
      background: "#fff",
      text: "#000",
      card: "#f0f0f0",
      primary: "#73000A",
      border: "#ccc",
      notification: "#ff3b30",
      placeholder: "#999",
      lightGarnet: "#D5B4BA",
    },
  },
  toggleTheme: jest.fn(),
};

const renderWithTheme = (ui) =>
  render(<ThemeContext.Provider value={mockTheme}>{ui}</ThemeContext.Provider>);

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("react-native-element-dropdown", () => {
  const React = require("react");
  const { Text, TouchableOpacity } = require("react-native");
  return {
    Dropdown: ({ placeholder, onChange }) => (
      <TouchableOpacity
        onPress={() => onChange({ label: "Fall 2024", value: "202408" })}
      >
        <Text>{placeholder}</Text>
      </TouchableOpacity>
    ),
  };
});

describe("AddClassForm", () => {
  it("navigates to AddClassSearchResults screen with correct parameters on button press", () => {
    const mockPush = jest.fn();
    useRouter.mockReturnValue({ push: mockPush });

    const { getByText, getByPlaceholderText, queryByText } = renderWithTheme(
      <AddClassForm />
    );

    const dropdown = getByText("Semester");
    fireEvent.press(dropdown);

    const subjectInput = getByPlaceholderText(
      "Subject (CSCE, ENGL, MATH, etc.)"
    );
    fireEvent.changeText(subjectInput, "CSCE");

    const courseNumberInput = getByPlaceholderText(
      "Course Number (101, 240, 567, etc.)"
    );
    fireEvent.changeText(courseNumberInput, "101");

    const button = getByText("Search For Classes");
    fireEvent.press(button);

    expect(queryByText("Semester is required")).toBeNull();
    expect(queryByText("Subject is required")).toBeNull();
    expect(
      queryByText("Course number must be a number greater than 100")
    ).toBeNull();

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(tabs)/schedule/addClassSearchResults",
      params: { semester: "202408", subject: "CSCE", number: "101" },
    });
  });

  it("displays error messages when submitted with empty/invalid inputs", () => {
    const { getByText, queryByText } = renderWithTheme(<AddClassForm />);

    expect(queryByText("Semester is required")).toBeNull();
    expect(queryByText("Subject is required")).toBeNull();
    expect(
      queryByText("Course number must be a number greater than 100")
    ).toBeNull();

    const submitButton = getByText("Search For Classes");
    fireEvent.press(submitButton);

    expect(getByText("Semester is required")).toBeTruthy();
    expect(getByText("Subject is required")).toBeTruthy();
    expect(
      getByText("Course number must be a number greater than 100")
    ).toBeTruthy();
  });
});
