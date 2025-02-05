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
  },
  filterButtonText: {
    color: "black",
    fontSize: 16,
  },
  travelModeOverlay: {
    position: "absolute",
    top: 170,
    left: 12,
    backgroundColor: "white",
    borderRadius: 5,
    padding: 5,
    elevation: 5,
  },
  travelModeButton: {
    padding: 5,
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
  changeStartButton: {
    backgroundColor: "#e2e2e2",
    padding: 5,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  changeStartButtonText: {
    color: "black",
    fontSize: 16,
  },
  stopButton: {
    backgroundColor: "#73000a",
    padding: 5,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  stopButtonText: {
    color: "white",
    fontSize: 16,
  },
  trafficButton: {
    backgroundColor: "#e2e2e2",
    padding: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  trafficButtonText: {
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
});
