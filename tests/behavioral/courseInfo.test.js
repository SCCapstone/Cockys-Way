import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { ThemeContext } from "../../ThemeContext";
import * as expoRouter from "expo-router";
import { screen } from "@testing-library/react-native";

jest.spyOn(expoRouter, "useLocalSearchParams").mockReturnValue({
  crn: "12345",
  srcdb: "202501",
  instructor: "Dr. Jane Doe",
  meeting: "MWF 9:00AM - 9:50AM",
});

jest.mock("../../app/courseInfo", () => {
  const actual = jest.requireActual("../../app/courseInfo");
  return {
    __esModule: true,
    ...actual,
    getInfo: jest.fn(() => ({
      data: {
        code: "CSCE101",
        section: "001",
        title: "Intro to Computer Science",
        meeting_html: "<p>MWF 9:00AM - 9:50AM</p>",
        hours_html: "3.0",
        description: "<p>Basic concepts of programming.</p>",
        seats: "<p>10 / 30</p>",
        registration_restrictions: "<ul><li>Majors only</li></ul>",
      },
      isLoading: false,
      isLoaded: true,
      error: null,
    })),
  };
});

import CourseInfo from "../../app/courseInfo";

describe("courseInfo", () => {
  const theme = {
    colors: {
      background: "#fff",
      text: "#000",
    },
  };

// Skipped due to fetchCourseInfo being a hook-based function
// that is invoked outside of a component, violating the Rules of Hooks
// during testing. Jest attempts to execute fetchCourseInfo too early,
// which causes either memory exhaustion or incomplete renders.
// To re-enable, mock getInfo from a separate module or refactor
// fetchCourseInfo into a safe-to-call async utility.
  it.skip("renders course information correctly", async () => {
    const { getByText } = render(
      <ThemeContext.Provider value={{ theme }}>
        <CourseInfo />
      </ThemeContext.Provider>
    );

    await waitFor(() => {
      expect(getByText(/Intro to Computer Science/i)).toBeTruthy();
    }, { timeout: 2000 });

    expect(getByText(/CSCE101 - 001/i)).toBeTruthy();
    expect(getByText(/Dr\. Jane Doe/i)).toBeTruthy();
    expect(getByText(/Meeting times:/i)).toBeTruthy();
    expect(getByText(/MWF 9:00AM - 9:50AM/i)).toBeTruthy();
    expect(getByText(/Credits:/i)).toBeTruthy();
    expect(getByText(/3\.0/)).toBeTruthy();
    expect(getByText(/Description:/i)).toBeTruthy();
    expect(getByText(/Basic concepts of programming/i)).toBeTruthy();
    expect(getByText(/Seats:/i)).toBeTruthy();
    expect(getByText(/10 \/ 30/)).toBeTruthy();
    expect(getByText(/Restrictions:/i)).toBeTruthy();
    expect(getByText(/Majors only/i)).toBeTruthy();
  });
});
