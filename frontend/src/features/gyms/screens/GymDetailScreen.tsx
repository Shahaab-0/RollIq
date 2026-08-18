import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ChevronLeft, ChevronRight, Plus, Users } from 'lucide-react-native';
import { getTheme, Theme, UI_ACCENT, UI_ACCENT_MUTED, UI_ACCENT_TEXT } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import { formatDisplayDate } from '../../../lib/dateFormat';
import FloatingAddButton from '../../../components/FloatingAddButton';
import ErrorState from '../../../components/ErrorState';
import { useGym, useGymClasses } from '../hooks/useGyms';
import GymScheduleCard from '../components/GymScheduleCard';
import type { HomeStackParamList } from '../../../navigation/types';
import type { GymClassEntry } from '../types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'GymDetail'>;
type Route = RouteProp<HomeStackParamList, 'GymDetail'>;

function GymDetailScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { gymId } = route.params;

  const { data: gym, isLoading: gymLoading, isError: gymError } = useGym(gymId);
  const {
    data: classes = [],
    isLoading: classesLoading,
    isError: classesError,
  } = useGymClasses(gymId);

  const canPost = gym?.my_role === 'owner' || gym?.my_role === 'trainer';

  const renderItem = ({ item }: { item: GymClassEntry }) => (
    <Pressable
      style={styles.classCard}
      onPress={() =>
        navigation.navigate('GymClassDetail', { gymId, classId: item.id })
      }>
      <View style={styles.classMain}>
        <Text style={styles.classTitle}>{item.title}</Text>
        <Text style={styles.classMeta}>
          {formatDisplayDate(item.class_date)} · {item.video_count} video
          {item.video_count === 1 ? '' : 's'}
        </Text>
      </View>
      <ChevronRight color={theme.textSecondary} size={18} />
    </Pressable>
  );

  if (gymLoading && !gym) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <ActivityIndicator color={UI_ACCENT} />
      </View>
    );
  }

  if (gymError && !gym) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable hitSlop={12} onPress={() => navigation.goBack()}>
            <ChevronLeft color={theme.textPrimary} size={24} />
          </Pressable>
          <Text style={styles.headerTitle}>Gym</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ErrorState />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => navigation.goBack()}>
          <ChevronLeft color={theme.textPrimary} size={24} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {gym?.name ?? 'Gym'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={classes}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.infoSection}>
            {gym?.description ? <Text style={styles.description}>{gym.description}</Text> : null}

            <Pressable
              style={styles.membersRow}
              onPress={() => navigation.navigate('GymMembers', { gymId })}>
              <Users color={theme.textSecondary} size={16} />
              <Text style={styles.membersText}>
                {gym?.member_count ?? 0} member{gym?.member_count === 1 ? '' : 's'}
              </Text>
              <ChevronRight color={theme.textSecondary} size={16} />
            </Pressable>

            {gym ? (
              <View style={styles.inviteCard}>
                <Text style={styles.inviteLabel}>Invite code</Text>
                <Text style={styles.inviteCode} selectable>
                  {gym.invite_code}
                </Text>
                <Text style={styles.inviteHint}>Long-press the code to copy and share it.</Text>
              </View>
            ) : null}

            <GymScheduleCard gymId={gymId} canManage={canPost} />

            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Class recaps</Text>
              {canPost ? (
                <Pressable
                  style={styles.postButton}
                  onPress={() => navigation.navigate('GymClassForm', { gymId })}>
                  <Plus color={UI_ACCENT_TEXT} size={14} strokeWidth={2.5} />
                  <Text style={styles.postButtonText}>Post a Class</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          classesLoading ? null : classesError ? (
            <ErrorState message="Couldn't load this gym's classes." />
          ) : (
            <Text style={styles.emptyText}>
              {canPost
                ? 'No classes posted yet — tap + to log your first recap.'
                : 'No classes posted yet.'}
            </Text>
          )
        }
      />

      {canPost ? (
        <FloatingAddButton onPress={() => navigation.navigate('GymClassForm', { gymId })} />
      ) : null}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    centered: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 16,
      gap: 12,
    },
    headerTitle: {
      flex: 1,
      color: theme.textPrimary,
      fontSize: FONT_SIZE.lg,
      fontWeight: FONT_WEIGHT.bold,
      textAlign: 'center',
    },
    headerSpacer: {
      width: 24,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 100,
      gap: 10,
    },
    infoSection: {
      gap: 12,
      marginBottom: 16,
    },
    description: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.body,
    },
    membersRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
    },
    membersText: {
      flex: 1,
      color: theme.textPrimary,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.semibold,
    },
    inviteCard: {
      backgroundColor: UI_ACCENT_MUTED,
      borderRadius: 12,
      padding: 14,
      gap: 4,
    },
    inviteLabel: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.tiny,
      fontWeight: FONT_WEIGHT.semibold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    inviteCode: {
      color: UI_ACCENT,
      fontSize: FONT_SIZE.xl,
      fontWeight: FONT_WEIGHT.extrabold,
      letterSpacing: 2,
    },
    inviteHint: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.tiny,
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    sectionTitle: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.base,
      fontWeight: FONT_WEIGHT.bold,
    },
    postButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: UI_ACCENT,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    postButtonText: {
      color: UI_ACCENT_TEXT,
      fontSize: FONT_SIZE.tiny,
      fontWeight: FONT_WEIGHT.semibold,
    },
    classCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      padding: 16,
      gap: 12,
    },
    classMain: {
      flex: 1,
      gap: 4,
    },
    classTitle: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.base,
      fontWeight: FONT_WEIGHT.semibold,
    },
    classMeta: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.body,
      textAlign: 'center',
      paddingTop: 12,
    },
  });
}

export default GymDetailScreen;
