import axios from "axios";
// dont use useState/useEffect or doesnt work with addClassSearch

// changed to be async
const fetchCourseList = async (subject, semester) => {

  // We will have to change this to take in a subject as a parameter
  // (or other parameters that the api supports)
    // Fetching
    try {
      console.log("Fetching data...");
      const response = await axios({
        method: "post",
        maxBodyLength: Infinity,
        url: `https://classes.sc.edu/api/?page=fose&route=search&subject=${subject}`,
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          other: {
            srcdb: `${semester}`,
          },
          criteria: [
            {
              field: "subject",
              value: `${subject}`,
            },
          ],
        }),
      });

      // Parse the data
      const parsedData =
        typeof response.data === "string"
          ? JSON.parse(response.data)
          : response.data;
      

      console.log("Fetch successful:", parsedData.results);

      return { data: parsedData.results || [] }; // must ALWAYS return SOMETHING

    } catch (error) {
      console.error("Error fetching data:", error);
      return { data: [] };
    }

  };




export default fetchCourseList;
