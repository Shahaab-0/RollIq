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
import {
  getTheme,
  Theme,
  UI_ACCENT,
  UI_ACCENT_MUTED,
  UI_ACCENT_TEXT,
} from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import { formatDisplayTime } from '../../../lib/dateFormat';
import { useCreateScheduleEntry } from '../hooks/useGyms';
import { WEEKDAY_LABELS } from '../types';
import type { HomeStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'GymScheduleForm'>;
type Route = RouteProp<HomeStackParamList, 'GymScheduleForm'>;

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];

function timeToString(time: Date): string {
  return `${String(time.getHours()).padStart(2, '0')}:${String(
    time.getMinutes(),
  ).padStart(2, '0')}:00`;
}

function defaultTime(hours: number): Date {
  const d = new Date();
  d.setHours(hours, 0, 0, 0);
  return d;
}

interface TimeFieldProps {
  value: Date;
  onChange: (time: Date) => void;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}

// Shared iOS/Android time-picker pattern, factored out since this screen
// needs it twice (start + end) -- same DateTimePicker/DateTimePickerAndroid
// split used for date fields elsewhere in the app.
function TimeField({
  value,
  onChange,
  theme,
  styles,
}: Readonly<TimeFieldProps>) {
  if (Platform.OS === 'ios') {
    return (
      <View style={styles.iosTimeRow}>
        <DateTimePicker
          value={value}
          mode="time"
          display="compact"
          themeVariant={theme.scheme}
          accentColor={UI_ACCENT}
          onChange={(_event, selected) => {
            if (selected) onChange(selected);
          }}
        />
      </View>
    );
  }
  return (
    <Pressable
      style={styles.input}
      onPress={() =>
        DateTimePickerAndroid.open({
          value,
          mode: 'time',
          onChange: (_event, selected) => {
            if (selected) onChange(selected);
          },
        })
      }
    >
      <Text style={styles.androidTimeText}>
        {formatDisplayTime(timeToString(value))}
      </Text>
    </Pressable>
  );
}

function GymScheduleFormScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { gymId } = route.params;
  const createEntry = useCreateScheduleEntry(gymId);

  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState(() => defaultTime(18));
  const [endTime, setEndTime] = useState(() => defaultTime(19));
  const [topic, setTopic] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (
      endTime.getHours() * 60 + endTime.getMinutes() <=
      startTime.getHours() * 60 + startTime.getMinutes()
    ) {
      Alert.alert('Check the times', 'End time must be after the start time.');
      return;
    }
    setSaving(true);
    try {
      await createEntry.mutateAsync({
        day_of_week: dayOfWeek,
        start_time: timeToString(startTime),
        end_time: timeToString(endTime),
        topic: topic || null,
      });
      setSaving(false);
      navigation.goBack();
    } catch {
      // toast already shown by the mutation itself
      setSaving(false);
    }
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
        <Text style={styles.headerTitle}>Add Schedule Slot</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Day</Text>
        <View style={styles.chipRow}>
          {WEEKDAYS.map(day => (
            <Pressable
              key={day}
              style={[styles.chip, dayOfWeek === day && styles.chipActive]}
              onPress={() => setDayOfWeek(day)}
            >
              <Text
                style={[
                  styles.chipText,
                  dayOfWeek === day && styles.chipTextActive,
                ]}
              >
                {WEEKDAY_LABELS[day].slice(0, 3)}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.timeRow}>
          <View style={styles.timeField}>
            <Text style={styles.label}>From</Text>
            <TimeField
              value={startTime}
              onChange={setStartTime}
              theme={theme}
              styles={styles}
            />
          </View>
          <View style={styles.timeField}>
            <Text style={styles.label}>To</Text>
            <TimeField
              value={endTime}
              onChange={setEndTime}
              theme={theme}
              styles={styles}
            />
          </View>
        </View>

        <Text style={styles.label}>Topic (optional)</Text>
        <TextInput
          style={styles.input}
          value={topic}
          onChangeText={setTopic}
          placeholder="e.g. No-Gi Fundamentals"
          placeholderTextColor={theme.textSecondary}
        />

        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving…' : 'Add Slot'}
          </Text>
        </Pressable>
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
    timeRow: {
      flexDirection: 'row',
      gap: 12,
    },
    timeField: {
      flex: 1,
    },
    iosTimeRow: {
      alignItems: 'flex-start',
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
    androidTimeText: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.base,
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
  });
}

export default GymScheduleFormScreen;
