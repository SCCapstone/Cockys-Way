import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import HomeScreen from "../../app/(tabs)";
import { Marker } from "react-native-maps";

// Mocking the map reference
jest.mock("react-native-maps", () => ({
    ...jest.requireActual("react-native-maps"),
    Marker: jest.fn(),
    MapView: jest.fn().mockImplementation(({ children }) => children),
}));

describe("onMarkerSelected", () => {
    it("should animate to marker's region", () => {
        const mockAnimateToRegion = jest.fn();
        const mockMarker = {
            description: "Test Description",
            title: "Test Marker",
            latitude: 34.00039991787572,
            longitude: -81.03594096158815,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
            color: "blue"
        };

        const { getByText } = render(<HomeScreen />);
        const mapRef = { current: { animateToRegion: mockAnimateToRegion } };
        fireEvent.press(getByText('Test Marker'));
        
        expect(mockAnimateToRegion).toHaveBeenCalledWith(
            expect.objectContaining({
                latitude: mockMarker.latitude,
                longitude: mockMarker.longitude,
            })
        );
    });
});