describe("Blackboard Courses for Day", () => {
    it("given a day as a date and a list of blackboard events, returns the events held that day", () => {
        const { getBlackboardEventsForDay } = require("../../app/(tabs)/schedule");
        const events = [
            {
                "description": "", 
                "end": "2025-03-04T16:26:34.000Z", 
                "location": null, 
                "start": "2025-03-04T16:26:34.000Z", 
                "summary": "Midterm"
            },
            {
                "description": null, 
                "end": "2024-04-16T03:59:00.000Z", 
                "location": null, 
                "start": "2024-04-16T03:59:00.000Z", 
                "summary": "Program 5"
            },
            {
                "description": null, 
                "end": "2025-03-27T03:59:00.000Z", 
                "location": null, 
                "start": "2025-03-27T03:59:00.000Z", 
                "summary": "Homework-2"
            },
            {
                "description": "", 
                "end": "2025-03-26T16:30:00.000Z", 
                "location": null, 
                "start": "2025-03-26T16:30:00.000Z", 
                "summary": "Exercise-3"
            }
        ];
        expect(getBlackboardEventsForDay("2025-03-04", events)).toEqual(["Midterm (11:26 AM)"]);
        expect(getBlackboardEventsForDay("2024-04-15", events)).toEqual(["Program 5 (11:59 PM)"]);
        expect(getBlackboardEventsForDay("2024-04-26", events)).toEqual([]);
        expect(getBlackboardEventsForDay("2025-03-26", events)).toEqual(["Homework-2 (11:59 PM)", "Exercise-3 (12:30 PM)"]);
    })
})