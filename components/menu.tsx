import React from 'react';
import { View, Text, Button, StyleSheet,Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define the type for the navigation parameters
type RootStackParamList = {
    Root: undefined;
    Taxi: undefined;
    Delivery: undefined;
};

const Menu = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    return (
        //list of buttons to navigate to different services
        <View style={styles.container}>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Button
                    title="Personal Taxi"
                    onPress={() => navigation.navigate('Taxi')} />
            </View>
            
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Button
                    title="Deliveries"
                    onPress={() => navigation.navigate('Delivery')} />
            </View>

            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Button
                    title="Service 3"
                    onPress={() => Alert.alert('Service 3','Coming soon!')}/>
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
});

export default Menu;