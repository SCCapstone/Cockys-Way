import { useState, useEffect } from "react";
import axios from "axios";

const fetchInfo = (subject, semester) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  // We will have to change this to take in a subject as a parameter
  // (or other parameters that the api supports)
  const fetch = async () => {
    setIsLoading(true);
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
      setData(parsedData.results || []);
      console.log("Fetch successful:");
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error);
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  // Return the data
  return { data, isLoading, isLoaded, error };
};

export default fetchInfo;
