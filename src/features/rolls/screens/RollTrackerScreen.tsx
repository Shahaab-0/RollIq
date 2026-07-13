import React, { useEffect, useMemo } from 'react';
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
import { Plus, Trash2 } from 'lucide-react-native';
import { getTheme, Theme, UI_ACCENT, UI_ACCENT_TEXT } from '../../../theme/colors';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { deleteRoll, fetchRolls } from '../rollsSlice';
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
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector(state => state.rolls);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchRolls());
    }
  }, [dispatch, status]);

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
      <Pressable hitSlop={8} onPress={() => dispatch(deleteRoll(item.id))}>
        <Trash2 color={theme.danger} size={18} />
      </Pressable>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Roll Tracker</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => navigation.navigate('LogRollForm', undefined)}>
          <Plus color={UI_ACCENT_TEXT} size={20} strokeWidth={2.5} />
        </Pressable>
      </View>

      {status === 'loading' && items.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={UI_ACCENT} />
        </View>
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 16,
    },
    title: {
      color: theme.textPrimary,
      fontSize: 24,
      fontWeight: '800',
    },
    addButton: {
      backgroundColor: UI_ACCENT,
      borderRadius: 20,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
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
      fontSize: 14,
      textAlign: 'center',
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 24,
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
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 4,
    },
    tapRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    tapName: {
      color: theme.textSecondary,
      fontSize: 14,
    },
    tapCount: {
      color: theme.danger,
      fontSize: 14,
      fontWeight: '700',
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
      fontSize: 15,
      fontWeight: '600',
    },
    rowMeta: {
      color: theme.textSecondary,
      fontSize: 13,
    },
  });
}

export default RollTrackerScreen;
