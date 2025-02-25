import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    backgroundColor: "white",
    borderBottomColor: "transparent",
    borderTopColor: "transparent",
  },
  searchInputContainer: {
    backgroundColor: "#EDEDED",
  },
  map: {
    flex: 1,
  },
  filterButton: {
    backgroundColor: "#e2e2e2",
    padding: 5,
    borderRadius: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "black",
    width: 40,
    height: 35,
  },
  historyButton: {
    backgroundColor: "#e2e2e2",
    padding: 5,
    borderRadius: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "black",
    width: 40,
    height: 35,
  },
  trafficButton: {
    backgroundColor: "#e2e2e2",
    padding: 5,
    borderRadius: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "black",
    width: 40,
    height: 35,
  },
  travelModeOverlay: {
    position: "absolute",
    top: 130,
    left: 12,
    backgroundColor: "white",
    borderRadius: 5,
    padding: 5,
    elevation: 5,
  },
  travelModeButton: {
    padding: 3,
    borderRadius: 5,
    backgroundColor: "#e2e2e2",
    marginVertical: 5,
  },
  activeTravelMode: {
    backgroundColor: "#aaaaaa",
  },
  travelModeText: {
    color: "black",
  },
  routeDetailsContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    elevation: 5,
  },
  routeDetailsText: {
    fontSize: 15,
    marginBottom: 5,
  },
  routeButton: {
    backgroundColor: "#e2e2e2",
    padding: 5,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  routeButtonText: {
    color: "black",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-center",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 5,
    marginVertical: 10,
  },
  routeButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
