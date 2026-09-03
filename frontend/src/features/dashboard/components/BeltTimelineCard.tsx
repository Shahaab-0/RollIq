import React, { useMemo } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { Award } from 'lucide-react-native';
import {
  BELT_COLORS,
  getTheme,
  Theme,
  UI_ACCENT,
  UI_ACCENT_MUTED,
} from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import { formatDisplayDate } from '../../../lib/dateFormat';
import { BELT_LABELS } from '../../profile/types';
import { useBeltTimeline } from '../hooks/useBeltTimeline';

// Self-contained: fetches its own belt-promotion history and renders the
// timeline — split out of DashboardScreen to keep that file under 400 lines.
function BeltTimelineCard() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { timeline } = useBeltTimeline();

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Belt timeline</Text>
      {timeline.length === 0 ? (
        <View style={styles.miniEmpty}>
          <View style={styles.miniEmptyIcon}>
            <Award color={UI_ACCENT} size={22} />
          </View>
          <View style={styles.miniEmptyText}>
            <Text style={styles.miniEmptyTitle}>No promotions logged</Text>
            <Text style={styles.miniEmptyDesc}>
              Add your belt history from the Profile tab to build your timeline.
            </Text>
          </View>
        </View>
      ) : (
        [...timeline].reverse().map((entry, i) => (
          <View key={entry.id} style={styles.timelineRow}>
            <View style={styles.timelineDotColumn}>
              <View
                style={[
                  styles.timelineDot,
                  { backgroundColor: BELT_COLORS[entry.belt] },
                ]}
              />
              {i < timeline.length - 1 ? (
                <View style={styles.timelineLine} />
              ) : null}
            </View>
            <View style={styles.timelineContent}>
              <View style={styles.timelineBeltRow}>
                <Text style={styles.timelineBelt}>
                  {BELT_LABELS[entry.belt]}
                </Text>
                {entry.isCurrent ? (
                  <View style={styles.currentPill}>
                    <View
                      style={[
                        styles.currentPillDot,
                        { backgroundColor: BELT_COLORS[entry.belt] },
                      ]}
                    />
                    <Text style={styles.currentPillText}>Current</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.timelineMeta}>
                {formatDisplayDate(entry.promotedOn)}
              </Text>
              <Text style={styles.timelineMeta}>{entry.durationLabel}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cardTitle: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.base,
      fontWeight: FONT_WEIGHT.bold,
      marginBottom: 12,
    },
    miniEmpty: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 4,
    },
    miniEmptyIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: UI_ACCENT_MUTED,
      alignItems: 'center',
      justifyContent: 'center',
    },
    miniEmptyText: {
      flex: 1,
      gap: 2,
    },
    miniEmptyTitle: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.body,
      fontWeight: FONT_WEIGHT.bold,
    },
    miniEmptyDesc: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.sm,
    },
    timelineRow: {
      flexDirection: 'row',
      gap: 12,
    },
    timelineDotColumn: {
      alignItems: 'center',
      width: 12,
    },
    timelineDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    timelineLine: {
      flex: 1,
      width: 2,
      backgroundColor: theme.border,
      marginTop: 4,
      marginBottom: 4,
    },
    timelineContent: {
      flex: 1,
      paddingBottom: 16,
    },
    timelineBeltRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    timelineBelt: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.body,
      fontWeight: FONT_WEIGHT.semibold,
    },
    currentPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: UI_ACCENT_MUTED,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    currentPillDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    currentPillText: {
      color: UI_ACCENT,
      fontSize: FONT_SIZE.tiny,
      fontWeight: FONT_WEIGHT.bold,
    },
    timelineMeta: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.sm,
      marginTop: 2,
    },
  });
}

export default BeltTimelineCard;
