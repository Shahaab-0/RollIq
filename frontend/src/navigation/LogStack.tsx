import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TrainingLogScreen from '../features/trainingLog/screens/TrainingLogScreen';
import LogSessionFormScreen from '../features/trainingLog/screens/LogSessionFormScreen';
import type { LogStackParamList } from './types';

const Stack = createNativeStackNavigator<LogStackParamList>();

function LogStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TrainingLog" component={TrainingLogScreen} />
      <Stack.Screen name="LogSessionForm" component={LogSessionFormScreen} />
    </Stack.Navigator>
  );
}

export default LogStack;
