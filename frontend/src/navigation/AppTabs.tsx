import React, { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  BookOpen,
  ClipboardList,
  CircleUserRound,
  House,
  Trophy,
} from 'lucide-react-native';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import HomeStack from './HomeStack';
import LogStack from './LogStack';
import TechniquesStack from './TechniquesStack';
import CompetitionsStack from './CompetitionsStack';
import { getTheme, UI_ACCENT } from '../theme/colors';
import type { AppTabsParamList } from './types';

const Tab = createBottomTabNavigator<AppTabsParamList>();

const TAB_ICONS: Record<keyof AppTabsParamList, typeof House> = {
  Home: House,
  Log: ClipboardList,
  Techniques: BookOpen,
  Competitions: Trophy,
  Profile: CircleUserRound,
};

function renderTabIcon(
  routeName: keyof AppTabsParamList,
  color: string,
  size: number,
) {
  const Icon = TAB_ICONS[routeName];
  return <Icon color={color} size={size} strokeWidth={2.25} />;
}

function AppTabs() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: UI_ACCENT,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
        tabBarIcon: ({ color, size }) =>
          renderTabIcon(route.name as keyof AppTabsParamList, color, size),
      })}>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Log" component={LogStack} />
      <Tab.Screen name="Techniques" component={TechniquesStack} />
      <Tab.Screen name="Competitions" component={CompetitionsStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default AppTabs;
