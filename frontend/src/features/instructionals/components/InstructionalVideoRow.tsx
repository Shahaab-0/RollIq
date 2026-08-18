import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { Play } from 'lucide-react-native';
import {
  getTheme,
  Theme,
  UI_ACCENT,
  UI_ACCENT_MUTED,
  UI_ACCENT_TEXT,
} from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import { PROGRESS_STATUS_OPTIONS, type InstructionalVideo, type ProgressStatus } from '../types';

interface Props {
  video: InstructionalVideo;
  status: ProgressStatus | null;
  onChangeStatus: (status: ProgressStatus) => void;
  onClearStatus: () => void;
  onWatch: () => void;
}

// Presentational row used inside InstructionalCard's expanded accordion --
// tapping a status chip again clears it (untrack), matching how selectable
// chips behave elsewhere in this app.
function InstructionalVideoRow({
  video,
  status,
  onChangeStatus,
  onClearStatus,
  onWatch,
}: Readonly<Props>) {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      <View style={styles.rowMain}>
        <Text style={styles.videoTitle}>{video.title}</Text>
        <View style={styles.chipRow}>
          {PROGRESS_STATUS_OPTIONS.map(option => {
            const active = status === option.value;
            return (
              <Pressable
                key={option.value}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => (active ? onClearStatus() : onChangeStatus(option.value))}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {video.url ? (
        <Pressable style={styles.watchButton} onPress={onWatch}>
          <Play color={UI_ACCENT} size={16} />
          <Text style={styles.watchText}>Watch</Text>
        </Pressable>
      ) : (
        <Text style={styles.noLinkText}>No link yet</Text>
      )}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      gap: 12,
    },
    rowMain: {
      flex: 1,
      gap: 8,
    },
    videoTitle: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.body,
      fontWeight: FONT_WEIGHT.semibold,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    chip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 14,
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
      fontSize: FONT_SIZE.tiny,
      fontWeight: FONT_WEIGHT.semibold,
    },
    chipTextActive: {
      color: UI_ACCENT_TEXT,
    },
    watchButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: UI_ACCENT,
    },
    watchText: {
      color: UI_ACCENT,
      fontWeight: FONT_WEIGHT.semibold,
      fontSize: FONT_SIZE.label,
    },
    noLinkText: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.tiny,
    },
  });
}

export default InstructionalVideoRow;
