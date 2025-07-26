import React, { useState } from 'react';
import { Alert, StyleSheet, View, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button, Input, Text, Icon } from '@rneui/themed';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../lib/navigationTypes';

type SignUpScreenRouteProp = RouteProp<RootStackParamList, 'SignUp'>;

export default function SignUpScreen() {
    const route = useRoute<SignUpScreenRouteProp>();
    const { email } = route.params;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signUpWithEmail() {
        if (password !== confirmPassword) {
            Alert.alert("Passwords do not match!");
            return;
        }
        if (password.length < 6) {
            Alert.alert('Password is too short', 'Your password must be at least 6 characters long.');
            return;
        }
        setLoading(true);
        const {
            data,
            error,
        } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: email.split('@')[0], // Default username
                },
            },
        });

        if (error) {
            Alert.alert('Sign Up Error', error.message);
        } else if (data.user && data.user.identities?.length === 0) {
            // To prevent email enumeration, Supabase returns a user object for an existing user
            // but with an empty identities array.
            Alert.alert('User already exists', 'An account with this email address already exists. Please try to sign in.');
        } else if (!data.session) {
            // New user needs to verify their email
            Alert.alert('Please check your inbox for email verification!');
        }
        // If a session exists, the onAuthStateChange listener in App.tsx will handle navigation.
        setLoading(false);
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Just one more step for {email}</Text>
                </View>

                <View style={styles.formContainer}>
                    <Input
                        placeholder="Enter your password"
                        label="Password"
                        onChangeText={setPassword}
                        value={password}
                        secureTextEntry
                        autoCapitalize="none"
                        leftIcon={<Icon type="font-awesome" name="lock" color="#86939e" />}
                        inputContainerStyle={styles.inputContainer}
                        inputStyle={styles.inputText}
                    />
                    <Input
                        placeholder="Confirm your password"
                        label="Confirm Password"
                        onChangeText={setConfirmPassword}
                        value={confirmPassword}
                        secureTextEntry
                        autoCapitalize="none"
                        leftIcon={<Icon type="font-awesome" name="lock" color="#86939e" />}
                        inputContainerStyle={styles.inputContainer}
                        inputStyle={styles.inputText}
                        errorMessage={
                            password && confirmPassword && password !== confirmPassword
                                ? 'Passwords do not match'
                                : ''
                        }
                    />
                </View>

                <Button
                    title={loading ? 'Creating Account...' : 'Sign Up'}
                    onPress={signUpWithEmail}
                    disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                    buttonStyle={styles.signUpButton}
                    titleStyle={styles.signUpButtonTitle}
                    containerStyle={styles.buttonContainer}
                    loading={loading}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#212529',
    },
    subtitle: {
        fontSize: 16,
        color: '#6c757d',
        marginTop: 8,
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
    },
    inputContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderBottomWidth: 0,
        paddingHorizontal: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    inputText: {
        fontSize: 16,
        color: '#495057',
    },
    buttonContainer: {
        marginTop: 20,
        width: '100%',
    },
    signUpButton: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        paddingVertical: 14,
    },
    signUpButtonTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
});