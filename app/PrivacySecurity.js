import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { useFonts, Abel_400Regular } from '@expo-google-fonts/abel';
import AppLoading from 'expo-app-loading';
import { router } from 'expo-router';
import { FIREBASE_AUTH, FIREBASE_DB } from "../FirebaseConfig";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

export default function PrivacySecurityScreen() {
  const navigation = useNavigation();
  const [isEnabled, setIsEnabled] = React.useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const user = getAuth().currentUser;

  let [fontsLoaded] = useFonts({
    Abel_400Regular,
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Privacy and Security</Text>
      <View style={styles.settingItem}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Delete my data</Text>
        </View>
      </View>
      <View style={styles.settingItem}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Option 2</Text>
        </View>
      </View>
      <View style={styles.settingItem}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Option 3</Text>
        </View>
      </View>
      <View style={styles.settingItem}>
        <View style={styles.accentBoxSmall}>
          <Text style={styles.settingText}>Location Services</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4" }
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const updatePrivacySecuritySettings = async (newSettings) => {
  const user = getAuth().currentUser;
  if (user) {
    try {
      const userDoc = doc(FIREBASE_DB, "users", user.uid);
      await setDoc(userDoc, newSettings, { merge: true });
      console.log("Privacy and Security settings updated successfully");
    } catch (error) {
      console.error("Error updating privacy and security settings:", error);
    }
  } else {
    console.error("No UID provided");
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F3F3F3',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#73000A',
    fontFamily: 'Abel_400Regular',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  accentBox: {
    backgroundColor: '#73000A',
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  accentBoxSmall: {
    backgroundColor: '#73000A',
    padding: 5,
    borderRadius: 5,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 22.5,
    color: '#FFFFFF',
    fontFamily: 'Abel_400Regular',
  },
});

export { updatePrivacySecuritySettings };