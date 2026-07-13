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
import { deleteSession, fetchSessions } from '../sessionsSlice';
import { SESSION_TYPE_OPTIONS } from '../types';
import type { LogStackParamList } from '../../../navigation/types';
import type { Session } from '../types';

type Nav = NativeStackNavigationProp<LogStackParamList, 'TrainingLog'>;

const SESSION_TYPE_LABELS = Object.fromEntries(
  SESSION_TYPE_OPTIONS.map(o => [o.value, o.label]),
);

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function TrainingLogScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector(state => state.sessions);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSessions());
    }
  }, [dispatch, status]);

  const renderItem = ({ item }: { item: Session }) => (
    <Pressable
      style={styles.row}
      onPress={() =>
        navigation.navigate('LogSessionForm', { sessionId: item.id })
      }>
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle}>
          {item.gi ? 'Gi' : 'No-Gi'} · {SESSION_TYPE_LABELS[item.session_type]}
        </Text>
        <Text style={styles.rowMeta}>
          {formatDate(item.date)}
          {item.duration_minutes ? ` · ${item.duration_minutes} min` : ''}
          {item.rounds_count
            ? ` · ${item.rounds_count} rounds${
                item.round_minutes ? ` × ${item.round_minutes} min` : ''
              }`
            : ''}
        </Text>
      </View>
      <Pressable
        hitSlop={8}
        onPress={() => dispatch(deleteSession(item.id))}>
        <Trash2 color={theme.danger} size={18} />
      </Pressable>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Training Log</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => navigation.navigate('LogSessionForm', undefined)}>
          <Plus color={UI_ACCENT_TEXT} size={20} strokeWidth={2.5} />
        </Pressable>
      </View>

      {status === 'loading' && items.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={UI_ACCENT} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            No sessions logged yet — tap + to add your first one.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
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
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: 14,
      textAlign: 'center',
    },
    listContent: {
      paddingHorizontal: 20,
      gap: 10,
      paddingBottom: 24,
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
    },
    rowMain: {
      gap: 4,
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

export default TrainingLogScreen;
