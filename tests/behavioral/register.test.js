// register.test.js

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Register from "../../app/register";
import { createUserWithEmailAndPassword } from "firebase/auth";

// Mock FirebaseConfig to avoid `getReactNativePersistence` issue
jest.mock("../../FirebaseConfig", () => ({
  FIREBASE_AUTH: {
    currentUser: null,
  },
}));

// Mock Firebase Auth functions
jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
}));

// Mock Expo Router
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock the global alert function
global.alert = jest.fn();

describe("Register Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers successfully with valid input", async () => {
    // Simulate a successful registration response
    createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: "12345", email: "test@example.com" },
    });

    const { getByPlaceholderText, getByTestId } = render(<Register />);

    // Fill in the registration form
    fireEvent.changeText(
      getByPlaceholderText("Type Your Email"),
      "test@example.com"
    );
    fireEvent.changeText(
      getByPlaceholderText("Type Your Password"),
      "password123"
    );
    fireEvent.changeText(
      getByPlaceholderText("Confirm Your Password"),
      "password123"
    );

    // Press the register button (ensure your component sets testID="register-button")
    fireEvent.press(getByTestId("register-button"));

    // Wait for the async registration to complete and assert Firebase was called correctly
    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object), // Represents your Firebase auth instance
        "test@example.com",
        "password123"
      );
    });

    // Verify that the success alert was displayed
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Succesfully Registered!");
    });
  });

  it("shows an alert on registration failure", async () => {
    // Simulate a registration failure
    createUserWithEmailAndPassword.mockRejectedValue(
      new Error("Registration Failed")
    );

    const { getByPlaceholderText, getByTestId } = render(<Register />);

    // Fill in the registration form with valid values
    fireEvent.changeText(
      getByPlaceholderText("Type Your Email"),
      "fail@example.com"
    );
    fireEvent.changeText(
      getByPlaceholderText("Type Your Password"),
      "password123"
    );
    fireEvent.changeText(
      getByPlaceholderText("Confirm Your Password"),
      "password123"
    );

    // Press the register button
    fireEvent.press(getByTestId("register-button"));

    // Wait for Firebase call and assert it was called with the expected parameters
    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object),
        "fail@example.com",
        "password123"
      );
    });

    // Verify that the failure alert is displayed (note the exclamation mark)
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Registration Failed!");
    });
  });
});
