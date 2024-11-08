import { useState, useEffect } from "react";
import axios from "axios";

const fetchInfo = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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
        url: "https://classes.sc.edu/api/?page=fose&route=search&subject=CSCE",
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          other: {
            srcdb: "999999",
          },
          criteria: [
            {
              field: "subject",
              value: "CSCE",
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
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  // Return the data
  return { data, isLoading, error };
};

export default fetchInfo;
