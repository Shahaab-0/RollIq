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
import {
  getTheme,
  Theme,
  UI_ACCENT,
  UI_ACCENT_MUTED,
  UI_ACCENT_TEXT,
} from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import {
  useCreateRoll,
  useDeleteRoll,
  useRolls,
  useUpdateRoll,
} from '../hooks/useRolls';
import TagInput from '../../../components/TagInput';
import type { RollsStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<RollsStackParamList, 'LogRollForm'>;
type Route = RouteProp<RollsStackParamList, 'LogRollForm'>;

const EFFORT_LEVELS = [1, 2, 3, 4, 5];

function LogRollFormScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();

  const rollId = route.params?.rollId;
  const { data: rolls = [] } = useRolls();
  const existing = rollId ? rolls.find(r => r.id === rollId) : undefined;
  const createRoll = useCreateRoll();
  const updateRoll = useUpdateRoll();
  const deleteRoll = useDeleteRoll();

  const [partnerName, setPartnerName] = useState(existing?.partner_name ?? '');
  const [landed, setLanded] = useState<string[]>(
    existing?.submissions_landed ?? [],
  );
  const [received, setReceived] = useState<string[]>(
    existing?.submissions_received ?? [],
  );
  const [escapes, setEscapes] = useState(
    existing?.escapes ? String(existing.escapes) : '',
  );
  const [effort, setEffort] = useState<number | null>(
    existing?.effort_rating ?? null,
  );
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const changes = {
      session_id: existing?.session_id ?? null,
      partner_name: partnerName || null,
      submissions_landed: landed,
      submissions_received: received,
      escapes: escapes ? parseInt(escapes, 10) : 0,
      effort_rating: effort,
      notes: notes || null,
    };
    try {
      existing
        ? await updateRoll.mutateAsync({ id: existing.id, changes })
        : await createRoll.mutateAsync(changes);
      setSaving(false);
      navigation.goBack();
    } catch {
      // toast already shown by the mutation itself
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!existing) return;
    Alert.alert('Delete roll?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRoll.mutateAsync(existing.id);
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
          {existing ? 'Edit Roll' : 'Log Roll'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Partner</Text>
        <TextInput
          style={styles.input}
          value={partnerName}
          onChangeText={setPartnerName}
          placeholder="Optional"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={styles.label}>Submissions landed</Text>
        <TagInput
          values={landed}
          onChange={setLanded}
          placeholder="e.g. Triangle — type and press return"
        />

        <Text style={styles.label}>Submissions received (taps)</Text>
        <TagInput
          values={received}
          onChange={setReceived}
          placeholder="e.g. Armbar — type and press return"
        />

        <Text style={styles.label}>Escapes</Text>
        <TextInput
          style={styles.input}
          value={escapes}
          onChangeText={setEscapes}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={styles.label}>Effort</Text>
        <View style={styles.effortRow}>
          {EFFORT_LEVELS.map(level => (
            <Pressable
              key={level}
              style={[
                styles.effortDot,
                effort === level && styles.effortDotActive,
              ]}
              onPress={() => setEffort(level)}
            >
              <Text
                style={[
                  styles.effortText,
                  effort === level && styles.effortTextActive,
                ]}
              >
                {level}
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
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving…' : existing ? 'Save Changes' : 'Log Roll'}
          </Text>
        </Pressable>

        {existing ? (
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Roll</Text>
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
      minHeight: 90,
      textAlignVertical: 'top',
    },
    effortRow: {
      flexDirection: 'row',
      gap: 8,
    },
    effortDot: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: UI_ACCENT_MUTED,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    effortDotActive: {
      backgroundColor: UI_ACCENT,
      borderColor: UI_ACCENT,
    },
    effortText: {
      color: theme.textSecondary,
      fontWeight: FONT_WEIGHT.bold,
    },
    effortTextActive: {
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

export default LogRollFormScreen;
