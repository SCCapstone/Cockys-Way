import React, { createContext, useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "./FirebaseConfig";

export const ThemeContext = createContext();

const customLightTheme = {
  dark: false,
  colors: {
    primary: "#73000A", // garnet
    background: "#FFFFFF", // white
    card: "#F2F2F2", // light gray
    text: "#000000", // black text
    border: "#E0E0E0", // light border
    notification: "#73000A", // match primary
  },
};

const customDarkTheme = {
  dark: true,
  colors: {
    primary: "#73000A", // dark version still using garnet
    background: "#757474", // deep dark background
    card: "#2C2C2C", // card/drawer background
    text: "#E0E0E0", // white text
    border: "#5a5a5a", // darker border
    notification: "#FF8A80", // lighter red
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadThemeFromFirestore = async () => {
      const user = getAuth().currentUser;
      if (!user) {
        setIsLoaded(true);
        return;
      }

      try {
        const docRef = doc(FIRESTORE_DB, "settings", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userSettings = docSnap.data().settings;
          if (userSettings?.theme === "dark") {
            setIsDarkTheme(true);
          }
        }
      } catch (error) {
        console.error("Error loading theme from Firestore:", error);
      }

      setIsLoaded(true);
    };

    loadThemeFromFirestore();
  }, []);

  const theme = isDarkTheme ? customDarkTheme : customLightTheme;

  return (
    <ThemeContext.Provider
      value={{ isDarkTheme, setIsDarkTheme, theme, isLoaded }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const appDefaultTheme = customLightTheme;
