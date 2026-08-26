import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InjuryListScreen from '../features/injuries/screens/InjuryListScreen';
import InjuryFormScreen from '../features/injuries/screens/InjuryFormScreen';
import type { InjuriesStackParamList } from './types';

const Stack = createNativeStackNavigator<InjuriesStackParamList>();

function InjuriesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InjuryList" component={InjuryListScreen} />
      <Stack.Screen name="InjuryForm" component={InjuryFormScreen} />
    </Stack.Navigator>
  );
}

export default InjuriesStack;
