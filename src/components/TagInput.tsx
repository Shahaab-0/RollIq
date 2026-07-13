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
import { getTheme, Theme } from '../theme/colors';

interface Props {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

// Free-text tag entry (e.g. submissions landed/received) — type a value,
// hit return or the + button to add it as a removable chip.
function TagInput({ values, onChange, placeholder }: Readonly<Props>) {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      onChange([...values, trimmed]);
    }
    setDraft('');
  };

  const removeTag = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <View>
      {values.length > 0 ? (
        <View style={styles.chipRow}>
          {values.map((value, index) => (
            <View key={`${value}-${index}`} style={styles.chip}>
              <Text style={styles.chipText}>{value}</Text>
              <Pressable hitSlop={8} onPress={() => removeTag(index)}>
                <X color={theme.textSecondary} size={14} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
      <TextInput
        style={styles.input}
        value={draft}
        onChangeText={setDraft}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        onSubmitEditing={addTag}
        returnKeyType="done"
        blurOnSubmit={false}
      />
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
      fontSize: 13,
      fontWeight: '600',
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
  });
}

export default TagInput;
