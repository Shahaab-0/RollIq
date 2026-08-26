import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TechniqueLibraryScreen from '../features/techniques/screens/TechniqueLibraryScreen';
import TechniqueFormScreen from '../features/techniques/screens/TechniqueFormScreen';
import TechniqueVideoPlayerScreen from '../features/techniques/screens/TechniqueVideoPlayerScreen';
import type { TechniquesStackParamList } from './types';

const Stack = createNativeStackNavigator<TechniquesStackParamList>();

function TechniquesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TechniqueLibrary" component={TechniqueLibraryScreen} />
      <Stack.Screen name="TechniqueForm" component={TechniqueFormScreen} />
      <Stack.Screen name="TechniqueVideoPlayer" component={TechniqueVideoPlayerScreen} />
    </Stack.Navigator>
  );
}

export default TechniquesStack;
