import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Session } from '@supabase/supabase-js'
import { createStackNavigator } from '@react-navigation/stack';
import Auth from './components/auth';
import Account from './components/account';
import Menu from './components/menu'
import Ongoing from './components/ongoing'
import Taxi from './components/taxiService/taxiHomePage';
import Delivery from './components/deliveryService/deliveryService';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])
  return (
    <NavigationContainer>
      {session && session.user ? (
        <Stack.Navigator>
            <Stack.Screen name="Root" options={{ headerShown: false }}>
              {() => (
                <Tab.Navigator>
                  <Tab.Screen name="Menu" component={Menu} />
                  <Tab.Screen name="Ongoing" component={Ongoing} />
                  <Tab.Screen name="Account">
                    {() => <Account session={session} />}
                  </Tab.Screen>
                </Tab.Navigator>
              )}
            </Stack.Screen>
            <Stack.Screen name="Taxi" component={Taxi} />
            <Stack.Screen name="Delivery" component={Delivery} />
        </Stack.Navigator>
      ) : (
        <View>
          <Auth />
        </View>
      )}
    </NavigationContainer>
  )
}