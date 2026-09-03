import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Menu, Trash2, Trophy } from 'lucide-react-native';
import { getTheme, Theme, UI_ACCENT } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import { formatDisplayDate } from '../../../lib/dateFormat';
import FloatingAddButton from '../../../components/FloatingAddButton';
import ErrorState from '../../../components/ErrorState';
import EmptyState from '../../../components/EmptyState';
import {
  useCompetitions,
  useDeleteCompetition,
} from '../hooks/useCompetitions';
import type { CompetitionsStackParamList } from '../../../navigation/types';
import type { Competition } from '../types';

type Nav = NativeStackNavigationProp<
  CompetitionsStackParamList,
  'CompetitionList'
>;

function recordLabel(item: Competition): string {
  const parts = [`${item.wins}W`, `${item.losses}L`];
  if (item.draws > 0) parts.push(`${item.draws}D`);
  return parts.join(' · ');
}

function CompetitionListScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const { data: items = [], isLoading, isError } = useCompetitions();
  const deleteCompetition = useDeleteCompetition();

  const confirmDelete = (item: Competition) => {
    Alert.alert(
      'Delete competition?',
      `This deletes "${item.name}" and every match logged under it. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCompetition.mutate(item.id),
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: Competition }) => (
    <Pressable
      style={styles.row}
      onPress={() =>
        navigation.navigate('CompetitionDetail', { competitionId: item.id })
      }
    >
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle}>{item.name}</Text>
        <Text style={styles.rowMeta}>
          {formatDisplayDate(item.competition_date)} · {item.weight_category}
        </Text>
        {item.belt_division ? (
          <Text style={styles.rowMeta}>{item.belt_division}</Text>
        ) : null}
      </View>
      <View style={styles.rowActions}>
        <View style={styles.recordBadge}>
          <Text style={styles.recordText}>
            {item.match_count === 0 ? 'No matches' : recordLabel(item)}
          </Text>
        </View>
        <Pressable
          hitSlop={8}
          style={styles.deleteIconButton}
          onPress={() => confirmDelete(item)}
        >
          <Trash2 color={theme.danger} size={16} />
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          hitSlop={12}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Menu color={theme.textPrimary} size={22} />
        </Pressable>
        <Text style={styles.title}>Competitions</Text>
      </View>

      {isLoading && items.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={UI_ACCENT} />
        </View>
      ) : isError ? (
        <ErrorState />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No competitions logged"
          description="Log a competition to track matches, opponents, and results across every tournament you enter."
          actionLabel="Log a Competition"
          onAction={() => navigation.navigate('CompetitionForm', undefined)}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      <FloatingAddButton
        onPress={() => navigation.navigate('CompetitionForm', undefined)}
      />
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
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 16,
      gap: 12,
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
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 100,
      gap: 10,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      padding: 16,
    },
    rowMain: {
      flex: 1,
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
    rowActions: {
      alignItems: 'flex-end',
      gap: 8,
    },
    recordBadge: {
      backgroundColor: theme.surfaceAlt,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    recordText: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.bold,
    },
    deleteIconButton: {
      padding: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.danger,
    },
  });
}

export default CompetitionListScreen;
