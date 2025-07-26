import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input, Icon, Text } from '@rneui/themed'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from '../lib/navigationTypes'
import * as Linking from 'expo-linking'

// If you are using Supabase JS v2+, auto-refresh is handled automatically.
// Remove manual startAutoRefresh/stopAutoRefresh unless you are using a custom setup.
// If you need to handle session refresh manually, consult the Supabase docs for your client version.

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

export default function Auth() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const navigation = useNavigation<AuthScreenNavigationProp>();

    async function signInWithEmail() {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) Alert.alert(error.message)
        setLoading(false)
    }

    function handleSignUp() {
        if (!email) {
            Alert.alert('Please enter your email to sign up');
            return;
        }
        navigation.navigate('SignUp', { email });
    }

    async function forgotPassword() {
        if (!email) {
            Alert.alert('Missing Email', 'Please enter your email address to reset your password.');
            return;
        }
        setLoading(true);
        const redirectTo = Platform.OS === 'web'
            ? Linking.createURL('reset-password')
            : 'com.anonymous.multiservicesexpo://reset-password';
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectTo,
        });

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Check your email', 'A password reset link has been sent.');
        }
        setLoading(false);
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back!</Text>
                    <Text style={styles.subtitle}>Sign in to access your account</Text>
                </View>

                <View style={styles.formContainer}>
                    <Input
                        placeholder="email@address.com"
                        label="Email"
                        onChangeText={setEmail}
                        value={email}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        leftIcon={<Icon type="font-awesome" name="envelope" color="#86939e" />}
                        inputContainerStyle={styles.inputContainer}
                        inputStyle={styles.inputText}
                    />

                    <Input
                        placeholder="Password"
                        label="Password"
                        onChangeText={setPassword}
                        value={password}
                        secureTextEntry
                        autoCapitalize="none"
                        leftIcon={<Icon type="font-awesome" name="lock" color="#86939e" />}
                        inputContainerStyle={styles.inputContainer}
                        inputStyle={styles.inputText}
                    />

                    <TouchableOpacity onPress={forgotPassword} disabled={loading || !email} style={styles.forgotPasswordContainer}>
                        <Text style={[styles.forgotPasswordText, (!email || loading) && styles.disabledText]}>
                            Forgot Password?
                        </Text>
                    </TouchableOpacity>
                </View>

                <Button
                    title={loading ? 'Signing In...' : 'Sign In'}
                    onPress={signInWithEmail}
                    disabled={loading}
                    buttonStyle={styles.signInButton}
                    titleStyle={styles.signInButtonTitle}
                    containerStyle={styles.buttonContainer}
                    loading={loading}
                />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={handleSignUp} disabled={loading}>
                        <Text style={styles.signUpText}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
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
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginBottom: 8,
        marginTop: -8,
        marginRight: 10,
    },
    forgotPasswordText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
    },
    disabledText: {
        color: '#adb5bd',
    },
    buttonContainer: {
        marginTop: 20,
        width: '100%',
    },
    signInButton: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        paddingVertical: 14,
    },
    signInButtonTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        fontSize: 14,
        color: '#6c757d',
    },
    signUpText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: 'bold',
    },
})