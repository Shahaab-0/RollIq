import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { Menu } from 'lucide-react-native';
import { getTheme, Theme } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import { BELT_LABELS } from '../../profile/types';
import type { Belt } from '../../profile/types';

interface Props {
  displayName: string | null | undefined;
  belt: Belt;
  stripes: number;
  accent: string;
  onMenuPress: () => void;
}

function initialsFor(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');
}

// Avatar + name + belt row — split out of DashboardScreen to keep that
// file under the 400-line component cap.
function ProfileHeader({ displayName, belt, stripes, accent, onMenuPress }: Readonly<Props>) {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.header}>
      <Pressable hitSlop={12} onPress={onMenuPress}>
        <Menu color={theme.textPrimary} size={22} />
      </Pressable>
      <View style={[styles.avatar, { borderColor: accent }]}>
        <Text style={styles.avatarText}>{initialsFor(displayName)}</Text>
      </View>
      <View style={styles.headerText}>
        <Text style={styles.name}>{displayName ?? 'Your name'}</Text>
        <View style={styles.beltRow}>
          <View style={[styles.beltDot, { backgroundColor: accent }]} />
          <Text style={styles.beltLabel}>
            {BELT_LABELS[belt]} · {stripes} stripes
          </Text>
        </View>
      </View>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: theme.textPrimary,
      fontWeight: FONT_WEIGHT.bold,
      fontSize: FONT_SIZE.base,
    },
    headerText: {
      gap: 4,
    },
    name: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.xxl,
      fontWeight: FONT_WEIGHT.bold,
    },
    beltRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    beltDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    beltLabel: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
    },
  });
}

export default ProfileHeader;
