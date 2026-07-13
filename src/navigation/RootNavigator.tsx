import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAppSelector } from '../app/hooks';
import { useAuthListener } from '../features/auth/hooks/useAuthListener';
import { getTheme, Theme, UI_ACCENT } from '../theme/colors';
import AuthStack from './AuthStack';
import AppTabs from './AppTabs';

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
          <ActivityIndicator color={UI_ACCENT} />
        </View>
      ) : (
        <NavigationContainer>
          {session ? <AppTabs /> : <AuthStack />}
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
