import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState, Platform } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input } from '@rneui/themed'
import * as Linking from 'expo-linking';

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
if (Platform.OS !== 'web') {
    AppState.addEventListener('change', (state) => {
        if (state === 'active') {
            supabase.auth.startAutoRefresh()
        } else {
            supabase.auth.stopAutoRefresh()
        }
        })
}

    export default function Auth() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    async function signInWithEmail() {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
        })

        if (error) Alert.alert(error.message)
        setLoading(false)
    }

    async function signUpWithEmail() {
        setLoading(true)
        const {
        data: { session },
        error,
        } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                username: email.split('@')[0], // Provide a default username
            },
        },
        })

        if (error) {
            if (error.message.includes('rate limit')) {
                Alert.alert('Too many requests', 'You have tried to sign up too many times. Please wait a while before trying again.');
            } else {
                Alert.alert('Sign up failed', error.message);
            }
        } else if (!session) {
            Alert.alert('Confirmation required', 'Please check your inbox for email verification!');
        }
        setLoading(false)
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
        <View style={styles.container}>
        <View style={[styles.verticallySpaced, styles.mt20]}>
            <Input
            label="Email"
            leftIcon={{ type: 'font-awesome', name: 'envelope' }}
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="email@address.com"
            autoCapitalize={'none'}
            />
        </View>
        <View style={styles.verticallySpaced}>
            <Input
            label="Password"
            leftIcon={{ type: 'font-awesome', name: 'lock' }}
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="Password"
            autoCapitalize={'none'}
            />
            </View>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Button title="Sign in" disabled={loading} onPress={() => signInWithEmail()} />
            </View>
            <View style={styles.verticallySpaced}>
                <Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()} />
            </View>
            <View style={styles.verticallySpaced}>
                <Button title="Forgot Password?" onPress={forgotPassword} disabled={loading} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
        padding: 2,
    },
    verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'stretch',
    },
    mt20: {
        marginTop: 20,
    },
})