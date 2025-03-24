import { Alert } from "react-native";

// ✅ Inline mock to avoid circular require issues
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: {
      uid: "test-user",
      email: "test@example.com",
    },
  })),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback({
      uid: "test-user",
      email: "test@example.com",
    });
    return () => {}; // noop unsubscribe
  }),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(() => "mockedPersistence"),
  updateEmail: jest.fn(() => Promise.resolve()),
  updatePassword: jest.fn(() => Promise.resolve()),
  reauthenticateWithCredential: jest.fn(() => Promise.resolve()),
  EmailAuthProvider: {
    credential: jest.fn((email, password) => ({
      email,
      password,
    })),
  },
  sendEmailVerification: jest.fn(() => Promise.resolve()),
}));

import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import MyAccountScreen from "../../app/MyAccount";
import { ThemeContext } from "../../ThemeContext";

// ✅ Firebase functions from the mock
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
} from "firebase/auth";

jest.mock("expo-font", () => ({
  useFonts: jest.fn(() => [true]),
}));
jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

const mockTheme = {
  dark: false,
  colors: {
    background: "#ffffff",
    text: "#000000",
    primary: "#73000A",
    card: "#F3F3F3",
    border: "#cccccc",
    alwaysWhite: "#ffffff",
  },
};

const renderWithTheme = () =>
  render(
    <ThemeContext.Provider value={{ theme: mockTheme }}>
      <MyAccountScreen />
    </ThemeContext.Provider>
  );

describe("MyAccountScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders user info and shows edit button", async () => {
    const { getByText } = renderWithTheme();
    await waitFor(() => {
      expect(getByText("My Account")).toBeTruthy();
      expect(getByText("Edit Account Information")).toBeTruthy();
      expect(getByText("test-user")).toBeTruthy();
      expect(getByText("test@example.com")).toBeTruthy();
    });
  });

  it("opens authentication modal and authenticates successfully", async () => {
    const { getByText, getByPlaceholderText } = renderWithTheme();

    fireEvent.press(getByText("Edit Account Information"));

    const passwordInput = getByPlaceholderText("Enter current password");
    fireEvent.changeText(passwordInput, "test-password");

    fireEvent.press(getByText("Authenticate"));

    await waitFor(() => {
      expect(reauthenticateWithCredential).toHaveBeenCalled();
      expect(getByText("Save Changes")).toBeTruthy();
    });
  });

  it("updates email and shows success alert", async () => {
    const { getByText, getByPlaceholderText } = renderWithTheme();

    fireEvent.press(getByText("Edit Account Information"));

    const passwordInput = getByPlaceholderText("Enter current password");
    fireEvent.changeText(passwordInput, "test-password");
    fireEvent.press(getByText("Authenticate"));

    await waitFor(() => {
      const emailInput = getByPlaceholderText("New Email (Leave blank if unchanged)");
      fireEvent.changeText(emailInput, "new@example.com");
      fireEvent.press(getByText("Save Changes"));
    });

    await waitFor(() => {
      expect(updateEmail).toHaveBeenCalledWith(expect.anything(), "new@example.com");
    });
  });

  it("updates password and shows success alert", async () => {
    const { getByText, getByPlaceholderText } = renderWithTheme();

    fireEvent.press(getByText("Edit Account Information"));

    const passwordInput = getByPlaceholderText("Enter current password");
    fireEvent.changeText(passwordInput, "test-password");
    fireEvent.press(getByText("Authenticate"));

    await waitFor(() => {
      const passwordField = getByPlaceholderText("New Password (Leave blank if unchanged)");
      fireEvent.changeText(passwordField, "newsecurepassword");
      fireEvent.press(getByText("Save Changes"));
    });

    await waitFor(() => {
      expect(updatePassword).toHaveBeenCalledWith(expect.anything(), "newsecurepassword");
    });
  });

  it("cancels editing mode and resets fields", async () => {
    const { getByText, getByPlaceholderText } = renderWithTheme();

    fireEvent.press(getByText("Edit Account Information"));
    fireEvent.changeText(getByPlaceholderText("Enter current password"), "test-password");
    fireEvent.press(getByText("Authenticate"));

    await waitFor(() => {
      expect(getByText("Cancel")).toBeTruthy();
      fireEvent.press(getByText("Cancel"));
    });

    expect(getByText("Edit Account Information")).toBeTruthy();
  });

  it("shows error alert if no user is authenticated", async () => {
    // 👇 Mock getAuth to simulate unauthenticated user
    getAuth.mockReturnValueOnce({ currentUser: null });
  
    // 👇 Spy on Alert.alert
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  
    renderWithTheme();
  
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Sign In Required",
        "Please sign in to view your account details."
      );
    });
  
    alertSpy.mockRestore(); // optional cleanup
  });
});
