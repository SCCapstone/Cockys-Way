import { formatName } from "../../app/(tabs)/directory";

describe("Directory Page", () => {
  it("Formats names correctly so it goes first last", () => {
    const { formatName } = require("../../app/(tabs)/directory");
    expect(formatName("Doe John")).toBe("John Doe");
    expect(formatName("Abreu, Whitney")).toBe("Whitney Abreu");
    expect(formatName("Abshire, Demetrius A., PhD, RN")).toBe(
      "Demetrius Abshire"
    );
    expect(formatName("Malone, Ryan")).toBe("Ryan Malone");
  });
});
