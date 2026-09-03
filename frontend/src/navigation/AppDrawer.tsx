import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { HeartPulse, House, LogOut, Swords, Video } from 'lucide-react-native';
import AppTabs from './AppTabs';
import RollsStack from './RollsStack';
import InjuriesStack from './InjuriesStack';
import InstructionalsStack from './InstructionalsStack';
import { useSignOut } from '../features/auth/hooks/useAuth';
import { getTheme, Theme } from '../theme/colors';
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from '../theme/typography';
import type { AppDrawerParamList } from './types';

const Drawer = createDrawerNavigator<AppDrawerParamList>();

const DRAWER_ITEMS = [
  { route: 'Main' as const, label: 'Dashboard', icon: House },
  { route: 'Rolls' as const, label: 'Roll Tracker', icon: Swords },
  { route: 'Injuries' as const, label: 'Injury Tracking', icon: HeartPulse },
  { route: 'Instructionals' as const, label: 'Instructionals', icon: Video },
];

function DrawerContent({ navigation, state }: DrawerContentComponentProps) {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const activeRoute = state.routes[state.index]?.name;
  const signOut = useSignOut();

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>RollIQ</Text>
        <View style={styles.list}>
          {DRAWER_ITEMS.map(item => {
            const Icon = item.icon;
            const active = activeRoute === item.route;
            return (
              <Pressable
                key={item.route}
                style={[styles.card, active && styles.cardActive]}
                onPress={() => navigation.navigate(item.route)}
              >
                <Icon
                  color={active ? theme.accent : theme.textSecondary}
                  size={20}
                />
                <Text
                  style={[styles.cardLabel, active && styles.cardLabelActive]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        style={styles.signOutButton}
        disabled={signOut.isPending}
        onPress={() => signOut.mutate()}
      >
        <LogOut color={theme.danger} size={20} />
        <Text style={styles.signOutLabel}>
          {signOut.isPending ? 'Signing out…' : 'Sign Out'}
        </Text>
      </Pressable>
    </View>
  );
}

function AppDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false }}
      drawerContent={DrawerContent}
    >
      <Drawer.Screen name="Main" component={AppTabs} />
      <Drawer.Screen name="Rolls" component={RollsStack} />
      <Drawer.Screen name="Injuries" component={InjuriesStack} />
      <Drawer.Screen name="Instructionals" component={InstructionalsStack} />
    </Drawer.Navigator>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: 16,
      paddingTop: 70,
      paddingBottom: 24,
      justifyContent: 'space-between',
    },
    title: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.lg,
      fontWeight: FONT_WEIGHT.extrabold,
      fontFamily: FONT_FAMILY.extrabold,
      marginBottom: 24,
      paddingHorizontal: 4,
    },
    list: {
      gap: 10,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      padding: 16,
    },
    cardActive: {
      borderColor: theme.accent,
      backgroundColor: theme.accentMuted,
    },
    cardLabel: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.base,
      fontWeight: FONT_WEIGHT.semibold,
      fontFamily: FONT_FAMILY.semibold,
    },
    cardLabelActive: {
      color: theme.accent,
    },
    signOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      borderWidth: 1.5,
      borderColor: theme.danger,
      borderRadius: 14,
      paddingVertical: 14,
    },
    signOutLabel: {
      color: theme.danger,
      fontSize: FONT_SIZE.base,
      fontWeight: FONT_WEIGHT.bold,
      fontFamily: FONT_FAMILY.bold,
    },
  });
}

export default AppDrawer;
