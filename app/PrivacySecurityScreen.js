import React from 'react';
import { View, Text, StyleSheet, Button, Switch } from 'react-native';
import { useFonts, Abel_400Regular } from '@expo-google-fonts/abel';
import AppLoading from 'expo-app-loading';

export default function PrivacySecurityScreen() {
  const [isLocationEnabled, setIsLocationEnabled] = React.useState(false);
  const toggleLocationSwitch = () => setIsLocationEnabled(previousState => !previousState);

  let [fontsLoaded] = useFonts({
    Abel_400Regular,
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <View style={styles.container}>
      <Button title="Delete Data" onPress={() => alert('Data Deleted')} />
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Location Services</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isLocationEnabled ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleLocationSwitch}
          value={isLocationEnabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F3F3F3',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingText: {
    fontSize: 22.5,
    color: '#000000',
    fontFamily: 'Abel_400Regular',
  },
});