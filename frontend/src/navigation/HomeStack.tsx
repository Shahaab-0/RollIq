import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../features/dashboard/screens/DashboardScreen';
import GymListScreen from '../features/gyms/screens/GymListScreen';
import GymFormScreen from '../features/gyms/screens/GymFormScreen';
import GymJoinScreen from '../features/gyms/screens/GymJoinScreen';
import GymDetailScreen from '../features/gyms/screens/GymDetailScreen';
import GymMembersScreen from '../features/gyms/screens/GymMembersScreen';
import GymScheduleFormScreen from '../features/gyms/screens/GymScheduleFormScreen';
import GymClassFormScreen from '../features/gyms/screens/GymClassFormScreen';
import GymClassDetailScreen from '../features/gyms/screens/GymClassDetailScreen';
import GymClassVideoFormScreen from '../features/gyms/screens/GymClassVideoFormScreen';
import GymVideoPlayerScreen from '../features/gyms/screens/GymVideoPlayerScreen';
import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="GymList" component={GymListScreen} />
      <Stack.Screen name="GymForm" component={GymFormScreen} />
      <Stack.Screen name="GymJoin" component={GymJoinScreen} />
      <Stack.Screen name="GymDetail" component={GymDetailScreen} />
      <Stack.Screen name="GymMembers" component={GymMembersScreen} />
      <Stack.Screen name="GymScheduleForm" component={GymScheduleFormScreen} />
      <Stack.Screen name="GymClassForm" component={GymClassFormScreen} />
      <Stack.Screen name="GymClassDetail" component={GymClassDetailScreen} />
      <Stack.Screen
        name="GymClassVideoForm"
        component={GymClassVideoFormScreen}
      />
      <Stack.Screen name="GymVideoPlayer" component={GymVideoPlayerScreen} />
    </Stack.Navigator>
  );
}

export default HomeStack;
