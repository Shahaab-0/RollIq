import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { getTheme, Theme } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from '../../../theme/typography';

const PRODUCTIVITY_LEVELS = [1, 2, 3, 4, 5];

interface Props {
  roundsCount: string;
  onChangeRoundsCount: (value: string) => void;
  roundMinutes: string;
  onChangeRoundMinutes: (value: string) => void;
  submissionsLandedCount: string;
  onChangeSubmissionsLandedCount: (value: string) => void;
  productivityRating: number | null;
  onChangeProductivityRating: (value: number) => void;
}

// Rolling-rounds, submissions-landed, and productivity-rating fields —
// split out of LogSessionFormScreen to keep that file under 400 lines.
function SessionProgressFields({
  roundsCount,
  onChangeRoundsCount,
  roundMinutes,
  onChangeRoundMinutes,
  submissionsLandedCount,
  onChangeSubmissionsLandedCount,
  productivityRating,
  onChangeProductivityRating,
}: Readonly<Props>) {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <>
      <Text style={styles.label}>Rolling rounds</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.rowInput]}
          value={roundsCount}
          onChangeText={onChangeRoundsCount}
          keyboardType="number-pad"
          placeholder="Rounds (e.g. 5)"
          placeholderTextColor={theme.textSecondary}
        />
        <TextInput
          style={[styles.input, styles.rowInput]}
          value={roundMinutes}
          onChangeText={onChangeRoundMinutes}
          keyboardType="number-pad"
          placeholder="Min/round (e.g. 6)"
          placeholderTextColor={theme.textSecondary}
        />
      </View>

      <Text style={styles.label}>Submissions landed</Text>
      <TextInput
        style={styles.input}
        value={submissionsLandedCount}
        onChangeText={onChangeSubmissionsLandedCount}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={theme.textSecondary}
      />

      <Text style={styles.label}>Productivity</Text>
      <View style={styles.chipRow}>
        {PRODUCTIVITY_LEVELS.map(level => (
          <Pressable
            key={level}
            style={[
              styles.ratingDot,
              productivityRating === level && styles.ratingDotActive,
            ]}
            onPress={() => onChangeProductivityRating(level)}
          >
            <Text
              style={[
                styles.chipText,
                productivityRating === level && styles.chipTextActive,
              ]}
            >
              {level}
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
    row: {
      flexDirection: 'row',
      gap: 8,
    },
    rowInput: {
      flex: 1,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
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
    ratingDot: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.accentMuted,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    ratingDotActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
  });
}

export default SessionProgressFields;
