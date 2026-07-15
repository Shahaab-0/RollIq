import React, { useMemo } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { BELT_COLORS, getTheme, Theme } from '../../../theme/colors';
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
        <Text style={styles.emptyText}>
          No promotions logged yet — add one from your Profile.
        </Text>
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
              <Text style={styles.timelineBelt}>
                {BELT_LABELS[entry.belt]}
                {entry.isCurrent ? ' · Current' : ''}
              </Text>
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
    emptyText: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
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
    timelineBelt: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.body,
      fontWeight: FONT_WEIGHT.semibold,
    },
    timelineMeta: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.sm,
      marginTop: 2,
    },
  });
}

export default BeltTimelineCard;
