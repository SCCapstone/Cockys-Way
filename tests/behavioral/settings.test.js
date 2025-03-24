import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SettingsScreen from "../../app/(tabs)/settings";
import { ThemeContext } from "../../ThemeContext";
import { router } from "expo-router";
import * as firestore from "firebase/firestore";
import { getAuth } from "firebase/auth";

jest.mock("firebase/auth");

// Mock navigation
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock Firebase Firestore and Auth
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(() =>
    Promise.resolve({
      exists: () => true,
      data: () => ({
        settings: {
          notificationsEnabled: true,
          theme: "dark",
        },
      }),
    })
  ),
}));

// Mock fonts and splash screen
jest.mock("expo-font", () => ({
    useFonts: jest.fn(() => [true]),
    loadAsync: jest.fn(),
  }));
  
  jest.mock("@expo-google-fonts/abel", () => ({
    useFonts: jest.fn(() => [true]),
    Abel_400Regular: {}, // dummy font value to avoid undefined error
  }));  

jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

describe("SettingsScreen", () => {
  const mockTheme = {
    dark: false,
    colors: {
      background: "#ffffff",
      text: "#000000",
      primary: "#007bff",
      border: "#ccc",
      alwaysWhite: "#ffffff",
    },
  };

  const mockSetIsDarkTheme = jest.fn();

  const renderWithTheme = () =>
    render(
      <ThemeContext.Provider value={{ theme: mockTheme, setIsDarkTheme: mockSetIsDarkTheme }}>
        <SettingsScreen />
      </ThemeContext.Provider>
    );

  it("renders and fetches user settings", async () => {
    const { getByText } = renderWithTheme();

    await waitFor(() => {
      expect(getByText("Settings")).toBeTruthy();
      expect(getByText("Enable Notifications")).toBeTruthy();
      expect(getByText("Dark Mode")).toBeTruthy();
    });
  });

  it("toggles dark mode", async () => {
    const { getByText, getByRole } = renderWithTheme();

    await waitFor(() => getByText("Dark Mode"));

    const darkModeSwitch = getByRole("switch", { name: "Dark Mode" });
    fireEvent(darkModeSwitch, "valueChange", false);

    expect(mockSetIsDarkTheme).toHaveBeenCalledWith(false);
    expect(firestore.setDoc).toHaveBeenCalled();
  });

  it("toggles notifications", async () => {
    const { getByText, getByRole } = renderWithTheme();

    await waitFor(() => getByText("Enable Notifications"));

    const notifSwitch = getByRole("switch", { name: "Enable Notifications" });
    fireEvent(notifSwitch, "valueChange", false);

    expect(firestore.setDoc).toHaveBeenCalled();
  });

  it("navigates to correct screens", async () => {
    const { getByText } = renderWithTheme();

    fireEvent.press(getByText("Privacy and Security"));
    fireEvent.press(getByText("Favorite Locations"));
    fireEvent.press(getByText("Accessibility"));
    fireEvent.press(getByText("My Account"));

    expect(router.push).toHaveBeenCalledWith("/PrivacySecurity");
    expect(router.push).toHaveBeenCalledWith("/favLocations");
    expect(router.push).toHaveBeenCalledWith("/accessibility");
    expect(router.push).toHaveBeenCalledWith("/MyAccount");
  });
});
