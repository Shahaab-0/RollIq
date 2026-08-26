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
import { ChevronLeft, PlayCircle, Repeat } from 'lucide-react-native';
import {
  getTheme,
  Theme,
  UI_ACCENT,
  UI_ACCENT_MUTED,
  UI_ACCENT_TEXT,
} from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import {
  useCreateTechnique,
  useDeleteTechnique,
  useIncrementDrillCount,
  useTechniques,
  useUpdateTechnique,
} from '../hooks/useTechniques';
import { POSITION_PRESETS } from '../types';
import type { TechniquesStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<TechniquesStackParamList, 'TechniqueForm'>;
type Route = RouteProp<TechniquesStackParamList, 'TechniqueForm'>;

function TechniqueFormScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();

  const techniqueId = route.params?.techniqueId;
  const { data: techniques = [] } = useTechniques();
  const existing = techniqueId ? techniques.find(t => t.id === techniqueId) : undefined;
  const createTechnique = useCreateTechnique();
  const updateTechnique = useUpdateTechnique();
  const deleteTechnique = useDeleteTechnique();
  const incrementDrillCount = useIncrementDrillCount();

  const [name, setName] = useState(existing?.name ?? '');
  const [position, setPosition] = useState(existing?.position ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [resourceUrl, setResourceUrl] = useState(existing?.resource_url ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Give this technique a name.');
      return;
    }
    if (!position.trim()) {
      Alert.alert('Position required', 'Pick a preset or type your own.');
      return;
    }
    setSaving(true);
    const changes = {
      name: name.trim(),
      position: position.trim(),
      notes: notes || null,
      resource_url: resourceUrl || null,
    };
    try {
      existing
        ? await updateTechnique.mutateAsync({ id: existing.id, changes })
        : await createTechnique.mutateAsync(changes);
      setSaving(false);
      navigation.goBack();
    } catch {
      // toast already shown by the mutation itself
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!existing) return;
    Alert.alert('Delete technique?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTechnique.mutateAsync(existing.id);
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
        <Text style={styles.headerTitle}>
          {existing ? 'Edit Technique' : 'New Technique'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {existing ? (
          <View style={styles.drillRow}>
            <Text style={styles.drillCount}>
              {existing.drill_count} drills logged
            </Text>
            <Pressable
              style={styles.drillButton}
              onPress={() => incrementDrillCount.mutate(existing.id)}>
              <Repeat color={UI_ACCENT} size={16} />
              <Text style={styles.drillButtonText}>+1 Drill</Text>
            </Pressable>
          </View>
        ) : null}

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Scissor Sweep"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={styles.label}>Position</Text>
        <View style={styles.chipRow}>
          {POSITION_PRESETS.map(preset => (
            <Pressable
              key={preset}
              style={[styles.chip, position === preset && styles.chipActive]}
              onPress={() => setPosition(preset)}>
              <Text
                style={[
                  styles.chipText,
                  position === preset && styles.chipTextActive,
                ]}>
                {preset}
              </Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          style={styles.input}
          value={position}
          onChangeText={setPosition}
          placeholder="Or type your own (e.g. 50/50, De La Riva)"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={styles.label}>Resource link</Text>
        <View style={styles.resourceRow}>
          <TextInput
            style={[styles.input, styles.resourceInput]}
            value={resourceUrl}
            onChangeText={setResourceUrl}
            placeholder="Optional (YouTube, BJJ Fanatics, etc.)"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
          />
          {resourceUrl ? (
            <Pressable
              style={styles.watchButton}
              onPress={() =>
                navigation.navigate('TechniqueVideoPlayer', {
                  name: name || 'Technique',
                  url: resourceUrl,
                })
              }>
              <PlayCircle color={UI_ACCENT} size={20} />
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Key details, setups, common mistakes…"
          placeholderTextColor={theme.textSecondary}
          multiline
        />

        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
          onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving…' : existing ? 'Save Changes' : 'Add Technique'}
          </Text>
        </Pressable>

        {existing ? (
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Technique</Text>
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
    drillRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
    },
    drillCount: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.body,
      fontWeight: FONT_WEIGHT.semibold,
    },
    drillButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: UI_ACCENT,
    },
    drillButtonText: {
      color: UI_ACCENT,
      fontWeight: FONT_WEIGHT.bold,
      fontSize: FONT_SIZE.label,
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
      minHeight: 90,
      textAlignVertical: 'top',
    },
    resourceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    resourceInput: {
      flex: 1,
    },
    watchButton: {
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: UI_ACCENT,
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

export default TechniqueFormScreen;
