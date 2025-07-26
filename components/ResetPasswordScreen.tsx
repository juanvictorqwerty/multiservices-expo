import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Input } from '@rneui/themed';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../lib/navigationTypes';

export default function ResetPasswordScreen() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const handleResetPassword = async () => {
        if (password.length < 6) {
            Alert.alert('Password too short', 'Please enter a password that is at least 6 characters long.');
            return;
        }

        setLoading(true);
        // The user is already authenticated at this point because of the deep link.
        // We just need to update their password.
        const { error } = await supabase.auth.updateUser({ password: password });

        if (error) {
            Alert.alert('Error updating password', error.message);
        } else {
            Alert.alert('Success', 'Your password has been updated successfully.', [
                { text: 'OK', onPress: () => navigation.navigate('Root') },
            ]);
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Input
                label="New Password"
                leftIcon={{ type: 'font-awesome', name: 'lock' }}
                onChangeText={setPassword}
                value={password}
                secureTextEntry
                placeholder="Enter your new password"
                autoCapitalize="none"
            />
            <Button
                title={loading ? 'Updating...' : 'Update Password'}
                onPress={handleResetPassword}
                disabled={loading}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
});