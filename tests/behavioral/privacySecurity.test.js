import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import PrivacySecurityScreen from "../../app/PrivacySecurity";
import { ThemeProvider } from "../../ThemeContext";

// Mocks
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(() => ({})),
  getDoc: jest.fn(() =>
    Promise.resolve({
      exists: () => true,
      data: () => ({
        settings: { locationEnabled: false },
      }),
    })
  ),
  setDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
}));

jest.mock("firebase/auth", () => ({
    getAuth: jest.fn(() => ({
      currentUser: { uid: "test-user" },
    })),
    onAuthStateChanged: jest.fn((auth, callback) => {
      callback({ uid: "test-user" }); // simulate user being signed in
      return () => {}; // mock unsubscribe function
    }),
    initializeAuth: jest.fn(),
    getReactNativePersistence: jest.fn(),
  }));
  

const renderWithTheme = (ui) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe("PrivacySecurityScreen", () => {
  it("toggles Location Services and updates Firestore", async () => {
    const { getByRole } = renderWithTheme(<PrivacySecurityScreen />);

    await waitFor(() => getByRole("switch"));
    const toggle = getByRole("switch");

    expect(toggle.props.value).toBe(false);

    fireEvent(toggle, "valueChange");

    await waitFor(() => {
      expect(require("firebase/firestore").setDoc).toHaveBeenCalledWith(
        expect.anything(),
        { settings: { locationEnabled: true } },
        { merge: true }
      );
    });
  });
});
