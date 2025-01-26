import { getInfo } from "../app/addClassSearchResults";

describe("getInfo", () => {
    test("given no subject and semester, data from getInfo(subject, semester) should return an empty array", () => {
        expect(getInfo("", null).data).toBe([]);
    });
});