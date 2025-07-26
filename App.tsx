import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Text } from 'react-native'
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Session } from '@supabase/supabase-js'
import { createStackNavigator } from '@react-navigation/stack';
import * as Linking from 'expo-linking';
import Auth from './components/auth';
import Account from './components/account';
import Menu from './components/menu'
import Ongoing from './components/ongoing'
import Taxi from './components/taxiService/taxiHomePage';
import Delivery from './components/deliveryService/deliveryService';
import AccountSettings from './components/SettingsScreen';
import ConfirmDeletion from './components/confirmDeletionScreen';
import ResetPasswordScreen from './components/ResetPasswordScreen';
import SignUpScreen from './components/SignUpScreen';
import WelcomeScreen from './components/welcomeScreen';
import { RootStackParamList } from './lib/navigationTypes';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const prefix = Linking.createURL('/');

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  const linking = {
    prefixes: [prefix],
    config: {
      screens: {
        ResetPassword: 'reset-password',
      },
    },
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (_event === 'PASSWORD_RECOVERY') {
        if (navigationRef.isReady()) {
          navigationRef.navigate('ResetPassword');
        }
      }
    })

    return () => {
      authListener.subscription.unsubscribe();
    }
  }, [])

  const RootTabs = () => (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Menu" component={Menu} />
      <Tab.Screen name="Ongoing" component={Ongoing} />
      <Tab.Screen name="Account">
        {() => <Account session={session!} />}
      </Tab.Screen>
    </Tab.Navigator>
  );

  return (
    <NavigationContainer ref={navigationRef} linking={linking} fallback={<Text>Loading...</Text>}>
      <Stack.Navigator>
        {session && session.user ? (
        <>
            <Stack.Screen name="Root" component={RootTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Taxi" component={Taxi} />
            <Stack.Screen name="Delivery" component={Delivery} />
            <Stack.Screen name="Settings">{() => <AccountSettings session={session!} />}</Stack.Screen>
            <Stack.Screen name="ConfirmDeletion" component={ConfirmDeletion} options={{ title: 'Confirm Account Deletion' }} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Reset Password' }} />
        </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Auth" component={Auth} options={{ headerShown: false }} />
            <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Create Account' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}