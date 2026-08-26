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
import { DrawerActions, useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, History, Plus } from 'lucide-react-native';
import {
  BELT_COLORS,
  getTheme,
  Theme,
  UI_ACCENT,
  UI_ACCENT_MUTED,
  UI_ACCENT_TEXT,
} from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import { useProfile } from '../../profile/hooks/useProfile';
import { useDashboardStats } from '../hooks/useDashboardStats';
import ProfileHeader from '../components/ProfileHeader';
import BeltTimelineCard from '../components/BeltTimelineCard';
import GymTilesRow from '../../gyms/components/GymTilesRow';
import type { AppTabsParamList, HomeStackParamList } from '../../../navigation/types';

// Dashboard lives inside HomeStack (nested under the "Home" tab) but also
// navigates across tabs (e.g. "Log Session" -> the Log tab) -- the
// composite type is what lets both kinds of .navigate() calls type-check.
type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'Dashboard'>,
  BottomTabNavigationProp<AppTabsParamList>
>;

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
  const navigation = useNavigation<Nav>();

  const { data: profile } = useProfile();
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
          onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        />

        {stats.error ? <Text style={styles.errorText}>{stats.error}</Text> : null}

        <View style={styles.card}>
          <View style={styles.weekHeaderRow}>
            <Text style={[styles.cardTitle, styles.weekHeaderTitle]}>This week</Text>
            <Text style={styles.streakInline}>{stats.currentStreak} 🔥</Text>
          </View>
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

        <GymTilesRow />

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: UI_ACCENT }]}
            onPress={() => navigation.navigate('Log', { screen: 'TrainingLog' })}>
            <Plus color={UI_ACCENT_TEXT} size={18} strokeWidth={2.5} />
            <Text style={styles.actionButtonTextPrimary}>Log Session</Text>
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
          <View style={styles.activityHeaderRow}>
            <Text style={[styles.cardTitle, styles.activityHeaderTitle]}>Recent activity</Text>
            <Pressable
              hitSlop={8}
              style={styles.activityAddButton}
              onPress={() =>
                navigation.navigate('Log', {
                  screen: 'LogSessionForm',
                  params: undefined,
                  initial: false,
                })
              }>
              <Plus color={UI_ACCENT} size={18} strokeWidth={2.5} />
            </Pressable>
          </View>
          {stats.recentActivity.length === 0 ? (
            <View style={styles.miniEmpty}>
              <View style={styles.miniEmptyIcon}>
                <History color={UI_ACCENT} size={22} />
              </View>
              <View style={styles.miniEmptyText}>
                <Text style={styles.miniEmptyTitle}>No sessions yet</Text>
                <Text style={styles.miniEmptyDesc}>
                  Tap + to log your first session and start building your history.
                </Text>
              </View>
            </View>
          ) : (
            stats.recentActivity.map((item, i) => (
              <React.Fragment key={item.id}>
                <Pressable
                  style={styles.activityRow}
                  onPress={() =>
                    navigation.navigate('Log', {
                      screen: 'LogSessionForm',
                      params: { sessionId: item.id },
                      initial: false,
                    })
                  }>
                  <View style={styles.activityIconBadge}>
                    <History color={UI_ACCENT} size={16} />
                  </View>
                  <View style={styles.activityTextStack}>
                    <Text style={styles.activityText}>{item.text}</Text>
                    <Text style={styles.activityMeta}>{item.when}</Text>
                  </View>
                  <ChevronRight color={theme.textSecondary} size={18} />
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
      paddingHorizontal: 20,
      paddingTop: 12,
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
    cardTitle: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.base,
      fontWeight: FONT_WEIGHT.bold,
      marginBottom: 12,
    },
    weekHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    weekHeaderTitle: {
      marginBottom: 0,
    },
    streakInline: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.md,
      fontWeight: FONT_WEIGHT.extrabold,
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
    activityHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    activityHeaderTitle: {
      marginBottom: 0,
    },
    activityAddButton: {
      padding: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: UI_ACCENT,
    },
    activityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 10,
    },
    activityIconBadge: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: UI_ACCENT_MUTED,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activityTextStack: {
      flex: 1,
      gap: 2,
    },
    activityText: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.body,
      fontWeight: FONT_WEIGHT.semibold,
    },
    activityMeta: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
    },
    activityDivider: {
      height: 1,
      backgroundColor: theme.border,
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
  });
}

type Styles = ReturnType<typeof createStyles>;

export default DashboardScreen;
