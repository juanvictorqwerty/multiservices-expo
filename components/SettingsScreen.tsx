import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../lib/navigationTypes';

const AccountSettings = ({ session }: { session: any }) => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [newEmail, setNewEmail] = useState('');
    const [loading, setLoading] = useState(false);

    async function updateEmail() {
        try {
            setLoading(true);
            if (!session?.user) throw new Error('No user on the session!');

            const { error } = await supabase.auth.updateUser({ email: newEmail });

            if (error) {
                throw error;
            } else {
                Alert.alert('Please check your inbox for email verification!');
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
                <Text style={styles.title}>Settings</Text>

                <View style={[styles.verticallySpaced, styles.mt20]}>
                    <Text style={styles.label}>Update Email:</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={setNewEmail}
                        value={newEmail}
                        placeholder="Enter new email"
                        autoCapitalize="none"
                    />
                    <Button
                        title="Update Email"
                        onPress={updateEmail}
                        disabled={loading}
                    />
                </View>
                <View style={[styles.verticallySpaced, styles.mt20]}>
                    <Button
                        title="Sign Out"
                        onPress={() => supabase.auth.signOut()}
                    />
                
                <View style={[styles.verticallySpaced, styles.mt20]}>
                    <Button
                        title="Delete Account"
                        onPress={() => navigation.navigate('ConfirmDeletion')}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
        padding: 12,
    },
    verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'stretch',
    },
    mt20: {
        marginTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        marginBottom: 5,
        fontSize: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
});
export default AccountSettings;