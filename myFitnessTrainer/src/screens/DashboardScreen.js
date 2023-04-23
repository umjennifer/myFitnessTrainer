import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { auth } from '../../firebaseConfig';
import SignOutButton from '../components/SignOutButton';

const DashboardScreen = () => {

    // TO DO: SIGN OUT BUTTON TO BE MOVED TO SETTINGS...HERE FOR TESTING
    return (
    <View style={styles.container}>
        <Text>Email: {auth.currentUser?.email}</Text>
        <Text>This screen is the Dashboard! Woot!</Text>
        <SignOutButton />
    </View>
    )
}

export default DashboardScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})