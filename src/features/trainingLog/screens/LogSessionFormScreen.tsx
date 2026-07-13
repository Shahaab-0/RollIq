import React, { useEffect, useMemo, useState } from 'react';
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
import { getTheme, Theme, UI_ACCENT, UI_ACCENT_TEXT } from '../../../theme/colors';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { createSession, deleteSession, updateSession } from '../sessionsSlice';
import {
  fetchTechniqueIdsForSession,
  saveSessionTechniques,
} from '../sessionTechniques';
import TechniquePicker from '../components/TechniquePicker';
import { SESSION_TYPE_OPTIONS, SessionType } from '../types';
import type { LogStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<LogStackParamList, 'LogSessionForm'>;
type Route = RouteProp<LogStackParamList, 'LogSessionForm'>;

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function LogSessionFormScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const dispatch = useAppDispatch();

  const sessionId = route.params?.sessionId;
  const existing = useAppSelector(state =>
    sessionId
      ? state.sessions.items.find(s => s.id === sessionId)
      : undefined,
  );

  const [date, setDate] = useState(existing?.date ?? todayString());
  const [gi, setGi] = useState(existing?.gi ?? true);
  const [sessionType, setSessionType] = useState<SessionType>(
    existing?.session_type ?? 'fundamentals',
  );
  const [duration, setDuration] = useState(
    existing?.duration_minutes ? String(existing.duration_minutes) : '',
  );
  const [instructor, setInstructor] = useState(existing?.instructor ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [roundsCount, setRoundsCount] = useState(
    existing?.rounds_count ? String(existing.rounds_count) : '',
  );
  const [roundMinutes, setRoundMinutes] = useState(
    existing?.round_minutes ? String(existing.round_minutes) : '',
  );
  const [submissionsLandedCount, setSubmissionsLandedCount] = useState(
    existing?.submissions_landed_count
      ? String(existing.submissions_landed_count)
      : '',
  );
  const [productivityRating, setProductivityRating] = useState<number | null>(
    existing?.productivity_rating ?? null,
  );
  const [techniqueIds, setTechniqueIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const userId = useAppSelector(state => state.auth.session?.user.id);

  useEffect(() => {
    if (existing) {
      fetchTechniqueIdsForSession(existing.id).then(setTechniqueIds);
    }
  }, [existing]);

  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(date);

  const handleSave = async () => {
    if (!isValidDate) {
      Alert.alert('Invalid date', 'Please use the format YYYY-MM-DD.');
      return;
    }
    setSaving(true);
    const changes = {
      date,
      gi,
      session_type: sessionType,
      duration_minutes: duration ? parseInt(duration, 10) : null,
      instructor: instructor || null,
      notes: notes || null,
      rounds_count: roundsCount ? parseInt(roundsCount, 10) : null,
      round_minutes: roundMinutes ? parseInt(roundMinutes, 10) : null,
      submissions_landed_count: submissionsLandedCount
        ? parseInt(submissionsLandedCount, 10)
        : null,
      productivity_rating: productivityRating,
    };
    const result = existing
      ? await dispatch(updateSession({ id: existing.id, changes }))
      : await dispatch(createSession(changes));
    if (
      result.type === createSession.fulfilled.type ||
      result.type === updateSession.fulfilled.type
    ) {
      const savedId = (result.payload as { id: string }).id;
      if (userId) {
        await saveSessionTechniques(savedId, techniqueIds, userId);
      }
      setSaving(false);
      navigation.goBack();
    } else {
      setSaving(false);
      Alert.alert('Something went wrong', 'Could not save this session.');
    }
  };

  const handleDelete = () => {
    if (!existing) return;
    Alert.alert('Delete session?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await dispatch(deleteSession(existing.id));
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => navigation.goBack()}>
          <ChevronLeft color={theme.textPrimary} size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {existing ? 'Edit Session' : 'Log Session'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Date</Text>
        <View style={styles.dateRow}>
          <TextInput
            style={[styles.input, styles.dateInput]}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.textSecondary}
          />
          <Pressable
            style={styles.todayButton}
            onPress={() => setDate(todayString())}>
            <Text style={styles.todayButtonText}>Today</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Type</Text>
        <View style={styles.chipRow}>
          <Pressable
            style={[styles.chip, gi && styles.chipActive]}
            onPress={() => setGi(true)}>
            <Text style={[styles.chipText, gi && styles.chipTextActive]}>
              Gi
            </Text>
          </Pressable>
          <Pressable
            style={[styles.chip, !gi && styles.chipActive]}
            onPress={() => setGi(false)}>
            <Text style={[styles.chipText, !gi && styles.chipTextActive]}>
              No-Gi
            </Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Session type</Text>
        <View style={styles.chipRow}>
          {SESSION_TYPE_OPTIONS.map(option => (
            <Pressable
              key={option.value}
              style={[
                styles.chip,
                sessionType === option.value && styles.chipActive,
              ]}
              onPress={() => setSessionType(option.value)}>
              <Text
                style={[
                  styles.chipText,
                  sessionType === option.value && styles.chipTextActive,
                ]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Duration (minutes)</Text>
        <TextInput
          style={styles.input}
          value={duration}
          onChangeText={setDuration}
          keyboardType="number-pad"
          placeholder="60"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={styles.label}>Techniques covered</Text>
        <TechniquePicker selectedIds={techniqueIds} onChange={setTechniqueIds} />

        <Text style={styles.label}>Rolling rounds</Text>
        <View style={styles.dateRow}>
          <TextInput
            style={[styles.input, styles.dateInput]}
            value={roundsCount}
            onChangeText={setRoundsCount}
            keyboardType="number-pad"
            placeholder="Rounds (e.g. 5)"
            placeholderTextColor={theme.textSecondary}
          />
          <TextInput
            style={[styles.input, styles.dateInput]}
            value={roundMinutes}
            onChangeText={setRoundMinutes}
            keyboardType="number-pad"
            placeholder="Min/round (e.g. 6)"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <Text style={styles.label}>Submissions landed</Text>
        <TextInput
          style={styles.input}
          value={submissionsLandedCount}
          onChangeText={setSubmissionsLandedCount}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={styles.label}>Productivity</Text>
        <View style={styles.chipRow}>
          {[1, 2, 3, 4, 5].map(level => (
            <Pressable
              key={level}
              style={[
                styles.ratingDot,
                productivityRating === level && styles.ratingDotActive,
              ]}
              onPress={() => setProductivityRating(level)}>
              <Text
                style={[
                  styles.chipText,
                  productivityRating === level && styles.chipTextActive,
                ]}>
                {level}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Instructor</Text>
        <TextInput
          style={styles.input}
          value={instructor}
          onChangeText={setInstructor}
          placeholder="Optional"
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
          onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving…' : existing ? 'Save Changes' : 'Log Session'}
          </Text>
        </Pressable>

        {existing ? (
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Session</Text>
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
      fontSize: 17,
      fontWeight: '700',
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
      fontSize: 13,
      fontWeight: '600',
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
      fontSize: 15,
    },
    notesInput: {
      minHeight: 90,
      textAlignVertical: 'top',
    },
    dateRow: {
      flexDirection: 'row',
      gap: 8,
    },
    dateInput: {
      flex: 1,
    },
    todayButton: {
      justifyContent: 'center',
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: theme.surfaceAlt,
      borderWidth: 1,
      borderColor: theme.border,
    },
    todayButtonText: {
      color: theme.textPrimary,
      fontWeight: '600',
      fontSize: 13,
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
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    chipActive: {
      backgroundColor: UI_ACCENT,
      borderColor: UI_ACCENT,
    },
    chipText: {
      color: theme.textSecondary,
      fontSize: 13,
      fontWeight: '600',
    },
    chipTextActive: {
      color: UI_ACCENT_TEXT,
    },
    ratingDot: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    ratingDotActive: {
      backgroundColor: UI_ACCENT,
      borderColor: UI_ACCENT,
    },
    saveButton: {
      backgroundColor: UI_ACCENT,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: UI_ACCENT_TEXT,
      fontWeight: '700',
      fontSize: 15,
    },
    deleteButton: {
      alignItems: 'center',
      paddingVertical: 14,
      marginTop: 8,
    },
    deleteButtonText: {
      color: theme.danger,
      fontWeight: '600',
      fontSize: 14,
    },
  });
}

export default LogSessionFormScreen;
