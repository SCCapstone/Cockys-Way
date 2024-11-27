import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFonts, Abel_400Regular } from '@expo-google-fonts/abel';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function AccessibilityScreen() {
  let [fontsLoaded] = useFonts({
    Abel_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Accessibility</Text>
      <View style={styles.content}>
        <Text style={styles.text}>Here you can manage your accessibility settings.</Text>
        {/* Add more content as needed */}
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
  content: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 5,
  },
  text: {
    fontSize: 18,
    color: '#000000',
    fontFamily: 'Abel_400Regular',
  },
});