import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { StyleSheet, View, Alert } from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button, Text, Icon } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { RootStackParamList } from '../lib/navigationTypes';

export default function Account({ session }: { session: Session }) {
    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState('')
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    useFocusEffect(
        useCallback(() => {
            if (session) getProfile();
        }, [session])
    );

    async function getProfile() {
        try {
            setLoading(true)
            // It's more robust to get the user directly from the auth client
            // instead of relying on the session prop, which could be stale.
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user on the session!');

        const { data, error, status } = await supabase
            .from('profiles')
            .select(`username`)
            .eq('id', user.id)
            .single()
        if (error && status !== 406) {
            throw error
        }

        if (data) setUsername(data.username)
        } catch (error) {
        if (error instanceof Error) {
            Alert.alert(error.message)
        }
        } finally {
        setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <Text h2 style={styles.usernameText}>
                Welcome, {username || 'User'}
            </Text>

            <View style={styles.buttonContainer}>
                <Button
                    title="Account Settings"
                    onPress={() => navigation.navigate('Settings')}
                    icon={<Icon name="settings" color="white" containerStyle={{ marginRight: 10 }} />}
                    buttonStyle={styles.button}
                />
            </View>
        </View>
    )
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            backgroundColor: 'white', // Sky Blue
            padding: 20,
            marginTop: 45, // Adjusted for status bar
        },
        usernameText: {
            color: 'black', // Text color
            fontWeight: 'bold',
            marginBottom: 30,
        },
        buttonContainer: {
            width: '80%',
        },
        button: {
            backgroundColor: '#007AFF', // A nice blue for the button
            borderRadius: 30,
        },
    });
