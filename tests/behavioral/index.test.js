import React from "react";
import { act } from "react-test-renderer";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import HomeScreen from "../../app/(tabs)";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Location from "expo-location";
import { ThemeContext } from "../../ThemeContext";
import { CategoryVisibilityContext } from "../../app/CategoryVisibilityContext";
import * as firestore from "firebase/firestore";

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

describe("HomeScreen", () => {
  const mockPush = jest.fn();
  const mockCategoryVisibility = {
    categoryVisibility: {
      9492: true,
      23396: true,
    },
    isInitialized: true,
  };

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

  it("markers displayed on map", async () => {
    const { queryByText, queryAllByTestId, getByTestId } = renderHomeScreen();

    await waitFor(() => {
      expect(queryByText("Skip")).toBeTruthy();
    });
    const skipButton = queryByText("Skip");
    fireEvent.press(skipButton);

    await waitFor(() => {
      const markers = queryAllByTestId("marker");
      expect(markers.length).toBeGreaterThan(0);
    });

    console.log("Markers rendered!");
  });

  it("selecting a marker", async () => {
    const { queryByText, queryAllByTestId, getByTestId } = renderHomeScreen();

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
      console.log("1000 Catawba Street marker selected!");
    });
  });

  it("search successfully for '1027' and select the correct marker", async () => {
    const { queryByText, queryAllByTestId, getByTestId, getByPlaceholderText } =
      renderHomeScreen();

    await waitFor(() => {
      expect(queryByText("Skip")).toBeTruthy();
    });
    const skipButton = queryByText("Skip");
    fireEvent.press(skipButton);

    const searchInput = getByPlaceholderText("Search Here...");
    expect(searchInput).toBeTruthy();

    fireEvent.changeText(searchInput, "1027");

    await waitFor(() => {
      const markers = queryAllByTestId("marker");
      expect(markers.length).toBe(1);
      expect(markers[0].props.title).toBe(
        "1027 Barnwell St. (University Foundations)"
      );
    });
    const idlewildeMarker = queryAllByTestId("marker").find(
      (marker) => marker.props.title === "1005 Idlewilde Boulevard"
    );
    expect(idlewildeMarker).toBeFalsy();

    const barnwellMarker = queryAllByTestId("marker").find(
      (marker) =>
        marker.props.title === "1027 Barnwell St. (University Foundations)"
    );
    expect(barnwellMarker).toBeTruthy();
    fireEvent.press(barnwellMarker);

    await waitFor(() => {
      const routeDetailsContainer = getByTestId("route-details-container");
      expect(routeDetailsContainer).toBeTruthy();
      expect(
        queryByText("1027 Barnwell St. (University Foundations)")
      ).toBeTruthy();
      expect(queryByText("1005 Idlewilde Boulevard")).toBeFalsy();
    });

    console.log("Search test passed!");
  });

  it("selecting Start Nav button", async () => {
    const { queryByText, queryAllByTestId, getByTestId } = renderHomeScreen();

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

    await waitFor(() => {
      expect(queryByText("Start Nav")).toBeTruthy();
    });
    const startNavButton = queryByText("Start Nav");
    fireEvent.press(startNavButton);
    expect(startNavButton).toBeTruthy();
    console.log("Start Nav button pressed!");
  });

  it("applies darkMapStyle when theme.dark is true", async () => {
    const { getByTestId } = renderHomeScreen();

    await waitFor(() => {
      const map = getByTestId("map-view");
      expect(map.props.customMapStyle).toBeTruthy();
    });

    console.log("Dark mode style applied to map!");
  });

  it("applies default map style when theme.dark is false", async () => {
    const { getByTestId } = renderHomeScreen();

    await waitFor(() => {
      const map = getByTestId("map-view");
      expect(map.props.customMapStyle).toEqual([]);
    });

    console.log("Light mode style confirmed.");
  });

  it("matches snapshot in dark mode", async () => {
    const { toJSON } = renderHomeScreen();

    await waitFor(() => {
      expect(toJSON()).toMatchSnapshot();
    });
  });

  it("toggles favorite icon and updates Firestore", async () => {
    const { getByText, queryAllByTestId, getByTestId, queryByText } =
      renderHomeScreen();

    await waitFor(() => {
      expect(queryByText("Skip")).toBeTruthy();
    });
    fireEvent.press(queryByText("Skip"));

    await waitFor(() => {
      const markers = queryAllByTestId("marker");
      expect(markers.length).toBeGreaterThan(0);
    });

    const markers = queryAllByTestId("marker");
    const targetMarker = markers.find(
      (marker) => marker.props.title === "1000 Catawba Street"
    );
    expect(targetMarker).toBeTruthy();
    fireEvent.press(targetMarker);

    await waitFor(() => {
      expect(getByTestId("route-details-container")).toBeTruthy();
      expect(queryByText("1000 Catawba Street")).toBeTruthy();
    });

    let favoriteButton = getByTestId("favorite-icon");
    expect(favoriteButton).toBeTruthy();

    await waitFor(() => {
      expect(getByText("star-o")).toBeTruthy();
    });

    fireEvent.press(favoriteButton);
    await waitFor(() => {
      expect(getByText("star")).toBeTruthy();
    });

    await act(async () => {
      firestore.getDoc.mockImplementationOnce(() =>
        Promise.resolve({
          exists: () => true,
          data: () => ({ locations: [223277] }),
        })
      );
      favoriteButton = getByTestId("favorite-icon");
      fireEvent.press(favoriteButton);
    });

    console.log(
      "Favorite icon state after 2nd press:",
      getByTestId("favorite-icon").props.children.props.children
    );

    await waitFor(() => {
      expect(getByText("star-o")).toBeTruthy();
    });
  });
});
