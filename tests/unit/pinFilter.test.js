import React from "react";
import { render } from "@testing-library/react-native";
import HomeScreen from "../../app/(tabs)";
import { ThemeContext } from "../../ThemeContext";

describe("HomeScreen Pin Filter Unit Tests", () => {
  const theme = {
    colors: {
      text: "#000000",
      garnetWhite: "#FFFFFF",
      card: "#F5F5F5",
    },
  };

  it("renders the Pin Filter button", () => {
    const { getByTestId } = render(
      <ThemeContext.Provider value={{ theme }}>
        <HomeScreen />
      </ThemeContext.Provider>
    );

    // Check if the Pin Filter button is rendered
    const filterButton = getByTestId("filterButton");
    expect(filterButton).toBeTruthy();
  });

  it("renders the map correctly", () => {
    const { getByTestId } = render(
      <ThemeContext.Provider value={{ theme }}>
        <HomeScreen />
      </ThemeContext.Provider>
    );

    // Check if the map is rendered
    const map = getByTestId("map");
    expect(map).toBeTruthy();
  });

  it("renders the info modal content correctly", () => {
    const { getByText } = render(
      <ThemeContext.Provider value={{ theme }}>
        <HomeScreen />
      </ThemeContext.Provider>
    );

    // Check if the modal content is rendered
    expect(getByText("Button Information")).toBeTruthy();
    expect(getByText("Filter Pins Icon - Allows user to filter pins based on category (ie, building type)")).toBeTruthy();
  });
});