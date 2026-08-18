import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus } from 'lucide-react-native';
import { getTheme, Theme, UI_ACCENT, UI_ACCENT_MUTED } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import { useGyms } from '../hooks/useGyms';
import type { HomeStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

// Self-contained Dashboard section -- owns its own useGyms() fetch, same
// pattern as BeltTimelineCard. A horizontal row of square gym tiles with a
// trailing "add gym" tile, rather than another vertical list card.
function GymTilesRow() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const { data: gyms = [] } = useGyms();

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.cardTitle}>My Gyms</Text>
        <Pressable onPress={() => navigation.navigate('GymList')}>
          <Text style={styles.viewAll}>View All</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {gyms.map(gym => (
          <Pressable
            key={gym.id}
            style={styles.tile}
            onPress={() => navigation.navigate('GymDetail', { gymId: gym.id })}>
            <Text style={styles.tileName} numberOfLines={2}>
              {gym.name}
            </Text>
            <Text style={styles.tileMeta}>{gym.class_count} classes</Text>
          </Pressable>
        ))}

        <Pressable style={styles.addTile} onPress={() => navigation.navigate('GymList')}>
          <Plus color={UI_ACCENT} size={22} strokeWidth={2.5} />
          <Text style={styles.addTileText}>Add Gym</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const TILE_SIZE = 96;

function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 12,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cardTitle: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.base,
      fontWeight: FONT_WEIGHT.bold,
    },
    viewAll: {
      color: UI_ACCENT,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.semibold,
    },
    row: {
      gap: 10,
    },
    tile: {
      width: TILE_SIZE,
      height: TILE_SIZE,
      borderRadius: 14,
      backgroundColor: theme.surfaceAlt,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 10,
      justifyContent: 'space-between',
    },
    tileName: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.semibold,
    },
    tileMeta: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.tiny,
    },
    addTile: {
      width: TILE_SIZE,
      height: TILE_SIZE,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: UI_ACCENT,
      borderStyle: 'dashed',
      backgroundColor: UI_ACCENT_MUTED,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    addTileText: {
      color: UI_ACCENT,
      fontSize: FONT_SIZE.tiny,
      fontWeight: FONT_WEIGHT.semibold,
    },
  });
}

export default GymTilesRow;
