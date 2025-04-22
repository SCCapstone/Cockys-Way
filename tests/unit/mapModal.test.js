import React from "react";
import { render, screen, waitFor, fireEvent  } from "@testing-library/react-native";
import HomeScreen from "../../app/(tabs)";
import { ThemeContext } from "../../ThemeContext";
import { CategoryVisibilityContext } from "../../app/CategoryVisibilityContext"; // need this bc otherwise its annoying
// npm --trace-deprecation test -- mapModal
import { flatten } from "react-native/Libraries/StyleSheet/StyleSheet";
import { act } from "react-test-renderer";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Location from "expo-location";
import * as firestore from "firebase/firestore";


/*
        Keeping comments in case working on other tests breaks something
        so I can go back to the start if necessary -Chloe

*/






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

jest.mock("../../app/CategoryVisibilityContext", () => {
  const React = require("react");
  const actual = jest.requireActual("../../app/CategoryVisibilityContext");
  return {
    ...actual,
    CategoryVisibilityContext: React.createContext({
      categoryVisibility: {
        9492: true,
        23396: true,
      },
      isInitialized: true,
    }),
    useCategoryVisibility: () => ({
      categoryVisibility: {
        9492: true,
        23396: true,
      },
      isInitialized: true,
    }),
  };
});

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

jest.mock("../../FirebaseConfig", () => {
  return {
    FIREBASE_AUTH: {
      currentUser: { uid: "test-user" },
    },
    FIRESTORE_DB: {},
  };
});

//jest.mock("expo-location", () => ({
//  requestForegroundPermissionsAsync: jest.fn(),
//  getCurrentPositionAsync: jest.fn(),
//}));
jest.mock("expo-location", () => ({
    requestForegroundPermissionsAsync: jest.fn(() =>
      Promise.resolve({ status: "granted" })
    ),
    getCurrentPositionAsync: jest.fn(() =>
      Promise.resolve({
        coords: { latitude: 34.0004, longitude: -81.0359 },
      })
    ),
  }));

jest.mock("react-native-maps", () => {
  const React = require("react");
  const { View } = require("react-native");
  const MockMapView = React.forwardRef((props, ref) => {
    const mockAnimateToRegion = jest.fn();
    React.useImperativeHandle(ref, () => ({
      animateToRegion: mockAnimateToRegion,
    }));

    return (
      <View
        {...props}
        ref={ref}
        testID="map-view"
        customMapStyle={props.customMapStyle}
      >
        {props.children}
      </View>
    );
  });

  return {
    __esModule: true,
    default: MockMapView,
    Marker: (props) => (
      <View
        testID="marker"
        onPress={props.onPress}
        title={props.title}
        description={props.description}
        pinColor={props.pinColor}
      >
        {props.children}
      </View>
    ),
    PROVIDER_GOOGLE: "google",
  };
});

jest.mock("@expo/vector-icons/FontAwesome", () => {
  const { View, Text } = require("react-native");
  const MockIcon = (props) => (
    <View testID={props.testID || "font-awesome-icon"}>
      <Text>{props.name}</Text>
    </View>
  );
  MockIcon.isLoaded = true;
  return MockIcon;
});

jest.mock("expo-font", () => ({
  useFonts: jest.fn(() => [true, null]),
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  getDocs: jest.fn(() =>
    Promise.resolve({
      docs: [
        {
          id: "1",
          data: () => ({
            title: "1000 Catawba Street",
            catId: 9492,
            description:
              "Alternate Names: 1000 Catawba St, Columbia, SC 29201, USA, 1000, Catawba Street, Olympia-Granby, Columbia, Richland County, South Carolina, United States, 29201, 5706",
            id: 223277,
            latitude: 33.987514,
            latitudeDelta: 0.000001,
            longitude: -81.03051,
            longitudeDelta: 0.000001,
          }),
        },
        {
          id: "2",
          data: () => ({
            title: "1005 Idlewilde Boulevard",
            catId: 23396,
            description:
              "Alternate Names: 1005 Idlewilde Blvd, Columbia, SC 29201, USA, 1005, Idlewilde Boulevard, Columbia, Richland County, South Carolina, United States, 29201, 4825",
            id: 225663,
            latitude: 33.966026,
            latitudeDelta: 0.000001,
            longitude: -81.009964,
            longitudeDelta: 0.000001,
          }),
        },
        {
          id: "3",
          data: () => ({
            title: "1027 Barnwell St. (University Foundations)",
            catId: 23396,
            description:
              "Alternate Names: 1027 Barnwell St, Columbia, SC 29201, USA, 1027, Barnwell Street, University Hill, Columbia, Richland County, South Carolina, United States, 29201, 3801",
            id: 223347,
            latitude: 34.002277,
            latitudeDelta: 0.000001,
            longitude: -81.023407,
            longitudeDelta: 0.000001,
          }),
        },
      ],
    })
  ),
  getDoc: jest.fn(() =>
    Promise.resolve({ exists: () => false, data: () => ({}) })
  ),
  updateDoc: jest.fn(() => Promise.resolve()),
  addDoc: jest.fn(() => Promise.resolve({ id: "mock-id" })),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(() => Promise.resolve()),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("react-native-elements", () => {
  const { View } = require("react-native");
  return {
    Icon: () => <View testID="icon" />,
  };
});












// For Testing the Modal in HomeScreen. Namely, the Info Modal
describe("HomeScreen Modal Tests", () => {
  const theme = {
    colors: {
      text: "#000000",
      garnetWhite: "#FFFFFF",
      card: "#F5F5F5",
    },
  };

  const mockCategoryVisibility = {
    categoryVisibility: {
      9492: true,
      23396: false,
    },
    isInitialized: true,
  };
  
  const mockPush = jest.fn();

  beforeEach(() => {
      jest.clearAllMocks();
      useRouter.mockReturnValue({ push: mockPush });
      useLocalSearchParams.mockReturnValue({});
  
      Location.requestForegroundPermissionsAsync.mockResolvedValue({
        status: "granted",
      });
      Location.getCurrentPositionAsync.mockResolvedValue({
        coords: { latitude: 34.0004, longitude: -81.0359 },
      });
    });
  
    const renderHomeScreen = (props = {}) => {
      return render(
        <ThemeContext.Provider value={{ theme: mockTheme }}>
          <CategoryVisibilityContext.Provider value={mockCategoryVisibility}>
            <HomeScreen {...props} />
          </CategoryVisibilityContext.Provider>
        </ThemeContext.Provider>
      );
    };

  it("renders the '+' symbol and the map-marker icon correctly", async () => {
    const { getByText, getByTestId, findByTestId } = render(
      <ThemeContext.Provider value={{ theme }}>
        <CategoryVisibilityContext.Provider value={mockCategoryVisibility}>
          <HomeScreen />
        </CategoryVisibilityContext.Provider>
      </ThemeContext.Provider>
    );

    // Open the modal
    //const infoButton = getByTestId("infoButton"); //changed
    const infoButton = await findByTestId("infoButton");
    //infoButton.props.onPress();
    fireEvent.press(infoButton);

    // Check if the "+" symbol is rendered
    //expect(getByText("+")).toBeTruthy();

    const plusText = await findByTestId("plus-symbol");
    const plusStyle = Array.isArray(plusText.props.style)
        ? Object.assign({}, ...plusText.props.style.filter(Boolean))
        : plusText.props.style ?? {};

        expect(plusStyle.marginLeft).toBe(2);

    // Check if the map-marker icon is rendered
    const mapMarkerIcon = getByTestId("map-marker-icon");
    expect(mapMarkerIcon).toBeTruthy();
  });

  it("ensures the '+' symbol is aligned correctly with the map-marker icon", async () => {
    const { findByTestId, getByText, getAllByText } = render(
        <ThemeContext.Provider value={{ theme }}>
          <CategoryVisibilityContext.Provider value={mockCategoryVisibility}>
            <HomeScreen />
          </CategoryVisibilityContext.Provider>
        </ThemeContext.Provider>
      );
    
      const infoButton = await findByTestId("infoButton");
      fireEvent.press(infoButton); // simulate user interaction
    
    //  const mapMarkerIcon = await findByTestId("map-marker-icon");
      const mapMarkerWrapper = await findByTestId("map-marker-icon");
    //  const plusTexts = getAllByText("+");
    //  const plusText = plusTexts[0]; // these 3 commented out 4/22
      //const plusText = getByText("+");
      const plusText = await findByTestId("plus-symbol");
    
      // Handle potentially array-based style
    //  const mapMarkerStyle = Array.isArray(mapMarkerIcon.props.style)
    //    ? Object.assign({}, ...mapMarkerIcon.props.style)
    //    : mapMarkerIcon.props.style;

//    const iconStyle = Array.isArray(mapMarkerIcon.props.style)
//        ? Object.assign({}, ...mapMarkerIcon.props.style)
//        : mapMarkerIcon.props.style;
/*
console.log("mapMarkerIcon style:", mapMarkerIcon.props.style);
        const iconStyleRaw = mapMarkerIcon.props?.style ?? {};
        const iconStyle = Array.isArray(iconStyleRaw)
        ? Object.assign({}, ...iconStyleRaw.filter(Boolean)) // filter out undefined/null/false
        : iconStyleRaw || {};
    
      const plusStyle = Array.isArray(plusText.props.style)
        ? Object.assign({}, ...plusText.props.style)
        : plusText.props.style;

        console.log("📦 iconStyle:", iconStyle);
    
      //expect(mapMarkerStyle.marginRight).toBe(2);
      //expect(iconStyle.marginRight).toBe(2);
      expect(iconStyle).toHaveProperty("marginRight", 2);
      expect(plusStyle.marginLeft).toBe(2);
      */
      const iconStyleRaw = mapMarkerWrapper.props?.style ?? {};
      const iconStyle = Array.isArray(iconStyleRaw)
        ? Object.assign({}, ...iconStyleRaw.filter(Boolean))
        : iconStyleRaw;
      
      const plusStyleRaw = plusText.props?.style ?? {};
      const plusStyle = Array.isArray(plusStyleRaw)
        ? Object.assign({}, ...plusStyleRaw.filter(Boolean))
        : plusStyleRaw;
      
      expect(iconStyle.marginRight).toBe(2);
      expect(plusStyle.marginLeft).toBe(2);
      
    
    
    /*const { getByText, getByTestId } = render(
      <ThemeContext.Provider value={{ theme }}>
        <CategoryVisibilityContext.Provider value={mockCategoryVisibility}>
          <HomeScreen />
        </CategoryVisibilityContext.Provider>
      </ThemeContext.Provider>
    );

    // Open the modal
    const infoButton = getByTestId("infoButton"); // changed
    infoButton.props.onPress();

    // Check alignment
    const mapMarkerIcon = getByTestId("map-marker-icon");
    const plusText = getByText("+");

    expect(mapMarkerIcon.props.style.marginRight).toBe(2); // Ensure spacing is correct
    expect(plusText.props.style.marginLeft).toBe(2); // Ensure spacing is correct
  */
});

  it("renders the modal content correctly", async () => {
    const { getByText, getByTestId } = render(
      <ThemeContext.Provider value={{ theme }}>
        <CategoryVisibilityContext.Provider value={mockCategoryVisibility}>
          <HomeScreen />
        </CategoryVisibilityContext.Provider>
      </ThemeContext.Provider>
    );

    // Open the modal
    const infoButton = await waitFor(() => getByTestId("infoButton")); // Corrected await usage
    //infoButton.props.onPress();

    // Open the modal
    fireEvent.press(infoButton);

    // Check if the modal content is rendered
    expect(getByText("Button Information")).toBeTruthy();
    //expect(getByText(" Add Custom Pin Icon - Add a custom pin to the map")).toBeTruthy();
    //expect(
    //    getByText((content, element) => {
    //      return (
    //        content.includes("Add Custom Pin Icon - Add a custom pin to the map") &&
    //        element.type === "Text"
    //      );
    //    })
    //).toBeTruthy();
    expect(
        getByText(/Add Custom Pin Icon - Add a custom pin to the map/)
    ).toBeTruthy();

});

  it("matches the modal snapshot", () => {
    const tree = render(
      <ThemeContext.Provider value={{ theme }}>
        <CategoryVisibilityContext.Provider value={mockCategoryVisibility}>
          <HomeScreen />
        </CategoryVisibilityContext.Provider>
      </ThemeContext.Provider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});