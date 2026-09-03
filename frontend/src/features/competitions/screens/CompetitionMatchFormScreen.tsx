import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { getTheme, Theme } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from '../../../theme/typography';
import {
  useCompetitionMatches,
  useCreateMatch,
  useDeleteMatch,
  useUpdateMatch,
} from '../hooks/useCompetitions';
import { RESULT_OPTIONS } from '../types';
import type { CompetitionsStackParamList } from '../../../navigation/types';
import type { MatchResult } from '../types';

type Nav = NativeStackNavigationProp<
  CompetitionsStackParamList,
  'CompetitionMatchForm'
>;
type Route = RouteProp<CompetitionsStackParamList, 'CompetitionMatchForm'>;

const RESULT_COLOR: Record<MatchResult, keyof Theme> = {
  win: 'success',
  loss: 'danger',
  draw: 'textSecondary',
};

function CompetitionMatchFormScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  // A per-result active-chip color, memoized alongside styles rather than
  // built as a literal style object inline in JSX (CLAUDE.md's
  // no-inline-styles rule) -- three theme colors, computed once per theme
  // change instead of once per render per option.
  const resultChipActiveStyle = useMemo(
    () =>
      Object.fromEntries(
        RESULT_OPTIONS.map(option => {
          const accent = theme[RESULT_COLOR[option.value]] as string;
          return [
            option.value,
            { backgroundColor: accent, borderColor: accent },
          ];
        }),
      ) as Record<
        MatchResult,
        { backgroundColor: string; borderColor: string }
      >,
    [theme],
  );
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { competitionId, matchId } = route.params;

  const { data: matches = [] } = useCompetitionMatches(competitionId);
  const existing = matchId ? matches.find(m => m.id === matchId) : undefined;
  const createMatch = useCreateMatch(competitionId);
  const updateMatch = useUpdateMatch(competitionId);
  const deleteMatch = useDeleteMatch(competitionId);

  const [opponentName, setOpponentName] = useState(
    existing?.opponent_name ?? '',
  );
  const [result, setResult] = useState<MatchResult>(existing?.result ?? 'win');
  const [method, setMethod] = useState(existing?.method ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!opponentName.trim()) {
      Alert.alert('Opponent required', "Who'd you match up against?");
      return;
    }
    setSaving(true);
    const changes = {
      opponent_name: opponentName.trim(),
      result,
      method: method.trim() || null,
      match_order: existing?.match_order ?? matches.length + 1,
      notes: notes.trim() || null,
    };
    try {
      existing
        ? await updateMatch.mutateAsync({ matchId: existing.id, changes })
        : await createMatch.mutateAsync(changes);
      setSaving(false);
      navigation.goBack();
    } catch {
      // toast already shown by the mutation itself
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!existing) return;
    Alert.alert('Delete match?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMatch.mutateAsync(existing.id);
            navigation.goBack();
          } catch {
            // toast already shown by the mutation itself
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => navigation.goBack()}>
          <ChevronLeft color={theme.textPrimary} size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {existing ? 'Edit Match' : 'Log Match'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Opponent</Text>
        <TextInput
          style={styles.input}
          value={opponentName}
          onChangeText={setOpponentName}
          placeholder="Opponent's name"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={styles.label}>Result</Text>
        <View style={styles.chipRow}>
          {RESULT_OPTIONS.map(option => {
            const active = result === option.value;
            return (
              <Pressable
                key={option.value}
                style={[
                  styles.chip,
                  active && resultChipActiveStyle[option.value],
                ]}
                onPress={() => setResult(option.value)}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Method</Text>
        <TextInput
          style={styles.input}
          value={method}
          onChangeText={setMethod}
          placeholder="e.g. Submission - Armbar, Points, Decision"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional"
          placeholderTextColor={theme.textSecondary}
          multiline
        />

        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving…' : existing ? 'Save Changes' : 'Log Match'}
          </Text>
        </Pressable>

        {existing ? (
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Match</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
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
    headerTitle: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.lg,
      fontWeight: FONT_WEIGHT.bold,
      fontFamily: FONT_FAMILY.bold,
    },
    headerSpacer: {
      width: 24,
    },
    content: {
      padding: 20,
      gap: 8,
      paddingBottom: 40,
    },
    label: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.semibold,
      fontFamily: FONT_FAMILY.semibold,
      marginTop: 12,
      marginBottom: 4,
    },
    input: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: theme.textPrimary,
      fontSize: FONT_SIZE.base,
    },
    notesInput: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: theme.accentMuted,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    chipText: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.semibold,
      fontFamily: FONT_FAMILY.semibold,
    },
    chipTextActive: {
      color: theme.accentText,
    },
    saveButton: {
      backgroundColor: theme.accent,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: theme.accentText,
      fontWeight: FONT_WEIGHT.bold,
      fontFamily: FONT_FAMILY.bold,
      fontSize: FONT_SIZE.base,
    },
    deleteButton: {
      borderWidth: 1.5,
      borderColor: theme.danger,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 12,
    },
    deleteButtonText: {
      color: theme.danger,
      fontWeight: FONT_WEIGHT.bold,
      fontFamily: FONT_FAMILY.bold,
      fontSize: FONT_SIZE.base,
    },
  });
}

export default CompetitionMatchFormScreen;
