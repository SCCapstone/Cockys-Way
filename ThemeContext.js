import React, { createContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "./FirebaseConfig";
import * as SplashScreen from "expo-splash-screen";

export const ThemeContext = createContext();

const customLightTheme = {
  dark: false,
  colors: {
    primary: "#73000A", // garnet
    garnetWhite: "#73000A",
    background: "#FFFFFF", // white
    card: "#F2F2F2", // light gray
    text: "#000000", // black text
    border: "#E0E0E0", // light border
    notification: "#73000A", // match primary
    alwaysWhite: "#FFFFFF", // white
    placeholder: "#A9A9A9", // light gray placeholder
    lightGarnet: "#D5B4BA", // light garnet
    disabledDay: "#B6BCC2" // very light gray
  },
};

const customDarkTheme = {
  dark: true,
  colors: {
    primary: "#73000A", // dark version still using garnet
    garnetWhite: "#FFFFFF",
    background: "#757474", // deep dark background
    card: "#2C2C2C", // card/drawer background
    text: "#E0E0E0", // white text
    border: "#5a5a5a", // darker border
    notification: "#FF8A80", // lighter red
    alwaysWhite: "#FFFFFF", // white
    placeholder: "#A9A9A9", // light
    lightGarnet: "#9C6B70", // light garnet
    disabledDay: "#75797D" // darker gray
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (!user) {
        setIsLoaded(true);
        await SplashScreen.hideAsync();
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
      await SplashScreen.hideAsync();
    });

    return () => unsubscribe();
  }, []);

  const theme = isDarkTheme ? customDarkTheme : customLightTheme;

  return (
    <ThemeContext.Provider
      value={{ isDarkTheme, setIsDarkTheme, theme, isLoaded }}
    >
      {isLoaded ? children : null}
    </ThemeContext.Provider>
  );
};
