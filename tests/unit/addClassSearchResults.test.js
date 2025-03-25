// Mock FirebaseConfig before class component imports it
jest.mock("../../FirebaseConfig", () => ({
  FIREBASE_DB: {},
}));

import { getInfo } from "../../app/addClassSearchResults";
import fetchInfo from "../../hook/fetchCourseList";

// this will speicfy that here is a mock for fetchInfo
jest.mock("../../hook/fetchCourseList");

describe("getInfo", () => {
  test("should call fetchCourseList with the correct parameters to get data", () => {
    const subject = "CSCE";
    const semester = 202408;

    // fetchInfo mocked to return a specific value
    fetchInfo.mockReturnValue({ data: [] });

    // call the getInfo function
    const result = getInfo(subject, semester);

    // makes sure that getInfo called fetchInfo with the same parameters that we had passed it
    expect(fetchInfo).toHaveBeenCalledWith(subject, semester);

    // make sure that the result is an empty array
    expect(result).toEqual({ data: [] });
  });

  test("should return an array with data when fetchInfo is successful", () => {
    const subject = "CSCE";
    const semester = 202408;

    // Mock the return value of fetchInfo to return a specific array
    fetchInfo.mockReturnValue({ data: [{ id: 1, name: "Testing the name" }] });

    // Call the getInfo function and verify it returns the expected array
    const result = getInfo(subject, semester);
    expect(result).toEqual({ data: [{ id: 1, name: "Testing the name" }] });
  });
});
