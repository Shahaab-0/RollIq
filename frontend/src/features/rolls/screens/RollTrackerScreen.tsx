import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Trash2 } from 'lucide-react-native';
import { getTheme, Theme, UI_ACCENT } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import FloatingAddButton from '../../../components/FloatingAddButton';
import ErrorState from '../../../components/ErrorState';
import { useDeleteRoll, useRolls } from '../hooks/useRolls';
import type { RollsStackParamList } from '../../../navigation/types';
import type { Roll } from '../types';

type Nav = NativeStackNavigationProp<RollsStackParamList, 'RollTracker'>;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function topTaps(items: Roll[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const roll of items) {
    for (const sub of roll.submissions_received) {
      counts.set(sub, (counts.get(sub) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function RollTrackerScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const { data: items = [], isLoading, isError } = useRolls();
  const deleteRoll = useDeleteRoll();

  const taps = useMemo(() => topTaps(items), [items]);

  const renderItem = ({ item }: { item: Roll }) => (
    <Pressable
      style={styles.row}
      onPress={() => navigation.navigate('LogRollForm', { rollId: item.id })}>
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle}>
          {item.partner_name || 'Open roll'}
        </Text>
        <Text style={styles.rowMeta}>
          {item.submissions_landed.length} landed ·{' '}
          {item.submissions_received.length} received ·{' '}
          {formatDate(item.created_at)}
        </Text>
      </View>
      <Pressable
        hitSlop={8}
        style={styles.deleteIconButton}
        onPress={() => deleteRoll.mutate(item.id)}>
        <Trash2 color={theme.danger} size={18} />
      </Pressable>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Roll Tracker</Text>
      </View>

      {isLoading && items.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={UI_ACCENT} />
        </View>
      ) : isError ? (
        <ErrorState />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            taps.length > 0 ? (
              <View style={styles.tapCard}>
                <Text style={styles.tapCardTitle}>What's catching you</Text>
                {taps.map(tap => (
                  <View key={tap.name} style={styles.tapRow}>
                    <Text style={styles.tapName}>{tap.name}</Text>
                    <Text style={styles.tapCount}>{tap.count}×</Text>
                  </View>
                ))}
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>
                No rolls logged yet — tap + to log your first roll.
              </Text>
            </View>
          }
        />
      )}

      <FloatingAddButton onPress={() => navigation.navigate('LogRollForm', undefined)} />
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 16,
    },
    title: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.title,
      fontWeight: FONT_WEIGHT.extrabold,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      paddingTop: 60,
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.body,
      textAlign: 'center',
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 100,
      gap: 10,
    },
    tapCard: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      padding: 16,
      marginBottom: 16,
      gap: 8,
    },
    tapCardTitle: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.base,
      fontWeight: FONT_WEIGHT.bold,
      marginBottom: 4,
    },
    tapRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    tapName: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.body,
    },
    tapCount: {
      color: theme.danger,
      fontSize: FONT_SIZE.body,
      fontWeight: FONT_WEIGHT.bold,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      padding: 16,
      marginBottom: 10,
    },
    rowMain: {
      gap: 4,
      flexShrink: 1,
    },
    rowTitle: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.base,
      fontWeight: FONT_WEIGHT.semibold,
    },
    rowMeta: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
    },
    deleteIconButton: {
      padding: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.danger,
    },
  });
}

export default RollTrackerScreen;
