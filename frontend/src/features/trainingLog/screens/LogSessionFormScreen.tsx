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
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { getTheme, Theme } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from '../../../theme/typography';
import { toLocalDateString } from '../../../lib/dateFormat';
import {
  useCreateSession,
  useDeleteSession,
  useSessions,
  useUpdateSession,
} from '../hooks/useSessions';
import {
  useReplaceSessionTechniques,
  useSessionTechniques,
} from '../hooks/useSessionTechniques';
import TechniquePicker from '../components/TechniquePicker';
import SessionTypeFields from '../components/SessionTypeFields';
import SessionProgressFields from '../components/SessionProgressFields';
import { SessionType } from '../types';
import type { LogStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<LogStackParamList, 'LogSessionForm'>;
type Route = RouteProp<LogStackParamList, 'LogSessionForm'>;

function todayString(): string {
  return toLocalDateString(new Date());
}

function formatDisplayDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function LogSessionFormScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();

  const sessionId = route.params?.sessionId;
  const { data: sessions = [] } = useSessions();
  const existing = sessionId
    ? sessions.find(s => s.id === sessionId)
    : undefined;
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();
  const { data: existingTechniqueIds } = useSessionTechniques(existing?.id);
  const replaceSessionTechniques = useReplaceSessionTechniques();

  const [date, setDate] = useState(existing?.date ?? todayString());
  const dateObj = useMemo(() => new Date(`${date}T00:00:00`), [date]);
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

  useEffect(() => {
    if (existingTechniqueIds) {
      setTechniqueIds(existingTechniqueIds);
    }
  }, [existingTechniqueIds]);

  const handleSave = async () => {
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
    let saved;
    try {
      saved = existing
        ? await updateSession.mutateAsync({ id: existing.id, changes })
        : await createSession.mutateAsync(changes);
    } catch {
      // toast already shown by the mutation itself
      setSaving(false);
      return;
    }
    try {
      await replaceSessionTechniques.mutateAsync({
        sessionId: saved.id,
        techniqueIds,
      });
    } catch {
      // toast already shown -- the session itself still saved, so proceed
    }
    setSaving(false);
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!existing) return;
    Alert.alert('Delete session?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSession.mutateAsync(existing.id);
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
          {existing ? 'Edit Session' : 'Log Session'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Date</Text>
        {Platform.OS === 'ios' ? (
          <View style={styles.iosDateRow}>
            <DateTimePicker
              value={dateObj}
              mode="date"
              display="compact"
              themeVariant={theme.scheme}
              accentColor={theme.accent}
              maximumDate={new Date()}
              onChange={(_event, selected) => {
                if (selected) setDate(toLocalDateString(selected));
              }}
            />
          </View>
        ) : (
          <Pressable
            style={styles.input}
            onPress={() =>
              DateTimePickerAndroid.open({
                value: dateObj,
                mode: 'date',
                maximumDate: new Date(),
                onChange: (_event, selected) => {
                  if (selected) setDate(toLocalDateString(selected));
                },
              })
            }
          >
            <Text style={styles.androidDateText}>
              {formatDisplayDate(date)}
            </Text>
          </Pressable>
        )}

        <SessionTypeFields
          gi={gi}
          onChangeGi={setGi}
          sessionType={sessionType}
          onChangeSessionType={setSessionType}
        />

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
        <TechniquePicker
          selectedIds={techniqueIds}
          onChange={setTechniqueIds}
        />

        <SessionProgressFields
          roundsCount={roundsCount}
          onChangeRoundsCount={setRoundsCount}
          roundMinutes={roundMinutes}
          onChangeRoundMinutes={setRoundMinutes}
          submissionsLandedCount={submissionsLandedCount}
          onChangeSubmissionsLandedCount={setSubmissionsLandedCount}
          productivityRating={productivityRating}
          onChangeProductivityRating={setProductivityRating}
        />

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
          onPress={handleSave}
        >
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
      minHeight: 90,
      textAlignVertical: 'top',
    },
    iosDateRow: {
      alignItems: 'flex-start',
    },
    androidDateText: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.base,
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

export default LogSessionFormScreen;
