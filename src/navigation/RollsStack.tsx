import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RollTrackerScreen from '../features/rolls/screens/RollTrackerScreen';
import LogRollFormScreen from '../features/rolls/screens/LogRollFormScreen';
import type { RollsStackParamList } from './types';

const Stack = createNativeStackNavigator<RollsStackParamList>();

function RollsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RollTracker" component={RollTrackerScreen} />
      <Stack.Screen name="LogRollForm" component={LogRollFormScreen} />
    </Stack.Navigator>
  );
}

export default RollsStack;
