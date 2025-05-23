import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SettingsScreen from "../../app/(tabs)/settings";
import { ThemeContext } from "../../ThemeContext";
import { router } from "expo-router";
import * as firestore from "firebase/firestore";
import { getAuth } from "firebase/auth";

jest.mock("firebase/auth");

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

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

jest.mock("expo-font", () => ({
  useFonts: jest.fn(() => [true]),
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
}));

jest.mock("@expo-google-fonts/abel", () => ({
  useFonts: jest.fn(() => [true]),
  Abel_400Regular: {},
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
      <ThemeContext.Provider
        value={{ theme: mockTheme, setIsDarkTheme: mockSetIsDarkTheme }}
      >
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

  it("opens/closes the Blackboard link help modal when pressed", async () => {
    const { getByTestId, getByText, queryByText } = renderWithTheme();
    expect(queryByText("Blackboard .ics Link")).toBeFalsy();

    const helpLinkText = await waitFor(() => getByTestId("infoButton"));
    fireEvent.press(helpLinkText);
    expect(getByText("Blackboard .ics Link")).toBeTruthy();

    const closeButton = getByText("Close");
    fireEvent.press(closeButton);
    expect(queryByText("Blackboard .ics Link")).toBeFalsy();
  });

  it("shows the Save button when Blackboard link input changes", async () => {
    const { getByPlaceholderText, getByText, queryByText } = renderWithTheme();
    expect(queryByText("Save")).toBeFalsy();

    const input = await waitFor(() =>
      getByPlaceholderText("Enter your Blackboard link")
    );

    fireEvent.changeText(input, "testing");

    expect(getByText("Save")).toBeTruthy();
  });

  it("saves Blackboard link to Firestore when Save is pressed", async () => {
    const { getByPlaceholderText, getByText } = renderWithTheme();

    const input = await waitFor(() =>
      getByPlaceholderText("Enter your Blackboard link")
    );

    fireEvent.changeText(input, "testing");
    fireEvent.press(getByText("Save"));

    expect(firestore.setDoc.mock.calls).toEqual(
      expect.arrayContaining([
        expect.arrayContaining([
          expect.anything(),
          expect.objectContaining({
            settings: expect.objectContaining({
              icsLink: expect.any(String),
            }),
          }),
          { merge: true },
        ]),
      ])
    );
  });

  it("navigates to correct screens", async () => {
    const { getByText } = renderWithTheme();

    fireEvent.press(getByText("Privacy and Security"));
    fireEvent.press(getByText("Favorite Locations"));
    fireEvent.press(getByText("My Account"));

    expect(router.push).toHaveBeenCalledWith("/PrivacySecurity");
    expect(router.push).toHaveBeenCalledWith("/favLocations");
    expect(router.push).toHaveBeenCalledWith("/MyAccount");
  });
});
