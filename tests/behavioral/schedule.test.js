import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Schedule from "../../app/(tabs)/schedule";

// firebase authenticaiton mock to simulate a user being logged in
jest.mock("firebase/auth", () => {
  return {
    getAuth: jest.fn(() => ({
      currentUser: { uid: "test-uid" },
    })),
    initializeAuth: jest.fn(() => ({
      currentUser: { uid: "test-uid" },
    })),
    getReactNativePersistence: jest.fn(), // Important to resolve error
  };
});

// Mock teh data that we got from firestore with fake data
jest.mock("firebase/firestore", () => {
  return {
    collection: jest.fn(),
    onSnapshot: jest.fn((_, callback) => {
      // Simulate onSnapshot firing once with fake course data
      setImmediate(() => {
        callback({
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
        });
      });

      // Return a mock unsubscribe function
      return jest.fn();
    }),
    getFirestore: jest.fn(), // Mock getFirestore function (this will do nothing)
    deleteDoc: jest.fn(), // Mock deleteDoc function
  };
});

// mocks the icons to avoid the errors
jest.mock("@expo/vector-icons", () => ({
  Ionicons: jest.fn(() => null),
}));

// Mock the AsyncStorage functions to avoid errors with jest
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// mocks the fonts to avoid the errors
jest.mock("expo-font", () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
}));

describe("Schedule Page", () => {
  it("shows the delete confirmation modal when the trash icon is pressed", async () => {
    const { getByTestId, getByText } = render(<Schedule />); // renders schedule page

    // wait for the course to appear
    await waitFor(() => {
      expect(getByText("Test Course")).toBeTruthy();
    });

    // press the delete button
    fireEvent.press(getByTestId("delete-course"));

    // check to make sure that the delete confirmation modal is shown
    await waitFor(() => {
      expect(
        getByText(
          "Are you sure you want to delete Test Course from your schedule?"
        )
      ).toBeTruthy();
    });
  });
});
