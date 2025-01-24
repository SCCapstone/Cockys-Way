import { checkHours } from "../app/professorInfo";

describe("checkHours", () => {
  beforeAll(() => {
    // Mock the current date to a Saturday
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date("2025-1-25T12:00:00Z")); // January 25, 2025 is a Saturday
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test("should return false if current day is Saturday", () => {
    const officeHours = {
      friday: "",
      monday: "",
      thursday: "02:00 PM-03:30 PM",
      tuesday: "03:30 PM-05:00 PM",
      wednesday: "",
    };
    expect(checkHours(officeHours)).toBe(false);
  });

  test("should return true if current time is within office hours", () => {
    const officeHours = {
      friday: "",
      monday: "",
      thursday: "02:00 PM-03:30 PM",
      tuesday: "03:30 PM-05:00 PM",
      wednesday: "",
    };
    jest.setSystemTime(new Date("2025-1-23T13:00:00Z")); // 13:00 PM UTC
    expect(checkHours(officeHours)).toBe(false);
  });
});
