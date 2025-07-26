import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../lib/navigationTypes';

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

const WelcomeScreen = () => {
    const navigation = useNavigation<WelcomeScreenNavigationProp>();

    return (
        <View style={styles.container}>
            <Image source={require('../assets/logo.png')} style={styles.logo} />
            <Text h2 style={styles.title}>
                Welcome to multiservices
            </Text>
            <Text style={styles.subtitle}>
                Your one-stop solution for various services.
            </Text>
            <Button
                title="Get Started"
                onPress={() => navigation.navigate('Auth')}
                buttonStyle={styles.button}
                titleStyle={styles.buttonTitle}
                containerStyle={styles.buttonContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 24,
    },
    logo: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
        marginBottom: 24,
    },
    title: {
        marginBottom: 12,
        textAlign: 'center',
        color: '#212529',
    },
    subtitle: {
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
        marginBottom: 48,
    },
    buttonContainer: {
        width: '100%',
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        paddingVertical: 14,
    },
    buttonTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default WelcomeScreen;