import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { StyleSheet, View, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button, Input, useTheme, Icon } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { RootStackParamList } from '../lib/navigationTypes';

export default function Account({ session }: { session: Session }) {
    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState('')
    const [website, setWebsite] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')
    const { theme } = useTheme();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    useEffect(() => {
    if (session) getProfile()
    }, [session])

    async function getProfile() {
        try {
        setLoading(true)
        if (!session?.user) throw new Error('No user on the session!')

        const { data, error, status } = await supabase
            .from('profiles')
            .select(`username, website, avatar_url`)
            .eq('id', session?.user.id)
            .single()
        if (error && status !== 406) {
            throw error
        }

        if (data) {
            setUsername(data.username)
            setWebsite(data.website)
            setAvatarUrl(data.avatar_url)
        }
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
            <View style={styles.verticallySpaced}>
                <Input label="Username" value={username || ''} onChangeText={(text) => setUsername(text)} />
            </View>
            <View style={styles.verticallySpaced}>
                <Input label="Website" value={website || ''} onChangeText={(text) => setWebsite(text)} />
            </View>

            <View style={styles.verticallySpaced}>
                <Button
                    title="Settings"
                    onPress={() => navigation.navigate('Settings')}
                />
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
    });
