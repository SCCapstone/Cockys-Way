import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { useFonts, Abel_400Regular } from '@expo-google-fonts/abel';
import AppLoading from 'expo-app-loading';
import { useRouter } from 'expo-router';
import { FIREBASE_AUTH } from '../../FirebaseConfig';

export default function SettingsScreen() {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = React.useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  let [fontsLoaded] = useFonts({
    Abel_400Regular,
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/PrivacySecurity')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Privacy and Security</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/index')}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Favorite Locations</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.settingItem}>
        <View style={styles.accentBox}>
          <Text style={styles.settingText}>Accessibility</Text>
        </View>
      </View>
      <View style={styles.settingItem}>
        <TouchableOpacity style={styles.accentBox} onPress={() => router.push('/login')}>
          <Text style={styles.settingText}>My Account</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.settingItem}>
        <View style={styles.accentBoxSmall}>
          <Text style={styles.settingText}>Enable Notifications</Text>
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