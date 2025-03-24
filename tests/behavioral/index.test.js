import React from "react";
import {act} from 'react-test-renderer';  
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import HomeScreen from "../../app/(tabs)";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Location from "expo-location";
import { ThemeContext } from "../../ThemeContext";


const mockTheme = {
  colors: {
    text: "#000000",
    garnetWhite: "#FFFFFF",
  },
};

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

jest.mock("../../FirebaseConfig", () => ({
  FIREBASE_AUTH: {
    currentUser: null,
  },
  FIRESTORE_DB: {
    collection: jest.fn(),
  },
}));

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
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
      <View {...props} ref={ref} testID="map-view" customMapStyle={props.customMapStyle}>
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
  const { View } = require("react-native");
  const MockIcon = () => <View testID="font-awesome-icon" />;
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
  updateDoc: jest.fn(),
  addDoc: jest.fn(() => Promise.resolve({ id: "mock-id" })),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("react-native-elements", () => {
  const { View, TextInput } = require("react-native");
  return {
    SearchBar: (props) => (
      <View testID="search-bar">
        <TextInput
          testID="search-bar-input"
          placeholder={props.placeholder}
          onChangeText={props.onChangeText}
          value={props.value}
        />
      </View>
    ),
    Icon: () => <View testID="icon" />,
  };
});

describe("HomeScreen", () => {
  const mockPush = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({ push: mockPush });
  });

  useLocalSearchParams.mockReturnValue({});

  Location.requestForegroundPermissionsAsync.mockResolvedValue({
    status: "granted",
  });
  Location.getCurrentPositionAsync.mockResolvedValue({
    coords: { latitude: 34.0004, longitude: -81.0359 },
  });

  // test markers are displayed and selectable
  it("markers displayed on map", async () => {
    const { queryByText, queryAllByTestId, getByTestId } = render(
      <ThemeContext.Provider value={{ theme: mockTheme }}>
        <HomeScreen />
      </ThemeContext.Provider>
    );

    // make sure to skip tutorial
    await waitFor(() => {
      expect(queryByText("Skip")).toBeTruthy();
    });
    const skipButton = queryByText("Skip");
    fireEvent.press(skipButton);

    // make sure markers are rendered
    await waitFor(() => {
      const markers = queryAllByTestId("marker");
      expect(markers.length).toBeGreaterThan(0);
    });

    console.log("Markers rendered!");
  });

  it("selecting a marker", async () => {
    const { queryByText, queryAllByTestId, getByTestId } = render(
      <ThemeContext.Provider value={{ theme: mockTheme }}>
        <HomeScreen />
      </ThemeContext.Provider>
    );

    await waitFor(() => {
      expect(queryByText("Skip")).toBeTruthy();
    });
    const skipButton = queryByText("Skip");
    fireEvent.press(skipButton);

    await waitFor(() => {
      const markers = queryAllByTestId("marker");
      expect(markers.length).toBeGreaterThan(0);
    });

    // find all markers
    const markers = queryAllByTestId("marker");
    const catawbaMarker = markers.find(
      (marker) => marker.props.title === "1000 Catawba Street"
    );
    expect(catawbaMarker).toBeTruthy();
    // if worked, select 1000 Catawba Street marker
    fireEvent.press(catawbaMarker);

    // make sure route details container popped up, then look for 1000 Catawba Street marker title
    await waitFor(() => {
      const routeDetailsContainer = getByTestId("route-details-container");
      expect(routeDetailsContainer).toBeTruthy();
      expect(queryByText("1000 Catawba Street")).toBeTruthy();
      console.log("1000 Catawba Street marker selected!");
    });
  });

  it("selecting Start Nav button", async () => {
    const { queryByText, queryAllByTestId, getByTestId } = render(
      <ThemeContext.Provider value={{ theme: mockTheme }}>
        <HomeScreen />
      </ThemeContext.Provider>
    );

    await waitFor(() => {
      expect(queryByText("Skip")).toBeTruthy();
    });
    const skipButton = queryByText("Skip");
    fireEvent.press(skipButton);

    await waitFor(() => {
      const markers = queryAllByTestId("marker");
      expect(markers.length).toBeGreaterThan(0);
    });

    const markers = queryAllByTestId("marker");
    const catawbaMarker = markers.find(
      (marker) => marker.props.title === "1000 Catawba Street"
    );
    expect(catawbaMarker).toBeTruthy();
    fireEvent.press(catawbaMarker);

    await waitFor(() => {
      const routeDetailsContainer = getByTestId("route-details-container");
      expect(routeDetailsContainer).toBeTruthy();
      expect(queryByText("1000 Catawba Street")).toBeTruthy();
    });

    // look for Start Nav button
    await waitFor(() => {
      expect(queryByText("Start Nav")).toBeTruthy();
    });
    const startNavButton = queryByText("Start Nav");
    fireEvent.press(startNavButton);
    expect(startNavButton).toBeTruthy();
    console.log("Start Nav button pressed!");
  });
});

it("applies darkMapStyle when theme.dark is true", async () => {
  const { getByTestId } = render(
    <ThemeContext.Provider value={{ theme: { ...mockTheme, dark: true } }}>
      <HomeScreen />
    </ThemeContext.Provider>
  );

  await waitFor(() => {
    const map = getByTestId("map-view");
    expect(map.props.customMapStyle).toBeTruthy();
  });

  console.log("Dark mode style applied to map!");
});

it("applies default map style when theme.dark is false", async () => {
  const { getByTestId } = render(
    <ThemeContext.Provider value={{ theme: { ...mockTheme, dark: false } }}>
      <HomeScreen />
    </ThemeContext.Provider>
  );

  await waitFor(() => {
    const map = getByTestId("map-view");
    expect(map.props.customMapStyle).toEqual([]);
  });

  console.log("Light mode style confirmed.");
});

it("matches snapshot in dark mode", async () => {
  const { toJSON } = render(
    <ThemeContext.Provider value={{ theme: { ...mockTheme, dark: true } }}>
      <HomeScreen />
    </ThemeContext.Provider>
  );

  await waitFor(() => {
    expect(toJSON()).toMatchSnapshot();
  });
});
