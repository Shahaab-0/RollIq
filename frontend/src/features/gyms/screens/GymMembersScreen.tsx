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
import { ChevronLeft } from 'lucide-react-native';
import { getTheme, Theme, UI_ACCENT, UI_ACCENT_MUTED } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import { formatDisplayDate } from '../../../lib/dateFormat';
import ErrorState from '../../../components/ErrorState';
import { useGym, useGymMembers, usePromoteMember } from '../hooks/useGyms';
import type { HomeStackParamList } from '../../../navigation/types';
import type { GymMember } from '../types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'GymMembers'>;
type Route = RouteProp<HomeStackParamList, 'GymMembers'>;

function GymMembersScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { gymId } = route.params;

  const { data: gym } = useGym(gymId);
  const { data: members = [], isLoading, isError } = useGymMembers(gymId);
  const promoteMember = usePromoteMember(gymId);

  const isOwner = gym?.my_role === 'owner';

  const renderItem = ({ item }: { item: GymMember }) => (
    <View style={styles.row}>
      <View style={styles.rowMain}>
        <Text style={styles.memberId}>{item.display_name}</Text>
        <Text style={styles.joined}>Joined {formatDisplayDate(item.joined_at.slice(0, 10))}</Text>
      </View>
      <Text style={styles.roleBadge}>{item.role}</Text>
      {isOwner && item.role !== 'owner' ? (
        <Pressable
          style={styles.promoteButton}
          onPress={() =>
            promoteMember.mutate({
              userId: item.user_id,
              role: item.role === 'trainer' ? 'member' : 'trainer',
            })
          }>
          <Text style={styles.promoteButtonText}>
            {item.role === 'trainer' ? 'Demote' : 'Promote'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => navigation.goBack()}>
          <ChevronLeft color={theme.textPrimary} size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>Members</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading && members.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={UI_ACCENT} />
        </View>
      ) : isError ? (
        <ErrorState />
      ) : (
        <FlatList
          data={members}
          keyExtractor={item => item.user_id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
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
      flex: 1,
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
    },
    headerTitle: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.lg,
      fontWeight: FONT_WEIGHT.bold,
    },
    headerSpacer: {
      width: 24,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
      gap: 10,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      padding: 14,
    },
    rowMain: {
      flex: 1,
      gap: 2,
    },
    memberId: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.semibold,
    },
    joined: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.tiny,
    },
    roleBadge: {
      color: UI_ACCENT,
      fontSize: FONT_SIZE.tiny,
      fontWeight: FONT_WEIGHT.semibold,
      backgroundColor: UI_ACCENT_MUTED,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      overflow: 'hidden',
      textTransform: 'capitalize',
    },
    promoteButton: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: UI_ACCENT,
    },
    promoteButtonText: {
      color: UI_ACCENT,
      fontSize: FONT_SIZE.tiny,
      fontWeight: FONT_WEIGHT.semibold,
    },
  });
}

export default GymMembersScreen;
