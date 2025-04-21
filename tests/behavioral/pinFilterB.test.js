import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import HomeScreen from "../../app/(tabs)";
import { ThemeContext } from "../../ThemeContext";
import { useRouter } from "expo-router";
import { CategoryVisibilityProvider } from "../../app/CategoryVisibilityContext"; // Adjust the import path as needed
import * as firestore from "firebase/firestore";
import { doc } from "firebase/firestore";
import * as Location from "expo-location";

//import { act } from "react-test-renderer";
//import { render, waitFor, fireEvent } from "@testing-library/react-native";
//import { useLocalSearchParams, useRouter } from "expo-router";





// testing...

const FIRESTORE_DB = {}; // Mock Firestore database object
const uid = "mock-uid";

const userFavoritesRef = doc(FIRESTORE_DB, "favorites", uid);

const mockTheme = {
    colors: {
      text: "#000000",
      garnetWhite: "#FFFFFF",
    },
  };
  
  const mockCategoryVisibility = {
    categoryVisibility: {
      9492: true,
      23396: true,
    },
    isInitialized: true,
  };

// Mock the router

jest.mock("expo-router", () => ({
    useRouter: jest.fn(),
    useLocalSearchParams: jest.fn(() => ({
      latitude: 33.987514,
      longitude: -81.03051,
      markerId: 223277,
    })),
  }));


//  jest.mock("expo-router", () => ({
//    useRouter: jest.fn(),
//    useLocalSearchParams: jest.fn(),
//  }));

  jest.mock("expo-font", () => ({
    loadAsync: jest.fn(() => Promise.resolve()),
    isLoaded: jest.fn(() => true), // Mock isLoaded to return true
  }));


  jest.mock("expo-location", () => ({
    requestForegroundPermissionsAsync: jest.fn(() =>
      Promise.resolve({ status: "granted" })
    ),
    getCurrentPositionAsync: jest.fn(() =>
      Promise.resolve({
        coords: { 
            latitude: 34.0004, 
            longitude: -81.0359 },
      })
    ),
  }));


  jest.mock("firebase/firestore", () => ({
    getFirestore: jest.fn(() => ({})), // Mock getFirestore to return an empty object
    collection: jest.fn(),
    doc: jest.fn(() => ({})), // Mock doc to return an empty object
    //getDoc: jest.fn(() =>
    //    Promise.resolve({ exists: () => false, data: () => ({}) })
    //  ),
    getDocs: jest.fn(() =>
      Promise.resolve({
        docs: [
          {
            id: "1",
            data: () => ({
              title: "1000 Catawba Street",
              catId: 9492,
              description: "Description for 1000 Catawba Street",
              id: 223277,
              latitude: 33.987514,
              longitude: -81.03051,
            }),
          },
          {
            id: "2",
            data: () => ({
              title: "1005 Idlewilde Boulevard",
              catId: 23396,
              description: "Description for 1005 Idlewilde Boulevard",
              id: 225663,
              latitude: 33.966026,
              longitude: -81.009964,
            }),
          },
        ],
      })
    ),
  }));

  

describe("HomeScreen Pin Filter Behavioral Tests", () => {
  const mockPush = jest.fn();
  const theme = {
    colors: {
      text: "#000000",
      garnetWhite: "#FFFFFF",
      card: "#F5F5F5",
    },
  };

  const mockCategoryVisibility = {
    categoryVisibility: { buildings: true, parks: false }, // Mocked category visibility
    setCategoryVisibility: jest.fn(), // Mocked setter function
  };

  beforeEach(() => {
    useRouter.mockReturnValue({ push: mockPush });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("navigates to the Pin Filter screen when the button is pressed", () => {
    const { getByTestId } = render(
    <ThemeContext.Provider value={{ theme }}>
      <CategoryVisibilityProvider value={mockCategoryVisibility}>
        <HomeScreen />
      </CategoryVisibilityProvider>
    </ThemeContext.Provider>
    );

    // Simulate pressing the Pin Filter button
    const filterButton = getByTestId("filterButton");
    fireEvent.press(filterButton);

    // Verify navigation to the Pin Filter screen
    expect(mockPush).toHaveBeenCalledWith("/PinFilterMain");
  });

  it("filters pins based on category visibility", () => {
    const { getByTestId, queryByText } = render(
        <ThemeContext.Provider value={{ theme }}>
            <CategoryVisibilityProvider value={mockCategoryVisibility}>
                <HomeScreen />
            </CategoryVisibilityProvider>
        </ThemeContext.Provider>
    );

    // Simulate category visibility changes (mock the context or state)
    const filterButton = getByTestId("filterButton");
    fireEvent.press(filterButton);

    // Verify that filtered pins are displayed
    expect(queryByText("Filtered Pin Title")).toBeTruthy(); // Replace with actual pin title
    expect(queryByText("Non-Filtered Pin Title")).toBeNull(); // Replace with a pin that should be hidden
  });

  it("opens the info modal when the info button is pressed", () => {
    const { getByTestId, getByText } = render(
        <ThemeContext.Provider value={{ theme }}>
          <CategoryVisibilityProvider value={mockCategoryVisibility}>
            <HomeScreen />
          </CategoryVisibilityProvider>
        </ThemeContext.Provider>
    );

    // Simulate pressing the info button
    const infoButton = getByTestId("infoButton");
    fireEvent.press(infoButton);

    // Verify that the modal is displayed
    expect(getByText("Button Information")).toBeTruthy();
  });
});










/*



const renderHomeScreen = (props = {}) => {
  return render(
    <ThemeContext.Provider value={{ theme: mockTheme }}>
      <CategoryVisibilityContext.Provider value={mockCategoryVisibility}>
        <HomeScreen {...props} />
      </CategoryVisibilityContext.Provider>
    </ThemeContext.Provider>
  );
};

it("filters pins based on category visibility", async () => {
  const { queryByText, queryAllByTestId, getByTestId } = renderHomeScreen();

  // Wait for the Skip button and press it
  await waitFor(() => {
    expect(queryByText("Skip")).toBeTruthy();
  });
  fireEvent.press(queryByText("Skip"));

  // Simulate pressing the filter button
  const filterButton = getByTestId("filterButton");
  fireEvent.press(filterButton);

  // Wait for the filtered pins to appear
  await waitFor(() => {
    const markers = queryAllByTestId("marker");
    expect(markers.length).toBeGreaterThan(0);
    expect(markers.some(marker => marker.props.title === "1000 Catawba Street")).toBeTruthy();
  });
});

*/