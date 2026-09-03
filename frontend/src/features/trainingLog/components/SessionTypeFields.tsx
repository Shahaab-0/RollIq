import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { getTheme, Theme } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from '../../../theme/typography';
import { SESSION_TYPE_OPTIONS, SessionType } from '../types';

interface Props {
  gi: boolean;
  onChangeGi: (gi: boolean) => void;
  sessionType: SessionType;
  onChangeSessionType: (type: SessionType) => void;
}

// Gi/No-Gi toggle + session-type chip row, split out of
// LogSessionFormScreen to keep that file under the 400-line component cap.
function SessionTypeFields({
  gi,
  onChangeGi,
  sessionType,
  onChangeSessionType,
}: Readonly<Props>) {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <>
      <Text style={styles.label}>Type</Text>
      <View style={styles.chipRow}>
        <Pressable
          style={[styles.chip, gi && styles.chipActive]}
          onPress={() => onChangeGi(true)}
        >
          <Text style={[styles.chipText, gi && styles.chipTextActive]}>Gi</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, !gi && styles.chipActive]}
          onPress={() => onChangeGi(false)}
        >
          <Text style={[styles.chipText, !gi && styles.chipTextActive]}>
            No-Gi
          </Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Session type</Text>
      <View style={styles.chipRow}>
        {SESSION_TYPE_OPTIONS.map(option => (
          <Pressable
            key={option.value}
            style={[
              styles.chip,
              sessionType === option.value && styles.chipActive,
            ]}
            onPress={() => onChangeSessionType(option.value)}
          >
            <Text
              style={[
                styles.chipText,
                sessionType === option.value && styles.chipTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    label: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.semibold,
      fontFamily: FONT_FAMILY.semibold,
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
  });
}

export default SessionTypeFields;
