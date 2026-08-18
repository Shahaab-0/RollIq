import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InstructionalLibraryScreen from '../features/instructionals/screens/InstructionalLibraryScreen';
import InstructionalFormScreen from '../features/instructionals/screens/InstructionalFormScreen';
import InstructionalVideoFormScreen from '../features/instructionals/screens/InstructionalVideoFormScreen';
import InstructionalPlayerScreen from '../features/instructionals/screens/InstructionalPlayerScreen';
import type { InstructionalsStackParamList } from './types';

const Stack = createNativeStackNavigator<InstructionalsStackParamList>();

function InstructionalsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InstructionalLibrary" component={InstructionalLibraryScreen} />
      <Stack.Screen name="InstructionalForm" component={InstructionalFormScreen} />
      <Stack.Screen name="InstructionalVideoForm" component={InstructionalVideoFormScreen} />
      <Stack.Screen name="InstructionalPlayer" component={InstructionalPlayerScreen} />
    </Stack.Navigator>
  );
}

export default InstructionalsStack;
