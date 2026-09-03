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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ChevronLeft, Pencil, Trash2 } from 'lucide-react-native';
import {
  getTheme,
  Theme,
  UI_ACCENT,
  UI_ACCENT_MUTED,
} from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import { formatDisplayDate } from '../../../lib/dateFormat';
import FloatingAddButton from '../../../components/FloatingAddButton';
import {
  useCompetitionMatches,
  useCompetitions,
  useDeleteMatch,
} from '../hooks/useCompetitions';
import type { CompetitionsStackParamList } from '../../../navigation/types';
import type { CompetitionMatch, MatchResult } from '../types';

type Nav = NativeStackNavigationProp<
  CompetitionsStackParamList,
  'CompetitionDetail'
>;
type Route = RouteProp<CompetitionsStackParamList, 'CompetitionDetail'>;

function resultColor(theme: Theme, result: MatchResult): string {
  if (result === 'win') return theme.success;
  if (result === 'loss') return theme.danger;
  return theme.textSecondary;
}

function resultLabel(result: MatchResult): string {
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function CompetitionDetailScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { competitionId } = route.params;

  const { data: competitions = [] } = useCompetitions();
  const { data: matches = [], isLoading } =
    useCompetitionMatches(competitionId);
  const deleteMatch = useDeleteMatch(competitionId);

  const competition = competitions.find(c => c.id === competitionId);

  const renderMatch = ({ item }: { item: CompetitionMatch }) => (
    <Pressable
      style={styles.matchRow}
      onPress={() =>
        navigation.navigate('CompetitionMatchForm', {
          competitionId,
          matchId: item.id,
        })
      }
    >
      <View
        style={[
          styles.resultDot,
          { backgroundColor: resultColor(theme, item.result) },
        ]}
      />
      <View style={styles.matchMain}>
        <Text style={styles.matchOpponent}>{item.opponent_name}</Text>
        <Text style={styles.matchMeta}>
          {resultLabel(item.result)}
          {item.method ? ` · ${item.method}` : ''}
        </Text>
      </View>
      <Pressable
        hitSlop={8}
        style={styles.deleteIconButton}
        onPress={() => deleteMatch.mutate(item.id)}
      >
        <Trash2 color={theme.danger} size={16} />
      </Pressable>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => navigation.goBack()}>
          <ChevronLeft color={theme.textPrimary} size={24} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {competition?.name ?? 'Competition'}
        </Text>
        <Pressable
          hitSlop={12}
          onPress={() =>
            navigation.navigate('CompetitionForm', { competitionId })
          }
        >
          <Pencil color={UI_ACCENT} size={20} />
        </Pressable>
      </View>

      {isLoading && matches.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={UI_ACCENT} />
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={item => item.id}
          renderItem={renderMatch}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            competition ? (
              <View style={styles.infoSection}>
                <Text style={styles.infoMeta}>
                  {formatDisplayDate(competition.competition_date)} ·{' '}
                  {competition.weight_category}
                </Text>
                {competition.belt_division ? (
                  <Text style={styles.infoMeta}>
                    {competition.belt_division}
                  </Text>
                ) : null}
                {competition.location ? (
                  <Text style={styles.infoMeta}>{competition.location}</Text>
                ) : null}
                {competition.notes ? (
                  <Text style={styles.infoNotes}>{competition.notes}</Text>
                ) : null}
                <View style={styles.recordRow}>
                  <Text style={styles.recordText}>
                    {competition.wins}W · {competition.losses}L
                    {competition.draws > 0 ? ` · ${competition.draws}D` : ''}
                  </Text>
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No matches yet — tap + to add one.
            </Text>
          }
        />
      )}

      <FloatingAddButton
        onPress={() =>
          navigation.navigate('CompetitionMatchForm', {
            competitionId,
            matchId: undefined,
          })
        }
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
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 16,
      gap: 12,
    },
    headerTitle: {
      flex: 1,
      color: theme.textPrimary,
      fontSize: FONT_SIZE.lg,
      fontWeight: FONT_WEIGHT.bold,
      textAlign: 'center',
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 100,
      gap: 10,
    },
    infoSection: {
      gap: 6,
      marginBottom: 16,
    },
    infoMeta: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
    },
    infoNotes: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.body,
      marginTop: 4,
    },
    recordRow: {
      flexDirection: 'row',
      marginTop: 8,
    },
    recordText: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.md,
      fontWeight: FONT_WEIGHT.extrabold,
      backgroundColor: UI_ACCENT_MUTED,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      overflow: 'hidden',
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.body,
      textAlign: 'center',
      paddingTop: 12,
    },
    matchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      padding: 16,
    },
    resultDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    matchMain: {
      flex: 1,
      gap: 4,
    },
    matchOpponent: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.base,
      fontWeight: FONT_WEIGHT.semibold,
    },
    matchMeta: {
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

export default CompetitionDetailScreen;
