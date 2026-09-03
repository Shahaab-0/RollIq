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
  UI_ACCENT_TEXT,
} from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import { formatDisplayDate, toLocalDateString } from '../../../lib/dateFormat';
import { useCreateGymClass } from '../hooks/useGyms';
import type { HomeStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'GymClassForm'>;
type Route = RouteProp<HomeStackParamList, 'GymClassForm'>;

function GymClassFormScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { gymId } = route.params;
  const createClass = useCreateGymClass(gymId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classDate, setClassDate] = useState(toLocalDateString(new Date()));
  const [saving, setSaving] = useState(false);
  const dateObj = useMemo(() => new Date(`${classDate}T00:00:00`), [classDate]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Give this class a title.');
      return;
    }
    setSaving(true);
    try {
      const entry = await createClass.mutateAsync({
        title: title.trim(),
        description: description || null,
        class_date: classDate,
      });
      setSaving(false);
      navigation.replace('GymClassDetail', { gymId, classId: entry.id });
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
        <Text style={styles.headerTitle}>Post a Class</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. No-Gi Fundamentals"
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
              accentColor={UI_ACCENT}
              maximumDate={new Date()}
              onChange={(_event, selected) => {
                if (selected) setClassDate(toLocalDateString(selected));
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
                  if (selected) setClassDate(toLocalDateString(selected));
                },
              })
            }
          >
            <Text style={styles.androidDateText}>
              {formatDisplayDate(classDate)}
            </Text>
          </Pressable>
        )}

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={description}
          onChangeText={setDescription}
          placeholder="What did the class cover?"
          placeholderTextColor={theme.textSecondary}
          multiline
        />

        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Posting…' : 'Post Class'}
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
    iosDateRow: {
      alignItems: 'flex-start',
    },
    androidDateText: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.base,
    },
    notesInput: {
      minHeight: 90,
      textAlignVertical: 'top',
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

export default GymClassFormScreen;
