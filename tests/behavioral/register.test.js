import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Register from "../../app/register";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ThemeProvider } from "../../ThemeContext";

const renderWithTheme = (ui) => render(<ThemeProvider>{ui}</ThemeProvider>);

jest.mock("../../FirebaseConfig", () => ({
  FIREBASE_AUTH: {
    currentUser: null,
  },
}));

jest.mock("firebase/auth", () => ({
  getAuth: () => ({
    currentUser: null,
  }),
  onAuthStateChanged: (auth, callback) => {
    callback(null); // no user
    return () => {};
  },
  createUserWithEmailAndPassword: jest.fn(),
}));

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

global.alert = jest.fn();

describe("Register Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers successfully with valid input", async () => {
    createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: "12345", email: "test@example.com" },
    });

    const { getByPlaceholderText, getByTestId } = renderWithTheme(<Register />);

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

    fireEvent.press(getByTestId("register-button"));

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object), 
        "test@example.com",
        "password123"
      );
    });

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Succesfully Registered!");
    });
  });

  it("shows an alert on registration failure", async () => {
    createUserWithEmailAndPassword.mockRejectedValue(
      new Error("Registration Failed")
    );

    const { getByPlaceholderText, getByTestId } = renderWithTheme(<Register />);

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

    fireEvent.press(getByTestId("register-button"));

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object),
        "fail@example.com",
        "password123"
      );
    });

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Registration Failed!");
    });
  });
});
