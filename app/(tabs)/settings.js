import React, { useEffect, useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  TextInput,
  ToastAndroid,
} from "react-native";
import { useFonts, Abel_400Regular } from "@expo-google-fonts/abel";
import * as SplashScreen from "expo-splash-screen";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { router } from "expo-router";
import { getAuth } from "firebase/auth";
import { useTheme } from "@react-navigation/native";
import { ThemeContext } from "../../ThemeContext";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import CryptoJS from "crypto-js";
import { SALT } from "@env";

SplashScreen.preventAutoHideAsync();

export default function SettingsScreen() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  // hold the ics link for blackboard cal
  const [icsLink, setIcsLink] = useState("");
  const [hasChanged, setHasChanged] = useState(false);
  const [originalLink, setOriginalLink] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const firestore = getFirestore();
  const { setIsDarkTheme } = useContext(ThemeContext);

  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.background,
    },
    header: {
      fontSize: 30,
      fontWeight: "bold",
      marginBottom: 20,
      fontFamily: "Abel_400Regular",
      color: colors.text,
    },
    settingItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    accentBox: {
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 5,
      flex: 1,
    },
    accentBoxSmall: {
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 5,
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    settingText: {
      fontSize: 22.5,
      color: colors.alwaysWhite,
      fontFamily: "Abel_400Regular",
    },
    blackboardInput: {
      backgroundColor: "#fff",
      color: "#000",
      marginTop: 10,
      borderRadius: 5,
      backgroundColor: colors.card,
      color: colors.text,
      padding: 10,
    },
    saveButton: {
      marginTop: 10,
      backgroundColor: colors.alwaysWhite,
      padding: 10,
      borderRadius: 5,
    },
    saveButtonText: {
      color: colors.primary,
      textAlign: "center",
      fontFamily: "Abel_400Regular",
      fontSize: 20,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    blackboardLabel: {
      color: colors.alwaysWhite,
      fontSize: 20,
    },
    modalBackdrop: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContainer: {
      backgroundColor: colors.alwaysWhite,
      padding: 20,
      borderRadius: 10,
      maxWidth: "80%",
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: "Abel_400Regular",
      marginBottom: 10,
    },
    modalText: {
      fontSize: 16,
      fontFamily: "Abel_400Regular",
      marginBottom: 20,
    },
    modalCloseText: {
      color: colors.primary,
      textAlign: "right",
      fontSize: 16,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const user = getAuth().currentUser;
      if (user) {
        const uid = user.uid;
        const secretKey = SALT + uid;

        try {
          const userDocRef = doc(firestore, "settings", uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            const notificationsEnabled =
              data.settings?.notificationsEnabled || false;
            const theme = data.settings?.theme || "light";
            setIsEnabled(notificationsEnabled);
            setIsDarkMode(theme === "dark");

            // Decrypt the Blackboard ICS link
            const encryptedLink = data.settings?.icsLink || "";
            let decryptedLink = "";

            try {
              const bytes = CryptoJS.AES.decrypt(encryptedLink, secretKey);
              decryptedLink = bytes.toString(CryptoJS.enc.Utf8);
            } catch (e) {
              console.warn("Failed to decrypt Blackboard link.");
            }

            setIcsLink(decryptedLink);
            setOriginalLink(decryptedLink);
          } else {
            console.log("No settings document found for user.");
          }
        } catch (error) {
          console.warn("Error fetching Firestore settings: ", error);
        }
      } else {
        Alert.alert(
          "Sign In",
          "Some settings are only available to signed-in users. Please sign in to continue.",
          [
            {
              text: "Go to Login",
              onPress: () => router.push("/login"),
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
      }
    };

    fetchSettings();
  }, [firestore]);

  const toggleSwitch = async () => {
    const newState = !isEnabled;
    setIsEnabled(newState);

    const user = getAuth().currentUser;
    if (user) {
      const uid = user.uid;
      try {
        const userDocRef = doc(firestore, "settings", uid);
        await setDoc(
          userDocRef,
          { settings: { notificationsEnabled: newState } },
          { merge: true }
        );
      } catch (error) {
        console.error("Error updating Firestore settings: ", error);
      }
    } else {
      Alert.alert(
        "Sign In Required",
        "Please sign in to update your notification settings.",
        [{ text: "OK" }]
      );
    }
  };

  const toggleDarkMode = async () => {
    const newState = !isDarkMode;
    setIsDarkMode(newState);
    setIsDarkTheme(newState);

    const user = getAuth().currentUser;
    if (user) {
      const uid = user.uid;
      try {
        const userDocRef = doc(firestore, "settings", uid);
        await setDoc(
          userDocRef,
          { settings: { theme: newState ? "dark" : "light" } },
          { merge: true }
        );
      } catch (error) {
        console.error("Error updating theme preference: ", error);
      }
    } else {
      ToastAndroid.show(
        "Not signed in — changes to theme won’t be saved.",
        ToastAndroid.SHORT
      );
    }
  };

  let [fontsLoaded] = useFonts({ Abel_400Regular });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  // saves the ics link to the user's settings in firestore under settings collection
  const saveBlackboardLink = async () => {
    const user = getAuth().currentUser;
    if (user) {
      const uid = user.uid;
      const secretKey = SALT + uid;

      try {
        const encryptedLink = CryptoJS.AES.encrypt(
          icsLink,
          secretKey
        ).toString();
        const userDocRef = doc(firestore, "settings", uid);

        await setDoc(
          userDocRef,
          { settings: { icsLink: encryptedLink } },
          { merge: true }
        );

        setOriginalLink(icsLink);
        setHasChanged(false);
      } catch (error) {
        console.warn("Error saving Blackboard link: ", error);
      }
    } else {
      Alert.alert(
        "Sign In Required",
        "Please sign in to save your Blackboard link.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.header, { color: colors.text }]}>Settings</Text>

      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => {
          const user = getAuth().currentUser;
          if (user) {
            router.push("/PrivacySecurity");
          } else {
            Alert.alert(
              "Sign In Required",
              "Please sign in to access Privacy and Security settings.",
              [
                {
                  text: "Go to Login",
                  onPress: () => {
                    router.push("/login");
                  },
                },
                {
                  text: "Cancel",
                  style: "cancel",
                },
              ]
            );
          }
        }}
      >
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Privacy and Security</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => {
          const user = getAuth().currentUser;
          if (user) {
            router.push("/favLocations");
          } else {
            Alert.alert(
              "Sign In Required",
              "Please sign in to access Favorite Locations.",
              [
                {
                  text: "Go to Login",
                  onPress: () => {
                    router.push("/login");
                  },
                },
                {
                  text: "Cancel",
                  style: "cancel",
                },
              ]
            );
          }
        }}
      >
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Favorite Locations</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.settingItem}>
        <TouchableOpacity
          style={styles.accentBox}
          onPress={() => {
            const user = getAuth().currentUser;
            if (user) {
              router.push("/MyAccount");
            } else {
              Alert.alert(
                "Sign In Required",
                "Please sign in to access your account information.",
                [
                  {
                    text: "Go to Login",
                    onPress: () => {
                      router.push("/login");
                    },
                  },
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                ]
              );
            }
          }}
        >
          <Text style={styles.settingText}>My Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.accentBoxSmall}>
          <Text style={styles.settingText}>Enable Notifications</Text>
          <Switch
            accessibilityRole="switch"
            accessibilityLabel="Enable Notifications"
            trackColor={{ false: "#000000", true: "#FFFFFF" }}
            thumbColor={isEnabled ? "#F3F3F3" : "#FFFFFF"}
            ios_backgroundColor="#F3F3F3"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.accentBoxSmall}>
          <Text style={styles.settingText}>Dark Mode</Text>
          <Switch
            accessibilityRole="switch"
            accessibilityLabel="Dark Mode"
            trackColor={{ false: "#000000", true: "#FFFFFF" }}
            thumbColor={isDarkMode ? "#F3F3F3" : "#FFFFFF"}
            ios_backgroundColor="#F3F3F3"
            onValueChange={toggleDarkMode}
            value={isDarkMode}
          />
        </View>
      </View>
      {/* input for blackboard link */}
      <View style={styles.settingItem}>
        <View style={styles.accentBox}>
          <View style={styles.infoRow}>
            <Text style={styles.blackboardLabel}>Blackboard Link</Text>
            <FontAwesome5
              name="info-circle"
              size={20}
              color={colors.alwaysWhite}
              style={{ marginLeft: 10 }}
              onPress={() => setModalVisible(true)}
              testID="infoButton"
            />
          </View>
          <TextInput
            style={styles.blackboardInput}
            value={icsLink}
            onChangeText={(text) => {
              setIcsLink(text);
              setHasChanged(text !== originalLink);
            }}
            onFocus={() => {
              const user = getAuth().currentUser;
              if (!user) {
                Alert.alert(
                  "Sign In Required",
                  "Please sign in to edit your Blackboard link.",
                  [
                    {
                      text: "Go to Login",
                      onPress: () => {
                        router.push("/login");
                      },
                    },
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                  ]
                );
              }
            }}
            placeholder="Enter your Blackboard link"
            placeholderTextColor="#888"
          />
          {hasChanged && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveBlackboardLink}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {/* modal that appears to explain how to get blackboard ics link for cal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Blackboard .ics Link</Text>
            <Text style={styles.modalText}>
              To find your blackboard calendar link follow these steps:{"\n"}
              1. Go to blackboard.sc.edu and sign in{"\n"}
              2. Click on the calendar button{"\n"}
              3. Press on the settings cog in the top right corner{"\n"}
              4. Select the calendar's/classes you want included{"\n"}
              5. Press the three dots: "..."{"\n"}
              6. Press "Share" calendar{"\n"}
              7. Copy the link (you may need to press "Generate Link" first)
            </Text>
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
