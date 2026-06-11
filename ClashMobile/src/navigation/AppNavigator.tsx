import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import type { RootStackParamList } from '../types';
import { COLORS } from '../utils/theme';

import LandingScreen from '../screens/LandingScreen';
import AuthScreen from '../screens/AuthScreen';
import CategorySelectionScreen from '../screens/CategorySelectionScreen';
import GameSetupScreen from '../screens/GameSetupScreen';
import GameScreen from '../screens/GameScreen';
import ResultScreen from '../screens/ResultScreen';
import AccountScreen from '../screens/AccountScreen';
import { HowToPlayScreen, CategoriesScreen, StoreScreen, DashboardScreen, DrawingScreen } from '../screens/OtherScreens';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isLoading } = useAuth();

  if (isLoading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.BG }}>
      <ActivityIndicator size="large" color={COLORS.BROWN_PRIMARY} />
    </View>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{ headerShown: false, cardStyle: { backgroundColor: COLORS.BG } }}
      >
        <Stack.Screen name="Landing"           component={LandingScreen} />
        <Stack.Screen name="Auth"              component={AuthScreen} />
        <Stack.Screen name="HowToPlay"         component={HowToPlayScreen} />
        <Stack.Screen name="Categories"        component={CategoriesScreen} />
        <Stack.Screen name="Store"             component={StoreScreen} />
        <Stack.Screen name="Account"           component={AccountScreen} />
        <Stack.Screen name="CategorySelection" component={CategorySelectionScreen} />
        <Stack.Screen name="GameSetup"         component={GameSetupScreen} />
        <Stack.Screen name="Game"              component={GameScreen} />
        <Stack.Screen name="Result"            component={ResultScreen} />
        <Stack.Screen name="Dashboard"         component={DashboardScreen} />
        <Stack.Screen name="Drawing"           component={DrawingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
