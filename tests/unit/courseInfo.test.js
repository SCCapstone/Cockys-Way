import { cleanString } from "../../app/courseInfo";

describe("Course Info Page", () => {
    it("given a string formatted as if it were an html element, cleans it such that it is without html tags", () => {
        const { cleanString } = require("../../app/courseInfo");
        expect(cleanString("hello i am a string")).toBe("hello i am a string");
        expect(cleanString("<p>hello i am a paragraph</p>")).toBe("hello i am a paragraph");
        expect(cleanString('<li class="some-class">list item with a <a id="some-id">link</a></li>')).toBe("list item with a link");
        expect(cleanString('<img src="http://somewebsite.com" width="300" height="100" />')).toBe("");
    })
})