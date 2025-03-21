import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Login from "../../app/login";
import { signInWithEmailAndPassword } from "firebase/auth";
import { router } from "expo-router";
import { ThemeProvider } from "../../ThemeContext";

const renderWithTheme = (ui) => render(<ThemeProvider>{ui}</ThemeProvider>);

// Mock FirebaseConfig to avoid `getReactNativePersistence` issue
jest.mock("../../FirebaseConfig", () => ({
  FIREBASE_AUTH: {
    currentUser: null,
  },
}));

// Mock Firebase Auth functions
jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
  getAuth: () => ({
    currentUser: null,
  }),
  onAuthStateChanged: (auth, callback) => {
    callback(null); // no user
    return () => {};
  },
}));
// Mock Expo Router
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

global.alert = jest.fn();
describe("Login Screen", () => {
  // Test for successful login
  it("logs in successfully and navigates to home", async () => {
    signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: "12345", email: "test@example.com" },
    });

    const { getByPlaceholderText, getByTestId } = renderWithTheme(<Login />);

    // Find inputs
    const emailInput = getByPlaceholderText("Type Your Email");
    const passwordInput = getByPlaceholderText("Type Your Password");
    // Had to add a test ID to the button to find it
    const loginButton = getByTestId("login-button");

    // Input values
    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.press(loginButton);

    await waitFor(() =>
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object),
        "test@example.com",
        "password123"
      )
    );
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/"));
  });

  // Test for failed login
  it("shows an alert on failed login", async () => {
    // function rejects the login
    signInWithEmailAndPassword.mockRejectedValue(new Error("Login Failed!"));

    const { getByPlaceholderText, getByTestId } = renderWithTheme(<Login />);

    // inputs
    const emailInput = getByPlaceholderText("Type Your Email");
    const passwordInput = getByPlaceholderText("Type Your Password");
    const loginButton = getByTestId("login-button");

    fireEvent.changeText(emailInput, "wrong@example.com");
    fireEvent.changeText(passwordInput, "wrongpassword");
    fireEvent.press(loginButton);

    await waitFor(() =>
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object),
        "wrong@example.com",
        "wrongpassword"
      )
    );
    expect(global.alert).toHaveBeenCalledWith("Login Failed!");
  });

  it("navigates to the forgot password page when the forgot password button is clicked", () => {
    const { getByText } = renderWithTheme(<Login />);

    // Finds the button based on its text
    const forgotPasswordButton = getByText("Forgot Password?");

    // pressed the button
    fireEvent.press(forgotPasswordButton);

    // Checks the router
    expect(router.push).toHaveBeenCalledWith("/forgotPassword");
  });

  it("navigates to register page when button is clicked", () => {
    const { getByText } = renderWithTheme(<Login />);

    const registerButton = getByText("Don't have an account? Register!");

    fireEvent.press(registerButton);
    expect(router.push).toHaveBeenCalledWith("/register");
  });
});
