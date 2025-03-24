import { formatName } from "../../app/(tabs)/directory";

describe("formatName utility", () => {
  it("formats 'Last First' to 'First Last'", () => {
    expect(formatName("Doe John")).toBe("John Doe");
  });

  it("formats 'Last, First' to 'First Last'", () => {
    expect(formatName("Abreu, Whitney")).toBe("Whitney Abreu");
  });

  it("strips suffixes and formats correctly", () => {
    expect(formatName("Abshire, Demetrius A., PhD, RN")).toBe("Demetrius Abshire");
  });

  it("handles simple comma-separated names", () => {
    expect(formatName("Malone, Ryan")).toBe("Ryan Malone");
  });

  it("returns input if name is empty or null", () => {
    expect(formatName("")).toBe("");
    expect(formatName(null)).toBe("");//changed null to ""
    expect(formatName(undefined)).toBe("");//changed from undefined to ""
  });
});
