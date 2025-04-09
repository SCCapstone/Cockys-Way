import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Schedule from "../../app/(tabs)/schedule";
import { ThemeProvider } from "../../ThemeContext";

const renderWithTheme = (ui) => render(<ThemeProvider>{ui}</ThemeProvider>);

jest.mock("firebase/auth", () => ({
  getAuth: () => ({
    currentUser: { uid: "test-uid" },
  }),
  initializeAuth: jest.fn(() => ({
    currentUser: { uid: "test-uid" },
  })),
  getReactNativePersistence: jest.fn(),
  onAuthStateChanged: (auth, callback) => {
    callback({ uid: "test-uid" }); // signed-in user
    return () => {};
  },
}));

// Mock teh data that we got from firestore with fake data
jest.mock("firebase/firestore", () => {
  return {
    collection: jest.fn(),
    doc: jest.fn(() => ({})),
    getDoc: jest.fn(() =>
      Promise.resolve({
        exists: () => true,
        data: () => ({
          theme: "light",
        }),
      })
    ),
    onSnapshot: jest.fn((_, onNext) => {
      setImmediate(() => {
        onNext({
          docs: [
            {
              id: "course1",
              data: () => ({
                name: "Test Course",
                code: "CS101",
                section: "001",
              }),
            },
          ],
          exists: () => true, // needed if onSnapshot
          data: () => ({
            theme: "light",
          }),
        });
      });
      return jest.fn();
    }),
    getFirestore: jest.fn(),
    deleteDoc: jest.fn(),
  };
});

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Ionicons: (props) => <Text testID={props.testID}>{props.name}</Text>,
  };
});

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("expo-font", () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
}));

describe("Schedule Page", () => {
  it("shows the delete confirmation modal when the trash icon is pressed", async () => {
    const { getByTestId, getByText } = renderWithTheme(<Schedule />); // renders schedule page

    await waitFor(() => {
      expect(getByText("Test Course")).toBeTruthy();
    });

    fireEvent.press(getByTestId("delete-course"));

    await waitFor(() => {
      expect(
        getByText(
          "Are you sure you want to delete Test Course from your schedule?"
        )
      ).toBeTruthy();
    });
  });

  it("toggles the bell icon when pressed", async () => {
    const { getByTestId } = renderWithTheme(<Schedule />);
    const toggleBell = await waitFor(() => getByTestId("toggle-bell"));
    const bellIcon = getByTestId("bell-icon");

    const getText = () =>
      Array.isArray(bellIcon.props.children)
        ? bellIcon.props.children.join("")
        : bellIcon.props.children;

    const initial = getText();

    fireEvent.press(toggleBell);
    await waitFor(() => expect(getText()).not.toBe("bell-slash"));

    fireEvent.press(toggleBell);
    await waitFor(() => expect(getText()).toBe(initial));
  });

  it("renders the calendar and allows selecting a date", async () => {
    const { getByText, getByTestId } = renderWithTheme(<Schedule />);
  
    const switchButton = await waitFor(() => getByText(/Switch to Calendar/i));
    fireEvent.press(switchButton);
  
    const calendar = await waitFor(() => getByTestId("calendar"));
  
    fireEvent(calendar, "onDayPress", {
      dateString: "2024-09-20",
    });
  
    await waitFor(() => {
      expect(getByText("2024-09-20")).toBeTruthy();
    });
  });
  
  
});