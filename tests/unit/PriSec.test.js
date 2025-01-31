import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import PrivacySecurity from "../PrivacySecurity"; // Adjust the path if needed

describe("PrivacySecurity Component", () => {
  test("should render correctly", () => {
    const { getByText } = render(<PrivacySecurity />);
    expect(getByText("Privacy & Security")).toBeTruthy(); // Ensure the title renders
  });

  test("should toggle a setting when clicked", () => {
    const { getByText } = render(<PrivacySecurity />);
    const toggleButton = getByText("Enable Two-Factor Authentication"); // Adjust as per actual text

    fireEvent.press(toggleButton);

    // Instead of checking updateSettings, check UI changes
    expect(toggleButton).toHaveProp("accessibilityState", { checked: true });
  });
});
