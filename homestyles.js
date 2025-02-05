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
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    width: 200,
    height: 30,
    borderRadius: 25,
    backgroundColor: "#e2e2e2",
    marginVertical: 10,
  },
  filterButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  travelModeOverlay: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    elevation: 5,
  },
  travelModeButton: {
    padding: 10,
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
    padding: 15,
    borderRadius: 10,
    elevation: 5,
  },
  routeDetailsText: {
    fontSize: 16,
    marginBottom: 5,
  },
  changeStartButton: {
    backgroundColor: "#e2e2e2",
    padding: 10,
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
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  stopButtonText: {
    color: "white",
    fontSize: 16,
  },
});
