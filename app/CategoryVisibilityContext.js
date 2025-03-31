// Using this for Pin Filters for the Map

import React, { createContext, useState, useEffect } from "react";

export const CategoryVisibilityContext = createContext();

export const CategoryVisibilityProvider = ({ children, markers }) => {
  const [categoryVisibility, setCategoryVisibility] = useState({});
  const [isInitialized, setIsInitialized] = useState(false); // changing it so default shown categories are from here

  useEffect(() => {
    const initializeVisibility = () => {
      //  console.log("Initializing category visibility..."); // Debugging
      const initialVisibility = {};

      // make just colleges & schools shown by default
      const collegesAndSchoolsCatIds = [
        24560, 24912, 24903, 24904, 24905, 24914, 24907, 24902, 24908, 24906,
        24909, 24910, 24911, 24913, 24901,
      ];

      collegesAndSchoolsCatIds.forEach((id) => {
        initialVisibility[id] = true; // Colleges & Schools visible
      });

      // set others to hidden
      if (markers && markers.length > 0) {
        markers.forEach((marker) => {
          if (!collegesAndSchoolsCatIds.includes(marker.catId)) {
            initialVisibility[marker.catId] = false; // Hidden
          }
        });
      } //else {
      //  console.warn("Markers array is empty or undefined."); // Debugging
      //}

      setCategoryVisibility(initialVisibility);
      setIsInitialized(true); // Initialization should be DONE.
      // console.log("Category visibility initialized:", initialVisibility); // debug
    };
    //console.log("Initialized 2: ", isInitialized);    // Debugging

    if (!isInitialized) {
      initializeVisibility();
    }
  }, [markers, isInitialized]);

  // Log `isInitialized` whenever it changes
  useEffect(() => {
    // console.log("isInitialized updated:", isInitialized);
  }, [isInitialized]);

  return (
    <CategoryVisibilityContext.Provider
      value={{ categoryVisibility, setCategoryVisibility, isInitialized }}
    >
      {children}
    </CategoryVisibilityContext.Provider>
  );
};

export default CategoryVisibilityProvider;
