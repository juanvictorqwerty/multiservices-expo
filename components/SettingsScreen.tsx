import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Platform, TouchableOpacity, KeyboardAvoidingView, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { RootStackParamList } from '../lib/navigationTypes';
import * as Linking from 'expo-linking';
import { Button, Input, Icon } from '@rneui/themed';

const AccountSettings = ({ session }: { session: Session }) => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [currentUsername, setCurrentUsername] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [signOutLoading, setSignOutLoading] = useState(false);
    const [usernameLoading, setUsernameLoading] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showUsernameForm, setShowUsernameForm] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    useEffect(() => {
        getProfile();
    }, []);

    async function getProfile() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user on the session!');

            const { data, error, status } = await supabase.from('profiles').select(`username`).eq('id', user.id).single();

            if (error && status !== 406) throw error;

            if (data) setCurrentUsername(data.username);
        } catch (error) {
            if (error instanceof Error) Alert.alert('Error fetching profile', error.message);
        }
    }

    async function updateEmail() {
        setLoading(true);
        try {
            // It's more robust to get the user directly from the auth client
            // to ensure the session is still valid before attempting an update.
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Your session is invalid. Please sign in again.');

            const { error } = await supabase.auth.updateUser({ email: newEmail });

            if (error) throw error;

            Alert.alert('Success', 'Please check your new email address for a verification link.');
            setNewEmail('');
            setShowEmailForm(false);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("For security purposes, you can't reuse this email")) {
                    Alert.alert('Email already in use', 'This email address is already registered with another account.');
                } else {
                    Alert.alert('Error', error.message);
                }
            }
        } finally {
            setLoading(false);
        }
    }

    function handleSignOut() {
        Alert.alert(
            'Confirm Sign Out',
            'Are you sure you want to sign out?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    // This onPress function is async to handle the sign-out process
                    onPress: async () => {
                        setSignOutLoading(true);
                        const { error } = await supabase.auth.signOut();
                        if (error) Alert.alert('Error Signing Out', error.message);
                        // On success, the onAuthStateChange listener in App.tsx handles navigation.
                    },
                },
            ]
        );
    }

    async function handleChangePassword() {
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            Alert.alert('Missing fields', 'Please fill in all password fields.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Alert.alert('Passwords do not match', 'The new passwords you entered do not match.');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Password is too short', 'Your new password must be at least 6 characters long.');
            return;
        }

        setPasswordLoading(true);
        try {
            // 1. Re-authenticate with the old password to ensure the user is legitimate.
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !user.email) {
                throw new Error('Could not get user information. Please sign in again.');
            }

            const { error: reauthError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: oldPassword,
            });

            if (reauthError) {
                // Provide a more user-friendly message for this specific, common error.
                if (reauthError.message.includes('Invalid login credentials')) {
                    throw new Error('The old password you entered is incorrect.');
                }
                throw reauthError;
            }

            // 2. If re-authentication is successful, update to the new password.
            const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
            if (updateError) throw updateError;

            Alert.alert('Success', 'Your password has been updated successfully.');
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setShowPasswordForm(false);
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Error', error.message);
            }
        } finally {
            setPasswordLoading(false);
        }
    }

    async function updateUsername() {
        if (!newUsername.trim()) {
            Alert.alert('Error', 'Username cannot be empty.');
            return;
        }
        setUsernameLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Your session is invalid. Please sign in again.');

            const { error } = await supabase
                .from('profiles')
                .update({ username: newUsername, updated_at: new Date() })
                .eq('id', user.id);

            if (error) throw error;

            Alert.alert('Success', 'Your username has been updated.');
            setCurrentUsername(newUsername);
            setShowUsernameForm(false);
            setNewUsername('');
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Error', error.message);
            }
        } finally {
            setUsernameLoading(false);
        }
    }

    function resetPasswordFormState() {
        setShowPasswordForm(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
    }

    async function handleForgotPasswordLink() {
        Alert.alert(
            'Forgot Password',
            'This will send a password reset link to your email. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Send Link',
                    onPress: async () => {
                        setPasswordLoading(true);
                        try {
                            const { data: { user } } = await supabase.auth.getUser();
                            if (!user || !user.email) throw new Error('Could not get user information.');

                            const redirectTo = Platform.OS === 'web'
                                ? Linking.createURL('reset-password')
                                : 'com.anonymous.multiservicesexpo://reset-password';

                            const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo });
                            if (error) throw error;

                            Alert.alert('Check your email', 'A password reset link has been sent.');
                            resetPasswordFormState();
                        } catch (error) {
                            if (error instanceof Error) Alert.alert('Error', error.message);
                        } finally {
                            setPasswordLoading(false);
                        }
                    },
                },
            ]
        );
    }
    return (
        <KeyboardAvoidingView
            style={styles.keyboardAvoidingContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.infoSection}>
                    <Text style={styles.infoLabel}>Username:</Text>
                    {currentUsername ? <Text style={styles.infoValue}>{currentUsername}</Text> : <ActivityIndicator />}
                </View>

                {showUsernameForm ? (
                    <View style={[styles.formSection, styles.mt20]}>
                        <Text style={styles.label}>Update Username:</Text>
                        <Input
                            onChangeText={setNewUsername}
                            value={newUsername}
                            placeholder="Enter new username"
                            autoCapitalize="none"
                            leftIcon={<Icon name="person-outline" type="material" size={24} color="gray" />}
                        />
                        <Button
                            title={usernameLoading ? 'Updating...' : 'Update Username'}
                            onPress={updateUsername}
                            disabled={usernameLoading}
                            loading={usernameLoading}
                            buttonStyle={styles.button}
                        />
                        <View style={styles.mt8}>
                            <Button
                                title="Cancel"
                                onPress={() => {
                                setShowUsernameForm(false);
                                setNewUsername('');
                            }}
                                type="outline"
                                buttonStyle={styles.cancelButton}
                            />
                        </View>
                    </View>
                ) : (
                    <Button
                        title="Change Username"
                        onPress={() => setShowUsernameForm(true)}
                        buttonStyle={styles.button}
                        containerStyle={[styles.verticallySpaced, styles.mt20]}
                        icon={<Icon name="edit" type="material" color="white" containerStyle={styles.iconStyle} />}
                    />
                )}

                {showEmailForm ? (
                    <View style={[styles.formSection, styles.mt20]}>
                        <Text style={styles.label}>Update Email:</Text>
                        <Input
                            onChangeText={setNewEmail}
                            value={newEmail}
                            placeholder="Enter new email"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            leftIcon={<Icon name="envelope" type="font-awesome" size={24} color="gray" />}
                        />
                        <Button
                            title="Update Email"
                            onPress={updateEmail}
                            disabled={loading}
                            loading={loading}
                            buttonStyle={styles.button}
                        />
                        <View style={styles.mt8}>
                            <Button
                                title="Cancel"
                                onPress={() => setShowEmailForm(false)}
                                type="outline"
                                buttonStyle={styles.cancelButton}
                            />
                        </View>
                    </View>
                ) : (
                    <Button
                        title="Change Email"
                        onPress={() => setShowEmailForm(true)}
                        buttonStyle={styles.button}
                        containerStyle={[styles.verticallySpaced, styles.mt20]}
                        icon={<Icon name="envelope" type="font-awesome" color="white" containerStyle={styles.iconStyle} />}
                    />
                )}

                {showPasswordForm ? (
                    <View style={[styles.formSection, styles.mt20]}>
                        <Text style={styles.label}>Change Password:</Text>
                        <Input
                            onChangeText={setOldPassword}
                            value={oldPassword}
                            placeholder="Enter old password"
                            autoCapitalize="none"
                            secureTextEntry
                            leftIcon={<Icon name="lock" type="font-awesome" size={24} color="gray" />}
                        />
                        <Input
                            onChangeText={setNewPassword}
                            value={newPassword}
                            placeholder="Enter new password"
                            autoCapitalize="none"
                            secureTextEntry
                            leftIcon={<Icon name="lock-outline" type="material" size={24} color="gray" />}
                        />
                        <Input
                            onChangeText={setConfirmNewPassword}
                            value={confirmNewPassword}
                            placeholder="Confirm new password"
                            autoCapitalize="none"
                            secureTextEntry
                            leftIcon={<Icon name="lock-outline" type="material" size={24} color="gray" />}
                        />
                        <Button
                            title={passwordLoading ? 'Updating...' : 'Update Password'}
                            onPress={handleChangePassword}
                            disabled={passwordLoading}
                            loading={passwordLoading}
                            buttonStyle={styles.button}
                        />
                        <TouchableOpacity onPress={handleForgotPasswordLink} style={styles.forgotPasswordButton}>
                            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
                        </TouchableOpacity>
                        <View style={styles.mt8}>
                            <Button
                                title="Cancel"
                                onPress={resetPasswordFormState}
                                type="outline"
                                buttonStyle={styles.cancelButton}
                            />
                        </View>
                    </View>
                ) : (
                    <Button
                        title="Change Password"
                        onPress={() => setShowPasswordForm(true)}
                        buttonStyle={styles.button}
                        containerStyle={[styles.verticallySpaced, styles.mt20]}
                        icon={<Icon name="lock" type="font-awesome" color="white" containerStyle={styles.iconStyle} />}
                    />
                )}

                <Button
                    title={signOutLoading ? 'Signing Out...' : 'Sign Out'}
                    onPress={handleSignOut}
                    disabled={signOutLoading}
                    loading={signOutLoading}
                    buttonStyle={styles.button}
                    containerStyle={[styles.verticallySpaced, styles.mt20]}
                    icon={<Icon name="sign-out" type="font-awesome" color="white" containerStyle={styles.iconStyle} />}
                />
                <Button
                    title="Delete Account"
                    onPress={() => navigation.navigate('ConfirmDeletion')}
                    buttonStyle={styles.deleteButton}
                    containerStyle={[styles.verticallySpaced, styles.mt20]}
                    icon={<Icon name="trash" type="font-awesome" color="white" containerStyle={styles.iconStyle} />}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa', // A light grey background
    },
    container: {
        paddingHorizontal: 12,
        paddingVertical: 20,
        flexGrow: 1,
    },
    verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'stretch',
    },
    mt20: {
        marginTop: 20,
    },
    mt8: {
        marginTop: 8,
    },
    infoSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    infoLabel: {
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 10,
    },
    infoValue: {
        fontSize: 16,
    },
    formSection: {
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    label: {
        marginBottom: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 10,
    },
    cancelButton: {
        borderColor: '#007AFF',
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 10,
    },
    deleteButton: {
        backgroundColor: '#ff3b30',
        borderRadius: 8,
        paddingVertical: 10,
    },
    iconStyle: {
        marginRight: 10,
    },
    forgotPasswordButton: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    forgotPasswordText: {
        color: '#007bff',
        textDecorationLine: 'underline',
    },
});
export default AccountSettings;