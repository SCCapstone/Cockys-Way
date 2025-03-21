import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import AddClassForm from "../../app/addClassForm";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

// mock for react-native-element-dropdown
jest.mock("react-native-element-dropdown", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Dropdown: ({ onChange, value }) => (
      <Text onPress={() => onChange({ label: "Fall 2024", value: "202408" })}>
        Test Content
      </Text>
    ),
  };
});

describe("AddClassForm", () => {
  it("navigates to AddClassSearchResults screen with correct parameters on button press", () => {
    const mockPush = jest.fn();
    useRouter.mockReturnValue({ push: mockPush });

    // render the component
    const { getByText, getByPlaceholderText, queryByText } = render(
      <AddClassForm />
    );

    // get the dropdown by its initial text
    const dropdown = getByText("Test Content");
    fireEvent.press(dropdown);

    // get the other inputs and change their text as if a user was searching for a class
    const subjectInput = getByPlaceholderText(
      "Subject (CSCE, ENGL, MATH, etc.)"
    );
    fireEvent.changeText(subjectInput, "CSCE");

    const courseNumberInput = getByPlaceholderText(
      "Course Number (101, 240, 567, etc.)"
    );
    fireEvent.changeText(courseNumberInput, "101");

    // press the search for classes button
    const button = getByText("Search For Classes");
    fireEvent.press(button);

    // ensure no error messages are present
    expect(queryByText("Semester is required")).toBeNull();
    expect(queryByText("Subject is required")).toBeNull();
    expect(
      queryByText("Course number must be a number greater than 100")
    ).toBeNull();

    // validate the navigation
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/addClassSearchResults",
      params: { semester: "202408", subject: "CSCE", number: "101" },
    });
  });

  it("displays error messages when submitted with empty/invalid inputs", () => {
    // Render the component without providing any input
    const { getByText, queryByText } = render(<AddClassForm />);

    // checks to make sure of no initial errors
    expect(queryByText("Semester is required")).toBeNull();
    expect(queryByText("Subject is required")).toBeNull();
    expect(
      queryByText("Course number must be a number greater than 100")
    ).toBeNull();

    // Press the submit button without setting any input values (should return errors)
    const submitButton = getByText("Search For Classes");
    fireEvent.press(submitButton);

    // Verify that the appropriate error messages are now displayed
    expect(getByText("Semester is required")).toBeTruthy();
    expect(getByText("Subject is required")).toBeTruthy();
    expect(
      getByText("Course number must be a number greater than 100")
    ).toBeTruthy();
  });
});
