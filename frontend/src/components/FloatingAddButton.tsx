import React, { useMemo } from 'react';
import { Pressable, StyleSheet, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { getTheme, Theme } from '../theme/colors';

interface Props {
  onPress: () => void;
}

// Bottom-right, thumb-reachable "add" action for list screens (Training Log,
// Technique Journal, Roll Tracker) — replaces the old header "+" button,
// which sat at the top of the screen, the hardest spot to reach one-handed.
function FloatingAddButton({ onPress }: Readonly<Props>) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable
      style={[styles.button, { bottom: insets.bottom + 20 }]}
      hitSlop={8}
      onPress={onPress}
    >
      <Plus color={theme.accentText} size={26} strokeWidth={2.5} />
    </Pressable>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    button: {
      position: 'absolute',
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.accent,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
    },
  });
}

export default FloatingAddButton;
