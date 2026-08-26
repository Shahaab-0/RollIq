import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { getTheme, Theme, UI_ACCENT, UI_ACCENT_MUTED, UI_ACCENT_TEXT } from '../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../theme/typography';

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

// A visually substantial "nothing here yet" state -- an accent-tinted icon
// badge, a bold title, a description, and an optional direct CTA button --
// instead of a single line of gray centered text. The floating "+" button
// is easy to miss on first open; this gives a first-time user something to
// actually look at and a bigger, more obvious tap target to act on.
function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: Readonly<Props>) {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.iconBadge}>
        <Icon color={UI_ACCENT} size={32} strokeWidth={2} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction ? (
        <Pressable style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
      paddingBottom: 60,
      gap: 6,
    },
    iconBadge: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: UI_ACCENT_MUTED,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    title: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.lg,
      fontWeight: FONT_WEIGHT.bold,
      textAlign: 'center',
    },
    description: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.body,
      textAlign: 'center',
      lineHeight: 20,
    },
    actionButton: {
      backgroundColor: UI_ACCENT,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 28,
      marginTop: 20,
    },
    actionButtonText: {
      color: UI_ACCENT_TEXT,
      fontWeight: FONT_WEIGHT.bold,
      fontSize: FONT_SIZE.base,
    },
  });
}

export default EmptyState;
