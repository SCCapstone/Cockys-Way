import "dotenv/config"; // Ensure you have dotenv installed to use .env files

export default {
  expo: {
    name: "Cockys-Way",
    slug: "cockys-way",
    newArchEnabled: true,
    version: "1.0.0",
    scheme: "cockysway",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#E6E9EC",
      },
      package: "com.ryanmalone.CockysWay",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_API_KEY,
        },
      },
      googleServicesFile: "./google-services.json",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      eas: {
        projectId: "25d82025-901e-4d91-84eb-966383bd4984",
      },
    },
    owner: "cockys-way",
    plugins: ["expo-font"],
  },
};
