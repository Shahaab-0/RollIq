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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import { getTheme, Theme } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from '../../../theme/typography';
import { useCreateInstructional } from '../hooks/useInstructionals';
import { CATEGORY_PRESETS, DIFFICULTY_OPTIONS, Difficulty } from '../types';
import type { InstructionalsStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<
  InstructionalsStackParamList,
  'InstructionalForm'
>;

function InstructionalFormScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const createInstructional = useCreateInstructional();

  const [title, setTitle] = useState('');
  const [instructor, setInstructor] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [platform, setPlatform] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Give this instructional a title.');
      return;
    }
    if (!instructor.trim()) {
      Alert.alert('Instructor required', 'Who teaches this instructional?');
      return;
    }
    if (!category.trim()) {
      Alert.alert('Category required', 'Pick a preset or type your own.');
      return;
    }
    if (!difficulty) {
      Alert.alert('Difficulty required', 'Pick a difficulty level.');
      return;
    }
    setSaving(true);
    try {
      await createInstructional.mutateAsync({
        title: title.trim(),
        instructor: instructor.trim(),
        category: category.trim(),
        difficulty,
        platform: platform || null,
        url: url || null,
        description: description || null,
        release_year: releaseYear ? parseInt(releaseYear, 10) : null,
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
        <Text style={styles.headerTitle}>New Instructional</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Enter the System"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={styles.label}>Instructor</Text>
        <TextInput
          style={styles.input}
          value={instructor}
          onChangeText={setInstructor}
          placeholder="e.g. John Danaher"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORY_PRESETS.map(preset => (
            <Pressable
              key={preset}
              style={[styles.chip, category === preset && styles.chipActive]}
              onPress={() => setCategory(preset)}
            >
              <Text
                style={[
                  styles.chipText,
                  category === preset && styles.chipTextActive,
                ]}
              >
                {preset}
              </Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
          placeholder="Or type your own"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={styles.label}>Difficulty</Text>
        <View style={styles.chipRow}>
          {DIFFICULTY_OPTIONS.map(option => (
            <Pressable
              key={option.value}
              style={[
                styles.chip,
                difficulty === option.value && styles.chipActive,
              ]}
              onPress={() => setDifficulty(option.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  difficulty === option.value && styles.chipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Platform</Text>
        <TextInput
          style={styles.input}
          value={platform}
          onChangeText={setPlatform}
          placeholder="e.g. BJJ Fanatics"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={styles.label}>Link</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="Optional"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Release year</Text>
        <TextInput
          style={styles.input}
          value={releaseYear}
          onChangeText={setReleaseYear}
          keyboardType="number-pad"
          placeholder="Optional"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={description}
          onChangeText={setDescription}
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
            {saving ? 'Saving…' : 'Add Instructional'}
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
    chipActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
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
  });
}

export default InstructionalFormScreen;
