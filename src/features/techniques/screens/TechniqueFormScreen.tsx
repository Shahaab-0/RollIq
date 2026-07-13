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
import { ChevronLeft, Repeat } from 'lucide-react-native';
import { getTheme, Theme, UI_ACCENT, UI_ACCENT_TEXT } from '../../../theme/colors';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  createTechnique,
  deleteTechnique,
  incrementDrillCount,
  updateTechnique,
} from '../techniquesSlice';
import { Position, POSITION_OPTIONS } from '../types';
import type { TechniquesStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<TechniquesStackParamList, 'TechniqueForm'>;
type Route = RouteProp<TechniquesStackParamList, 'TechniqueForm'>;

function TechniqueFormScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const dispatch = useAppDispatch();

  const techniqueId = route.params?.techniqueId;
  const existing = useAppSelector(state =>
    techniqueId
      ? state.techniques.items.find(t => t.id === techniqueId)
      : undefined,
  );

  const [name, setName] = useState(existing?.name ?? '');
  const [position, setPosition] = useState<Position>(
    existing?.position ?? 'guard',
  );
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [resourceUrl, setResourceUrl] = useState(existing?.resource_url ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Give this technique a name.');
      return;
    }
    setSaving(true);
    const changes = {
      name: name.trim(),
      position,
      notes: notes || null,
      resource_url: resourceUrl || null,
    };
    const result = existing
      ? await dispatch(updateTechnique({ id: existing.id, changes }))
      : await dispatch(createTechnique(changes));
    setSaving(false);
    if (
      result.type === createTechnique.fulfilled.type ||
      result.type === updateTechnique.fulfilled.type
    ) {
      navigation.goBack();
    } else {
      Alert.alert('Something went wrong', 'Could not save this technique.');
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
          await dispatch(deleteTechnique(existing.id));
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
              onPress={() => dispatch(incrementDrillCount(existing.id))}>
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
          {POSITION_OPTIONS.map(option => (
            <Pressable
              key={option.value}
              style={[
                styles.chip,
                position === option.value && styles.chipActive,
              ]}
              onPress={() => setPosition(option.value)}>
              <Text
                style={[
                  styles.chipText,
                  position === option.value && styles.chipTextActive,
                ]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Resource link</Text>
        <TextInput
          style={styles.input}
          value={resourceUrl}
          onChangeText={setResourceUrl}
          placeholder="Optional (YouTube, BJJ Fanatics, etc.)"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
        />

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
      fontSize: 14,
      fontWeight: '600',
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
      fontWeight: '700',
      fontSize: 13,
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

export default TechniqueFormScreen;
