import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { Play, Trash2 } from 'lucide-react-native';
import { getTheme, Theme } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from '../../../theme/typography';
import type { GymClassVideo } from '../types';

interface Props {
  video: GymClassVideo;
  canManage: boolean;
  onWatch: () => void;
  onDelete: () => void;
}

// Presentational -- GymClassDetailScreen owns the query/mutation and passes
// callbacks down, same split as InstructionalVideoRow.
function GymClassVideoRow({
  video,
  canManage,
  onWatch,
  onDelete,
}: Readonly<Props>) {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      <View style={styles.top}>
        <Text style={styles.videoLabel}>Video {video.sequence_number}</Text>
        {canManage ? (
          <Pressable hitSlop={8} style={styles.deleteButton} onPress={onDelete}>
            <Trash2 color={theme.danger} size={16} />
          </Pressable>
        ) : null}
      </View>

      {video.techniques.length > 0 ? (
        <View style={styles.chipRow}>
          {video.techniques.map((technique, index) => (
            <View key={`${technique}-${index}`} style={styles.chip}>
              <Text style={styles.chipText}>{technique}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <Pressable style={styles.watchButton} onPress={onWatch}>
        <Play color={theme.accentText} size={16} />
        <Text style={styles.watchButtonText}>Watch</Text>
      </Pressable>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    row: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      padding: 14,
      gap: 10,
    },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    videoLabel: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.semibold,
      fontFamily: FONT_FAMILY.semibold,
    },
    deleteButton: {
      padding: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.danger,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: theme.accentMuted,
    },
    chipText: {
      color: theme.accent,
      fontSize: FONT_SIZE.tiny,
      fontWeight: FONT_WEIGHT.semibold,
      fontFamily: FONT_FAMILY.semibold,
    },
    watchButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: theme.accent,
      borderRadius: 10,
      paddingVertical: 10,
      alignSelf: 'flex-start',
      paddingHorizontal: 16,
    },
    watchButtonText: {
      color: theme.accentText,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.semibold,
      fontFamily: FONT_FAMILY.semibold,
    },
  });
}

export default GymClassVideoRow;
