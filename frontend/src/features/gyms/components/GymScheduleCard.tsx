import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Trash2 } from 'lucide-react-native';
import { getTheme, Theme } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from '../../../theme/typography';
import { formatDisplayTime } from '../../../lib/dateFormat';
import { useDeleteScheduleEntry, useGymSchedule } from '../hooks/useGyms';
import { WEEKDAY_LABELS } from '../types';
import type { HomeStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

interface Props {
  gymId: string;
  canManage: boolean;
}

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];

// Self-contained -- owns its own useGymSchedule()/useDeleteScheduleEntry()
// fetch, same pattern as GymTilesRow. Always shows all 7 weekdays (this is
// a recurring weekly template, not date-specific instances) so a member can
// see the whole week's plan at a glance.
function GymScheduleCard({ gymId, canManage }: Readonly<Props>) {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const { data: entries = [] } = useGymSchedule(gymId);
  const deleteEntry = useDeleteScheduleEntry(gymId);

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.cardTitle}>Weekly Schedule</Text>
        {canManage ? (
          <Pressable
            style={styles.addButton}
            onPress={() => navigation.navigate('GymScheduleForm', { gymId })}
          >
            <Plus color={theme.accentText} size={14} strokeWidth={2.5} />
            <Text style={styles.addButtonText}>Add Slot</Text>
          </Pressable>
        ) : null}
      </View>

      {WEEKDAYS.map(day => {
        const dayEntries = entries.filter(entry => entry.day_of_week === day);
        return (
          <View key={day} style={styles.dayRow}>
            <Text style={styles.dayLabel}>{WEEKDAY_LABELS[day]}</Text>
            <View style={styles.dayContent}>
              {dayEntries.length === 0 ? (
                <Text style={styles.noClassText}>No class</Text>
              ) : (
                dayEntries.map(entry => (
                  <View key={entry.id} style={styles.slotRow}>
                    <View style={styles.slotMain}>
                      <Text style={styles.slotTime}>
                        {formatDisplayTime(entry.start_time)} –{' '}
                        {formatDisplayTime(entry.end_time)}
                      </Text>
                      {entry.topic ? (
                        <Text style={styles.slotTopic}>{entry.topic}</Text>
                      ) : null}
                    </View>
                    {canManage ? (
                      <Pressable
                        hitSlop={8}
                        onPress={() => deleteEntry.mutate(entry.id)}
                      >
                        <Trash2 color={theme.danger} size={14} />
                      </Pressable>
                    ) : null}
                  </View>
                ))
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      gap: 10,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cardTitle: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.base,
      fontWeight: FONT_WEIGHT.bold,
      fontFamily: FONT_FAMILY.bold,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.accent,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    addButtonText: {
      color: theme.accentText,
      fontSize: FONT_SIZE.tiny,
      fontWeight: FONT_WEIGHT.semibold,
      fontFamily: FONT_FAMILY.semibold,
    },
    dayRow: {
      flexDirection: 'row',
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      gap: 12,
    },
    dayLabel: {
      width: 90,
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.semibold,
      fontFamily: FONT_FAMILY.semibold,
    },
    dayContent: {
      flex: 1,
      gap: 6,
    },
    noClassText: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
    },
    slotRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    slotMain: {
      flex: 1,
    },
    slotTime: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.semibold,
      fontFamily: FONT_FAMILY.semibold,
    },
    slotTopic: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.tiny,
      marginTop: 1,
    },
  });
}

export default GymScheduleCard;
