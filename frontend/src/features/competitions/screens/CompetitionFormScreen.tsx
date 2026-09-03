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
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { ChevronLeft } from 'lucide-react-native';
import { getTheme, Theme } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from '../../../theme/typography';
import { formatDisplayDate, toLocalDateString } from '../../../lib/dateFormat';
import {
  useCompetitions,
  useCreateCompetition,
  useDeleteCompetition,
  useUpdateCompetition,
} from '../hooks/useCompetitions';
import type { CompetitionsStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<
  CompetitionsStackParamList,
  'CompetitionForm'
>;
type Route = RouteProp<CompetitionsStackParamList, 'CompetitionForm'>;

function CompetitionFormScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();

  const competitionId = route.params?.competitionId;
  const { data: competitions = [] } = useCompetitions();
  const existing = competitionId
    ? competitions.find(c => c.id === competitionId)
    : undefined;
  const createCompetition = useCreateCompetition();
  const updateCompetition = useUpdateCompetition();
  const deleteCompetition = useDeleteCompetition();

  const [name, setName] = useState(existing?.name ?? '');
  const [competitionDate, setCompetitionDate] = useState(
    existing?.competition_date ?? toLocalDateString(new Date()),
  );
  const [weightCategory, setWeightCategory] = useState(
    existing?.weight_category ?? '',
  );
  const [beltDivision, setBeltDivision] = useState(
    existing?.belt_division ?? '',
  );
  const [location, setLocation] = useState(existing?.location ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const dateObj = useMemo(
    () => new Date(`${competitionDate}T00:00:00`),
    [competitionDate],
  );

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'What competition is this?');
      return;
    }
    if (!weightCategory.trim()) {
      Alert.alert(
        'Weight category required',
        'What weight category did you compete in?',
      );
      return;
    }
    setSaving(true);
    const changes = {
      name: name.trim(),
      competition_date: competitionDate,
      weight_category: weightCategory.trim(),
      belt_division: beltDivision.trim() || null,
      location: location.trim() || null,
      notes: notes.trim() || null,
    };
    try {
      existing
        ? await updateCompetition.mutateAsync({ id: existing.id, changes })
        : await createCompetition.mutateAsync(changes);
      setSaving(false);
      navigation.goBack();
    } catch {
      // toast already shown by the mutation itself
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!existing) return;
    Alert.alert(
      'Delete competition?',
      'This deletes the competition and every match logged under it. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCompetition.mutateAsync(existing.id);
              navigation.goBack();
            } catch {
              // toast already shown by the mutation itself
            }
          },
        },
      ],
    );
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
          {existing ? 'Edit Competition' : 'Log Competition'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Competition name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. IBJJF Pan Ams"
          placeholderTextColor={theme.textSecondary}
        />

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
                if (selected) setCompetitionDate(toLocalDateString(selected));
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
                  if (selected) setCompetitionDate(toLocalDateString(selected));
                },
              })
            }
          >
            <Text style={styles.androidDateText}>
              {formatDisplayDate(competitionDate)}
            </Text>
          </Pressable>
        )}

        <Text style={styles.label}>Weight category</Text>
        <TextInput
          style={styles.input}
          value={weightCategory}
          onChangeText={setWeightCategory}
          placeholder="e.g. Featherweight"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={styles.label}>Belt division</Text>
        <TextInput
          style={styles.input}
          value={beltDivision}
          onChangeText={setBeltDivision}
          placeholder="Optional -- e.g. Blue Belt Adult"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
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
            {saving ? 'Saving…' : existing ? 'Save Changes' : 'Log Competition'}
          </Text>
        </Pressable>

        {existing ? (
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Competition</Text>
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

export default CompetitionFormScreen;
