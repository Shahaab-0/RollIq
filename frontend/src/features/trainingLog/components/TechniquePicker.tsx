import React, { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';
import { getTheme, Theme, UI_ACCENT } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import {
  useCreateTechnique,
  useTechniques,
} from '../../techniques/hooks/useTechniques';

interface Props {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

// Multi-select for "techniques covered this session" — search existing
// Technique Journal entries or quickly create a new one inline.
function TechniquePicker({ selectedIds, onChange }: Readonly<Props>) {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data: items = [] } = useTechniques();
  const createTechnique = useCreateTechnique();
  const [search, setSearch] = useState('');

  const selected = items.filter(t => selectedIds.includes(t.id));

  const matches = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return items.filter(
      t => !selectedIds.includes(t.id) && t.name.toLowerCase().includes(query),
    );
  }, [items, search, selectedIds]);

  const exactMatchExists = items.some(
    t => t.name.toLowerCase() === search.trim().toLowerCase(),
  );

  const addTechnique = (id: string) => {
    onChange([...selectedIds, id]);
    setSearch('');
  };

  const removeTechnique = (id: string) => {
    onChange(selectedIds.filter(existing => existing !== id));
  };

  const handleCreate = async () => {
    const name = search.trim();
    if (!name) return;
    try {
      const created = await createTechnique.mutateAsync({
        name,
        position: 'guard',
        notes: null,
        resource_url: null,
      });
      addTechnique(created.id);
    } catch {
      // toast already shown by the mutation itself -- the picker just doesn't add
    }
  };

  return (
    <View>
      {selected.length > 0 ? (
        <View style={styles.chipRow}>
          {selected.map(t => (
            <View key={t.id} style={styles.chip}>
              <Text style={styles.chipText}>{t.name}</Text>
              <Pressable hitSlop={8} onPress={() => removeTechnique(t.id)}>
                <X color={theme.textSecondary} size={14} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <TextInput
        style={styles.input}
        value={search}
        onChangeText={setSearch}
        placeholder="Search or add a technique"
        placeholderTextColor={theme.textSecondary}
      />

      {search.trim().length > 0 ? (
        <View style={styles.dropdown}>
          {matches.map(t => (
            <Pressable
              key={t.id}
              style={styles.dropdownRow}
              onPress={() => addTechnique(t.id)}
            >
              <Text style={styles.dropdownText}>{t.name}</Text>
            </Pressable>
          ))}
          {!exactMatchExists ? (
            <Pressable style={styles.dropdownRow} onPress={handleCreate}>
              <Text style={styles.createText}>+ Create "{search.trim()}"</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 8,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: theme.surfaceAlt,
      borderWidth: 1,
      borderColor: theme.border,
    },
    chipText: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.semibold,
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
    dropdown: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      marginTop: 6,
      overflow: 'hidden',
    },
    dropdownRow: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    dropdownText: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.body,
    },
    createText: {
      color: UI_ACCENT,
      fontSize: FONT_SIZE.body,
      fontWeight: FONT_WEIGHT.semibold,
    },
  });
}

export default TechniquePicker;
