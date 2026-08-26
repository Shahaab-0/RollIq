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
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { ChevronLeft } from 'lucide-react-native';
import {
  getTheme,
  Theme,
  UI_ACCENT,
  UI_ACCENT_MUTED,
  UI_ACCENT_TEXT,
} from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import { formatDisplayDate, toLocalDateString } from '../../../lib/dateFormat';
import { useCreateInjury, useDeleteInjury, useInjuries, useUpdateInjury } from '../hooks/useInjuries';
import { SEVERITY_OPTIONS, STATUS_OPTIONS } from '../types';
import type { InjuriesStackParamList } from '../../../navigation/types';
import type { InjuryStatus, Severity } from '../types';

type Nav = NativeStackNavigationProp<InjuriesStackParamList, 'InjuryForm'>;
type Route = RouteProp<InjuriesStackParamList, 'InjuryForm'>;

function InjuryFormScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();

  const injuryId = route.params?.injuryId;
  const { data: injuries = [] } = useInjuries();
  const existing = injuryId ? injuries.find(i => i.id === injuryId) : undefined;
  const createInjury = useCreateInjury();
  const updateInjury = useUpdateInjury();
  const deleteInjury = useDeleteInjury();

  const [bodyPart, setBodyPart] = useState(existing?.body_part ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [injuryDate, setInjuryDate] = useState(
    existing?.injury_date ?? toLocalDateString(new Date()),
  );
  const [severity, setSeverity] = useState<Severity>(existing?.severity ?? 'mild');
  const [status, setStatus] = useState<InjuryStatus>(existing?.status ?? 'active');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const dateObj = useMemo(() => new Date(`${injuryDate}T00:00:00`), [injuryDate]);

  const handleSave = async () => {
    if (!bodyPart.trim()) {
      Alert.alert('Body part required', 'Where did this happen?');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Description required', 'Give a brief description.');
      return;
    }
    setSaving(true);
    const changes = {
      body_part: bodyPart.trim(),
      description: description.trim(),
      injury_date: injuryDate,
      severity,
      status,
      notes: notes || null,
    };
    try {
      existing
        ? await updateInjury.mutateAsync({ id: existing.id, changes })
        : await createInjury.mutateAsync(changes);
      setSaving(false);
      navigation.goBack();
    } catch {
      // toast already shown by the mutation itself
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!existing) return;
    Alert.alert('Delete injury?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteInjury.mutateAsync(existing.id);
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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => navigation.goBack()}>
          <ChevronLeft color={theme.textPrimary} size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>{existing ? 'Edit Injury' : 'Log Injury'}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Body part</Text>
        <TextInput
          style={styles.input}
          value={bodyPart}
          onChangeText={setBodyPart}
          placeholder="e.g. Left knee"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={description}
          onChangeText={setDescription}
          placeholder="What happened?"
          placeholderTextColor={theme.textSecondary}
          multiline
        />

        <Text style={styles.label}>Date</Text>
        {Platform.OS === 'ios' ? (
          <View style={styles.iosDateRow}>
            <DateTimePicker
              value={dateObj}
              mode="date"
              display="compact"
              themeVariant={theme.scheme}
              accentColor={UI_ACCENT}
              maximumDate={new Date()}
              onChange={(_event, selected) => {
                if (selected) setInjuryDate(toLocalDateString(selected));
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
                  if (selected) setInjuryDate(toLocalDateString(selected));
                },
              })
            }>
            <Text style={styles.androidDateText}>{formatDisplayDate(injuryDate)}</Text>
          </Pressable>
        )}

        <Text style={styles.label}>Severity</Text>
        <View style={styles.chipRow}>
          {SEVERITY_OPTIONS.map(option => (
            <Pressable
              key={option.value}
              style={[styles.chip, severity === option.value && styles.chipActive]}
              onPress={() => setSeverity(option.value)}>
              <Text style={[styles.chipText, severity === option.value && styles.chipTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Status</Text>
        <View style={styles.chipRow}>
          {STATUS_OPTIONS.map(option => (
            <Pressable
              key={option.value}
              style={[styles.chip, status === option.value && styles.chipActive]}
              onPress={() => setStatus(option.value)}>
              <Text style={[styles.chipText, status === option.value && styles.chipTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

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
            {saving ? 'Saving…' : existing ? 'Save Changes' : 'Log Injury'}
          </Text>
        </Pressable>

        {existing ? (
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Injury</Text>
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
    iosDateRow: {
      alignItems: 'flex-start',
    },
    androidDateText: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.base,
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
      backgroundColor: UI_ACCENT_MUTED,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    chipActive: {
      backgroundColor: UI_ACCENT,
      borderColor: UI_ACCENT,
    },
    chipText: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.semibold,
    },
    chipTextActive: {
      color: UI_ACCENT_TEXT,
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
      fontWeight: FONT_WEIGHT.bold,
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
      fontSize: FONT_SIZE.base,
    },
  });
}

export default InjuryFormScreen;
