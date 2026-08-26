import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CompetitionListScreen from '../features/competitions/screens/CompetitionListScreen';
import CompetitionFormScreen from '../features/competitions/screens/CompetitionFormScreen';
import CompetitionDetailScreen from '../features/competitions/screens/CompetitionDetailScreen';
import CompetitionMatchFormScreen from '../features/competitions/screens/CompetitionMatchFormScreen';
import type { CompetitionsStackParamList } from './types';

const Stack = createNativeStackNavigator<CompetitionsStackParamList>();

function CompetitionsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CompetitionList" component={CompetitionListScreen} />
      <Stack.Screen name="CompetitionForm" component={CompetitionFormScreen} />
      <Stack.Screen name="CompetitionDetail" component={CompetitionDetailScreen} />
      <Stack.Screen name="CompetitionMatchForm" component={CompetitionMatchFormScreen} />
    </Stack.Navigator>
  );
}

export default CompetitionsStack;
