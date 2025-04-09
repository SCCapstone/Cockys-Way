jest.mock("firebase/auth", () => ({
  getAuth: () => ({
    currentUser: null,
  }),
  onAuthStateChanged: (auth, callback) => {
    callback(null); /// no user
    return () => {};
  },
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
}));

import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import Directory from "../../app/(tabs)/directory";
import { useRouter } from "expo-router";
import { ThemeProvider } from "../../ThemeContext";

const renderWithTheme = (ui) => render(<ThemeProvider>{ui}</ThemeProvider>);

jest.mock("../../FirebaseConfig", () => ({
  FIREBASE_AUTH: {
    currentUser: null,
  },
  FIRESTORE_DB: {
    collection: jest.fn(),
  },
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  getDocs: jest.fn(() =>
    Promise.resolve({
      docs: [
        {
          id: "1",
          data: () => ({
            name: "Abreu, Whitney",
            college: "School of Medicine",
            department: "Pediatrics",
            email: "Whitney.Abreu@uscmed.sc.edu",
            "faculty/staff": "Staff",
            image: "",
            keywords: "",
            office: "",
            officeHours: {
              monday: "",
              tuesday: "03:30 PM-05:00 PM",
              wednesday: "",
              thursday: "02:00 PM-03:30 PM",
              friday: "",
            },
            phone: "",
            "secondary title": "",
            tags: ",",
            title: "Student Services Program Coordinator",
          }),
        },
        {
          id: "2",
          data: () => ({
            name: "Smith, John",
            college: "College of Engineering",
            department: "Computer Science",
            email: "john.smith@sc.edu",
            "faculty/staff": "Faculty",
            image: "",
            keywords: "",
            office: "Room 2.210",
            officeHours: {
              monday: "10:00 AM-11:30 AM",
              tuesday: "",
              wednesday: "10:00 AM-11:30 AM",
              thursday: "",
              friday: "02:00 PM-03:30 PM",
            },
            phone: "803-777-0000",
            "secondary title": "",
            tags: ",",
            title: "Associate Professor",
          }),
        },
        {
          id: "3",
          data: () => ({
            name: "Zhang, Mike",
            college: "College of Engineering",
            department: "Mechanical Engineering",
            email: "mike.zhang@sc.edu",
            "faculty/staff": "Faculty",
            image: "",
            keywords: "",
            office: "Room 3.110",
            officeHours: {
              monday: "09:00 AM-10:30 AM",
              tuesday: "",
              wednesday: "09:00 AM-10:30 AM",
              thursday: "",
              friday: "",
            },
            phone: "803-777-1111",
            "secondary title": "",
            tags: ",",
            title: "Assistant Professor",
          }),
        },
      ],
    })
  ),
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@expo/vector-icons/FontAwesome", () => "FontAwesome");


describe("Directory Screen", () => {
  const mockPush = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({ push: mockPush });
  });

  it("renders alphabet bar and allows scrolling to sections", async () => {
    const { getByText, queryByText } = renderWithTheme(<Directory />);

    await waitFor(() => {
      expect(queryByText("Whitney Abreu")).toBeTruthy();
    });

    const letterA = getByText("A");
    fireEvent.press(letterA);

    await waitFor(() => {
      expect(queryByText("Whitney Abreu")).toBeTruthy();
    });

    const letterS = getByText("S");
    fireEvent.press(letterS);

    await waitFor(() => {
      expect(queryByText("John Smith")).toBeTruthy();
    });
  });

  it("navigates to professor info when a professor name is clicked", async () => {
    const { getByText, queryByText } = renderWithTheme(<Directory />);

    await waitFor(() => {
      expect(queryByText("Whitney Abreu")).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByText("Whitney Abreu"));
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "professorInfo",
      params: expect.any(Object),
    });
  });

  it("filters professors based on search input", async () => {
    const { getByPlaceholderText, queryByText } = renderWithTheme(
      <Directory />
    );

    await waitFor(() => {
      expect(queryByText("Whitney Abreu")).toBeTruthy();
    });

    const searchInput = getByPlaceholderText("Search by Name");
    fireEvent.changeText(searchInput, "Smith");

    await waitFor(() => {
      expect(queryByText("John Smith")).toBeTruthy();
      expect(queryByText("Whitney Abreu")).toBeNull();
      expect(queryByText("Mike Zhang")).toBeNull();
    });

    fireEvent.changeText(searchInput, "");
    await waitFor(() => {
      expect(queryByText("Whitney Abreu")).toBeTruthy();
      expect(queryByText("John Smith")).toBeTruthy();
      expect(queryByText("Mike Zhang")).toBeTruthy();
    });
  });
});
