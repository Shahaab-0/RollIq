import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAppSelector } from '../redux/hooks';
import { useAuthListener } from '../features/auth/hooks/useAuthListener';
import { getTheme, Theme } from '../theme/colors';
import AuthStack from './AuthStack';
import AppDrawer from './AppDrawer';

function RootNavigator() {
  useAuthListener();
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const status = useAppSelector(state => state.auth.status);
  const session = useAppSelector(state => state.auth.session);

  return (
    <>
      <StatusBar
        barStyle={theme.scheme === 'light' ? 'dark-content' : 'light-content'}
      />
      {status !== 'ready' ? (
        <View style={styles.loading}>
          <ActivityIndicator color={theme.accent} />
        </View>
      ) : (
        <NavigationContainer>
          {session ? <AppDrawer /> : <AuthStack />}
        </NavigationContainer>
      )}
    </>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    loading: {
      flex: 1,
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

export default RootNavigator;
