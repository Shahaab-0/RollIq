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
import {
  BELT_COLORS,
  getTheme,
  Theme,
  UI_ACCENT,
  UI_ACCENT_TEXT,
} from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import { useAppSelector } from '../../../redux/hooks';
import { useDashboardStats } from '../hooks/useDashboardStats';
import ProfileHeader from '../components/ProfileHeader';
import BeltTimelineCard from '../components/BeltTimelineCard';
import type { AppTabsParamList } from '../../../navigation/types';

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
        <ProfileHeader
          displayName={profile?.display_name}
          belt={belt}
          stripes={profile?.current_stripes ?? 0}
          accent={accent}
        />

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
            style={[styles.actionButton, { backgroundColor: UI_ACCENT }]}
            onPress={() => navigation.navigate('Log', { screen: 'TrainingLog' })}>
            <Plus color={UI_ACCENT_TEXT} size={18} strokeWidth={2.5} />
            <Text style={styles.actionButtonTextPrimary}>Log Session</Text>
          </Pressable>
          <Pressable
            style={[
              styles.actionButton,
              styles.actionButtonOutline,
              { borderColor: UI_ACCENT },
            ]}
            onPress={() => navigation.navigate('Rolls', { screen: 'RollTracker' })}>
            <Plus color={UI_ACCENT} size={18} strokeWidth={2.5} />
            <Text style={[styles.actionButtonTextSecondary, { color: UI_ACCENT }]}>
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
              <React.Fragment key={item.id}>
                <Pressable
                  style={styles.activityRow}
                  onPress={() =>
                    navigation.navigate('Log', {
                      screen: 'LogSessionForm',
                      params: { sessionId: item.id },
                    })
                  }>
                  <Text style={styles.activityText}>{item.text}</Text>
                  <Text style={styles.activityMeta}>{item.when}</Text>
                </Pressable>
                {i < stats.recentActivity.length - 1 && (
                  <View style={styles.activityDivider} />
                )}
              </React.Fragment>
            ))
          )}
        </View>

        <BeltTimelineCard />
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
      fontSize: FONT_SIZE.label,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 24,
      gap: 16,
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
      fontSize: FONT_SIZE.streak,
      fontWeight: FONT_WEIGHT.extrabold,
    },
    streakLabel: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
      marginTop: 2,
    },
    streakBest: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
    },
    cardTitle: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.base,
      fontWeight: FONT_WEIGHT.bold,
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
      fontSize: FONT_SIZE.sm,
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
      fontWeight: FONT_WEIGHT.bold,
      fontSize: FONT_SIZE.base,
    },
    actionButtonTextSecondary: {
      fontWeight: FONT_WEIGHT.bold,
      fontSize: FONT_SIZE.base,
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
      fontSize: FONT_SIZE.xl,
      fontWeight: FONT_WEIGHT.bold,
    },
    statLabel: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.xs,
      textAlign: 'center',
    },
    activityRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    activityText: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.body,
    },
    activityMeta: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
    },
    activityDivider: {
      height: 1,
      backgroundColor: theme.border,
    },
  });
}

type Styles = ReturnType<typeof createStyles>;

export default DashboardScreen;
