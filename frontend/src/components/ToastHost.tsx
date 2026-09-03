import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTheme, Theme, TOAST_TEXT } from '../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../theme/typography';
import { subscribeToast, ToastEvent } from '../lib/toast';

const VISIBLE_MS = 2500;
const FADE_MS = 200;

// Mounted once at the app root (see App.tsx) and driven entirely through
// the module-level showToast()/subscribeToast() pub-sub in lib/toast.ts,
// not props — mutations fire it from anywhere, including outside the
// component tree (the QueryClient's global MutationCache callbacks).
function ToastHost() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const [toast, setToast] = useState<ToastEvent | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () =>
      subscribeToast(event => {
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        setToast(event);
        opacity.setValue(0);
        Animated.timing(opacity, {
          toValue: 1,
          duration: FADE_MS,
          useNativeDriver: true,
        }).start();

        hideTimeout.current = setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: FADE_MS,
            useNativeDriver: true,
          }).start(() => setToast(null));
        }, VISIBLE_MS);
      }),
    [opacity],
  );

  if (!toast) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        { top: insets.top + 8 },
        toast.variant === 'success' ? styles.success : styles.error,
        { opacity },
      ]}
    >
      <Text style={styles.text} numberOfLines={2}>
        {toast.message}
      </Text>
    </Animated.View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      left: 16,
      right: 16,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      zIndex: 999,
    },
    success: {
      backgroundColor: theme.success,
    },
    error: {
      backgroundColor: theme.danger,
    },
    text: {
      color: TOAST_TEXT,
      fontSize: FONT_SIZE.body,
      fontWeight: FONT_WEIGHT.semibold,
      textAlign: 'center',
    },
  });
}

export default ToastHost;
