import React from "react";
import { render, act } from "@testing-library/react-native";
import ProfessorInfo from "../../app/professorInfo";
import { ThemeProvider } from "../../ThemeContext";
import { useLocalSearchParams } from "expo-router";

jest.mock("expo-font", () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useLocalSearchParams: jest.fn(),
}));

const renderWithTheme = (ui) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe("ProfessorInfo", () => {
  it("displays professor name and title", async () => {
    const professor = {
      name: "Dr. Jane Smith",
      title: "Associate Professor",
      officeHours: {},
    };
    useLocalSearchParams.mockReturnValue({
      item: JSON.stringify(professor),
    });

    const result = renderWithTheme(<ProfessorInfo />);


    const { findByText } = result;

    const name = await findByText("Dr. Jane Smith");
    const title = await findByText("Associate Professor");

    expect(name).toBeTruthy();
    expect(title).toBeTruthy();
  });
});
