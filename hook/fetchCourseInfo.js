import { useState, useEffect } from "react";
import axios from "axios";

const fetchCourseInfo = (crn, srcdb) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  const fetch = async () => {
    if (!crn || !srcdb) return; // Prevent fetching if key or semester is missing
    setIsLoading(true);

    try {
      console.log("Fetching class details...");
      const response = await axios({
        method: "post",
        url: "https://classes.sc.edu/api/?page=fose&route=details",
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          key: `crn:${crn}`, // Assuming the API expects "crn:<key>"
          srcdb: `${srcdb}`,
        }),
      });

      // Parse the response data
      const parsedData =
        typeof response.data === "string"
          ? JSON.parse(response.data)
          : response.data;
      setData(parsedData || {});
      console.log("Class details fetched successfully!");
    } catch (error) {
      console.error("Error fetching class details:", error);
      setError(error);
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    console.log('bruh im in the useeffect')
    fetch();
  }, []); // Refetch when key or semester changes

  return { data, isLoading, isLoaded, error };
};

export default fetchCourseInfo;