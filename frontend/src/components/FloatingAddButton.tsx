import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { UI_ACCENT, UI_ACCENT_TEXT } from '../theme/colors';

interface Props {
  onPress: () => void;
}

// Bottom-right, thumb-reachable "add" action for list screens (Training Log,
// Technique Journal, Roll Tracker) — replaces the old header "+" button,
// which sat at the top of the screen, the hardest spot to reach one-handed.
function FloatingAddButton({ onPress }: Readonly<Props>) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      style={[styles.button, { bottom: insets.bottom + 20 }]}
      hitSlop={8}
      onPress={onPress}>
      <Plus color={UI_ACCENT_TEXT} size={26} strokeWidth={2.5} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: UI_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});

export default FloatingAddButton;
