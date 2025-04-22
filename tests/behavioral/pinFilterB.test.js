import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import HomeScreen from "../../app/(tabs)";
import { ThemeContext } from "../../ThemeContext";
import { useRouter } from "expo-router";
import { CategoryVisibilityContext, CategoryVisibilityProvider } from "../../app/CategoryVisibilityContext"; // Adjust the import path as needed
import { doc } from "firebase/firestore";

/*
    Behavioral Test for Pin Filter (from main)
    Tests Pin Filter button goes to Pin Filter Screen
    Confirms that visible categories show pins & hidden categories hide pins

    To run:
    npm --trace-deprecation test -- pinFilterB
*/



// testing...

const FIRESTORE_DB = {}; // Mock Firestore database object
const uid = "mock-uid";

const userFavoritesRef = doc(FIRESTORE_DB, "favorites", uid);

// Mock Theme
const mockTheme = {
    colors: {
      text: "#000000",
      garnetWhite: "#FFFFFF",
    },
};

  // Mock Category Visibility
const mockCategoryVisibility = {
    categoryVisibility: {
      9492: true,
      23396: true,
    },
    isInitialized: true,
};

// rendering home screen to make life easier
const renderHomeScreen = (props = {}) => {
    return render(
      <ThemeContext.Provider value={{ theme: mockTheme }}>
        <CategoryVisibilityContext.Provider value={mockCategoryVisibility}>
          <HomeScreen {...props} />
        </CategoryVisibilityContext.Provider>
      </ThemeContext.Provider>
    );
};

//                                  MOCKS

// Mock the router
jest.mock("expo-router", () => ({
    useRouter: jest.fn(),
    useLocalSearchParams: jest.fn(() => ({
      latitude: 33.987514,
      longitude: -81.03051,
      markerId: 223277,
    })),
})); // End mock expo-router

// Mock font
jest.mock("expo-font", () => ({
    loadAsync: jest.fn(() => Promise.resolve()),
    isLoaded: jest.fn(() => true), // isLoaded returns true
})); // End mock expo-font

// Mock location
jest.mock("expo-location", () => ({
    requestForegroundPermissionsAsync: jest.fn(() =>
      Promise.resolve({ status: "granted" }) // bc everything breaks otherwise
    ),

    getCurrentPositionAsync: jest.fn(() =>
      Promise.resolve({
        coords: { 
            latitude: 34.0004, 
            longitude: -81.0359 },
      })
    ),
})); // End mock expo-location

// Mock firestore
jest.mock("firebase/firestore", () => ({
    getFirestore: jest.fn(() => ({})), // Mock getFirestore to retrun empty object
    collection: jest.fn(),
    doc: jest.fn(() => ({})), // Mock doc to return empty object
    
    getDoc: jest.fn(() =>
        Promise.resolve({ 
            //exists: () => false, 
            exists: () => true, 
            data: () => ({}) })
    ),
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
    ), // end of getDocs
    updateDoc: jest.fn(() => Promise.resolve()),
})); // End mock firestore


//                TESTING   THE ACTUAL TESTS SOON

describe("HomeScreen Pin Filter Behavioral Tests", () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        useRouter.mockReturnValue({ 
            push: mockPush,
            replace: jest.fn(),     // added to get rid of nonterminal error 
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    //      THE TESTS BEGIN

    it("navigates to the Pin Filter screen when the button is pressed", async () => {
        const { getByTestId, findByTestId } = renderHomeScreen();

        // Simulate pressing the Pin Filter button
        //const filterButton = getByTestId("filterButton"); // commented out bc kept not seeing it if it was loading
        const filterButton = await findByTestId("filterButton");
        fireEvent.press(filterButton);

        // Verify navigation to the Pin Filter screen
        expect(mockPush).toHaveBeenCalledWith("/PinFilterMain");
        //          MAY NEED TO CHANGE PATH HERE ^
    }); // end of test "navigates to the Pin Filter screen when the button is pressed"

    /*
        Confirms that visible categories show pins
        Confirms hidden categories hide pins
    */
    it("filters pins based on category visibility", async () => {
        // commented out to test when a cat is hidden AND when a cat is visible
        //const { queryAllByTestId, findByTestId } = renderHomeScreen();
        // had      queryByText, getByTestId, 

        // testing when cat hidden
        const customVisibility = {
            categoryVisibility: {
              9492: true,    // visible
              23396: false,  // hidden
            },
            isInitialized: true,
        };

        // custom render bc also testing when one hidden
        const { queryAllByTestId } = render(
            <ThemeContext.Provider value={{ theme: mockTheme }}>
              <CategoryVisibilityContext.Provider value={customVisibility}>
                <HomeScreen />
              </CategoryVisibilityContext.Provider>
            </ThemeContext.Provider>
        );

        // commented out for round 2 of tests (1 vis 1 hid)
        // Simulate category visibility changes
        //const filterButton = await findByTestId("filterButton");
        //fireEvent.press(filterButton);

        // Wait for the filtered pins to appear
        await waitFor(() => {
            const markers = queryAllByTestId("marker");
            //expect(markers.length).toBeGreaterThan(0);
            expect(markers.length).toBe(1); // added to test 2nd cat being hidden
            //expect(markers.some(marker => marker.props.title === "1000 Catawba Street")).toBeTruthy();
            expect(markers[0].props.title).toBe("1000 Catawba Street");
        });

        // Verify that filtered pins are displayed
        //expect(queryByText("Filtered Pin Title")).toBeTruthy(); // Replace with actual pin title
        //expect(queryByText("Non-Filtered Pin Title")).toBeNull(); // Replace with a pin that should be hidden
    
    }); // End of "filters pins based on category visibility"



    it("responds to pressing a marker", async () => {
        const { getAllByTestId } = renderHomeScreen();
    
        // Wait for markers
        await waitFor(() => {
            const markers = getAllByTestId("marker");
            expect(markers.length).toBeGreaterThan(0);
        });
    
        const markers = getAllByTestId("marker");
    
        // Simulate pressing the first marker
        fireEvent.press(markers[0]);
        
        // keeeps saying im tryna log after tests
        // nvm this had NOTHING to do with that
        await waitFor(() => {
            const markers = getAllByTestId("marker");
            expect(markers.length).toBeGreaterThan(0);
            expect(markers.some(marker => marker.props.title === "1005 Idlewilde Boulevard")).toBeTruthy();
        });
    });


}); // end description
