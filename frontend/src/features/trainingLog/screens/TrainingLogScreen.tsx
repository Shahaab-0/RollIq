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
import { useDeleteSession, useSessions } from '../hooks/useSessions';
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
  const { data: items = [], isLoading, isError } = useSessions();
  const deleteSession = useDeleteSession();

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
        style={styles.deleteIconButton}
        onPress={() => deleteSession.mutate(item.id)}>
        <Trash2 color={theme.danger} size={18} />
      </Pressable>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Training Log</Text>
      </View>

      {isLoading && items.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={UI_ACCENT} />
        </View>
      ) : isError ? (
        <ErrorState />
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

      <FloatingAddButton onPress={() => navigation.navigate('LogSessionForm', undefined)} />
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
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.body,
      textAlign: 'center',
    },
    listContent: {
      paddingHorizontal: 20,
      gap: 10,
      paddingBottom: 100,
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

export default TrainingLogScreen;
