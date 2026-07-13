import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Plus } from 'lucide-react-native';
import { BELT_COLORS, getTheme, Theme, UI_ACCENT_TEXT } from '../../../theme/colors';
import { useAppSelector } from '../../../app/hooks';
import { useDashboardStats } from '../hooks/useDashboardStats';
import type { AppTabsParamList } from '../../../navigation/types';

const BELT_LABELS: Record<keyof typeof BELT_COLORS, string> = {
  white: 'White Belt',
  blue: 'Blue Belt',
  purple: 'Purple Belt',
  brown: 'Brown Belt',
  black: 'Black Belt',
};

function initialsFor(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');
}

function StatCard({
  label,
  value,
  styles,
}: Readonly<{ label: string; value: string; styles: Styles }>) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation =
    useNavigation<BottomTabNavigationProp<AppTabsParamList>>();

  const profile = useAppSelector(state => state.profile.data);
  const stats = useDashboardStats();

  const belt = profile?.current_belt ?? 'white';
  const accent = BELT_COLORS[belt];

  if (stats.loading && !stats.recentActivity.length) {
    return (
      <View style={[styles.screen, styles.loadingScreen]}>
        <ActivityIndicator color={accent} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.avatar, { borderColor: accent }]}>
            <Text style={styles.avatarText}>
              {initialsFor(profile?.display_name)}
            </Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.name}>{profile?.display_name ?? 'Your name'}</Text>
            <View style={styles.beltRow}>
              <View style={[styles.beltDot, { backgroundColor: accent }]} />
              <Text style={styles.beltLabel}>
                {BELT_LABELS[belt]} · {profile?.current_stripes ?? 0} stripes
              </Text>
            </View>
          </View>
        </View>

        {stats.error ? <Text style={styles.errorText}>{stats.error}</Text> : null}

        <View style={[styles.card, styles.streakCard]}>
          <View>
            <Text style={styles.streakValue}>{stats.currentStreak} 🔥</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
          <Text style={styles.streakBest}>Best: {stats.bestStreak} days</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>This week</Text>
          <View style={styles.weekRow}>
            {stats.week.map(day => (
              <View key={day.key} style={styles.dayColumn}>
                <View
                  style={[
                    styles.dayDot,
                    day.trained
                      ? { backgroundColor: accent }
                      : styles.dayDotEmpty,
                  ]}
                />
                <Text style={styles.dayLabel}>{day.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: accent }]}
            onPress={() => navigation.navigate('Log')}>
            <Plus color={UI_ACCENT_TEXT} size={18} strokeWidth={2.5} />
            <Text style={styles.actionButtonTextPrimary}>Log Session</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.actionButtonOutline, { borderColor: accent }]}
            onPress={() => navigation.navigate('Rolls')}>
            <Plus color={accent} size={18} strokeWidth={2.5} />
            <Text style={[styles.actionButtonTextSecondary, { color: accent }]}>
              Log Roll
            </Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <StatCard label="mat hours" value={String(stats.matHours)} styles={styles} />
          <StatCard label="classes / yr" value={String(stats.classesThisYear)} styles={styles} />
          <StatCard
            label="sub success"
            value={stats.subSuccessPct === null ? '--' : `${stats.subSuccessPct}%`}
            styles={styles}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent activity</Text>
          {stats.recentActivity.length === 0 ? (
            <Text style={styles.activityMeta}>
              No sessions logged yet — tap "+ Log Session" to start.
            </Text>
          ) : (
            stats.recentActivity.map((item, i) => (
              <React.Fragment key={item.text + item.when}>
                <View style={styles.activityRow}>
                  <Text style={styles.activityText}>{item.text}</Text>
                  <Text style={styles.activityMeta}>{item.when}</Text>
                </View>
                {i < stats.recentActivity.length - 1 && (
                  <View style={styles.activityDivider} />
                )}
              </React.Fragment>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    loadingScreen: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorText: {
      color: theme.danger,
      fontSize: 13,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 24,
      gap: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      borderWidth: 2,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: theme.textPrimary,
      fontWeight: '700',
      fontSize: 16,
    },
    headerText: {
      gap: 4,
    },
    name: {
      color: theme.textPrimary,
      fontSize: 20,
      fontWeight: '700',
    },
    beltRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    beltDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    beltLabel: {
      color: theme.textSecondary,
      fontSize: 13,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    streakCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    streakValue: {
      color: theme.textPrimary,
      fontSize: 32,
      fontWeight: '800',
    },
    streakLabel: {
      color: theme.textSecondary,
      fontSize: 13,
      marginTop: 2,
    },
    streakBest: {
      color: theme.textSecondary,
      fontSize: 13,
    },
    cardTitle: {
      color: theme.textPrimary,
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 12,
    },
    weekRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    dayColumn: {
      alignItems: 'center',
      gap: 8,
    },
    dayDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
    },
    dayDotEmpty: {
      backgroundColor: theme.surfaceAlt,
      borderWidth: 1,
      borderColor: theme.border,
    },
    dayLabel: {
      color: theme.textSecondary,
      fontSize: 12,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      paddingVertical: 16,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    actionButtonOutline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
    },
    actionButtonTextPrimary: {
      color: UI_ACCENT_TEXT,
      fontWeight: '700',
      fontSize: 15,
    },
    actionButtonTextSecondary: {
      fontWeight: '700',
      fontSize: 15,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: 14,
      alignItems: 'center',
      gap: 4,
    },
    statValue: {
      color: theme.textPrimary,
      fontSize: 18,
      fontWeight: '700',
    },
    statLabel: {
      color: theme.textSecondary,
      fontSize: 11,
      textAlign: 'center',
    },
    activityRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    activityText: {
      color: theme.textPrimary,
      fontSize: 14,
    },
    activityMeta: {
      color: theme.textSecondary,
      fontSize: 13,
    },
    activityDivider: {
      height: 1,
      backgroundColor: theme.border,
    },
  });
}

type Styles = ReturnType<typeof createStyles>;

export default DashboardScreen;
