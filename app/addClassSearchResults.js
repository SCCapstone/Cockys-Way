import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import FontAwesome from '@expo/vector-icons/FontAwesome';

const AddClassSearchResults = () => {
  return (
    <View style={styles.container}>
        <Text
            style={styles.header}
        >
            Click the add button on a class to add it to your schedule:
        </Text>
    </View>
  )
}

export default AddClassSearchResults

const styles = StyleSheet.create({
    container: {
        paddingTop: 30,
        paddingHorizontal: 20,
    },

    header: {
        textAlign: "center",
        fontSize: 25,
    },
    
    headerIcon: {
        marginHorizontal: 30,
        gap: 10,
        padding: 100,
        margin: 100,
        borderWidth: 10,
        borderColor: "green"
    }

})