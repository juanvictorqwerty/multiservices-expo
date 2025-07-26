import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../lib/navigationTypes';

export default function ConfirmDeletionScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDeleteAccount = async () => {
        if (!password) {
            Alert.alert('Error', 'Please enter your password to confirm account deletion');
            return;
        }

        setLoading(true);
        
        try {
            // First, re-authenticate the user to confirm their identity.
            // Note: signInWithPassword will issue a new session. If you have MFA enabled,
            // this will fail. Supabase has an experimental reauthenticate() method which
            // might be a better fit in the future.
            const { data: userResponse } = await supabase.auth.getUser();
            const userEmail = userResponse?.user?.email || '';

            if (!userEmail) {
                throw new Error("Could not get user email.");
            }

            const { error: authError } = await supabase.auth.signInWithPassword({
                email: userEmail,
                password: password,
            });

            if (authError) throw authError;

            // Then, call the 'delete_user' RPC function you've created in your Supabase dashboard.
            const { error: deleteError } = await supabase.rpc('delete_user');

            if (deleteError) throw deleteError;

            Alert.alert('Success', 'Your account has been deleted successfully.', [
                { text: 'OK', onPress: () => supabase.auth.signOut() },
            ]);
            // We explicitly sign out. The onAuthStateChange listener in App.tsx
            // will then handle navigation to the Auth screen upon session termination.
        } catch (error) {
            if (error instanceof Error) {
    Alert.alert('Error', error.message);
            } else {
    Alert.alert('Error', 'Failed to delete account');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.warning}>
                Warning: This action is permanent and cannot be undone. All your data will be deleted.
            </Text>
            
            <TextInput
                style={styles.input}
                placeholder="Enter your password to confirm"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            
            <Button
                title={loading ? "Deleting..." : "Delete Account"}
                onPress={handleDeleteAccount}
                disabled={loading}
                color="#ff0000"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    warning: {
        color: 'red',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
});