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
import { DrawerActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HeartPulse, Menu, Trash2 } from 'lucide-react-native';
import {
  getTheme,
  Theme,
  UI_ACCENT,
  UI_ACCENT_MUTED,
} from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import { formatDisplayDate } from '../../../lib/dateFormat';
import FloatingAddButton from '../../../components/FloatingAddButton';
import ErrorState from '../../../components/ErrorState';
import EmptyState from '../../../components/EmptyState';
import { useDeleteInjury, useInjuries } from '../hooks/useInjuries';
import type { InjuriesStackParamList } from '../../../navigation/types';
import type { Injury } from '../types';

type Nav = NativeStackNavigationProp<InjuriesStackParamList, 'InjuryList'>;

const SEVERITY_LABEL: Record<string, string> = {
  mild: 'Mild',
  moderate: 'Moderate',
  severe: 'Severe',
};

function InjuryListScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const { data: injuries = [], isLoading, isError } = useInjuries();
  const deleteInjury = useDeleteInjury();

  const active = injuries.filter(i => i.status !== 'resolved');
  const resolved = injuries.filter(i => i.status === 'resolved');

  const renderRow = (item: Injury) => (
    <Pressable
      key={item.id}
      style={styles.row}
      onPress={() => navigation.navigate('InjuryForm', { injuryId: item.id })}
    >
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle}>{item.body_part}</Text>
        <Text style={styles.rowMeta}>
          {formatDisplayDate(item.injury_date)} ·{' '}
          {SEVERITY_LABEL[item.severity]}
        </Text>
        <Text style={styles.rowDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <View style={styles.rowActions}>
        <Text
          style={[
            styles.statusBadge,
            item.status === 'active' && styles.statusBadgeActive,
          ]}
        >
          {item.status}
        </Text>
        <Pressable
          hitSlop={8}
          style={styles.deleteIconButton}
          onPress={() => deleteInjury.mutate(item.id)}
        >
          <Trash2 color={theme.danger} size={16} />
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          hitSlop={12}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Menu color={theme.textPrimary} size={22} />
        </Pressable>
        <Text style={styles.title}>Injuries</Text>
      </View>

      {isLoading && injuries.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={UI_ACCENT} />
        </View>
      ) : isError ? (
        <ErrorState />
      ) : injuries.length === 0 ? (
        <EmptyState
          icon={HeartPulse}
          title="No injuries logged"
          description="Log one if you're carrying something -- keeping a record helps you spot patterns and know when you're actually healed."
          actionLabel="Log an Injury"
          onAction={() => navigation.navigate('InjuryForm', undefined)}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {active.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active &amp; Recovering</Text>
              <View style={styles.sectionBody}>{active.map(renderRow)}</View>
            </View>
          ) : null}

          {resolved.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resolved</Text>
              <View style={styles.sectionBody}>{resolved.map(renderRow)}</View>
            </View>
          ) : null}
        </ScrollView>
      )}

      <FloatingAddButton
        onPress={() => navigation.navigate('InjuryForm', undefined)}
      />
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 16,
      gap: 12,
    },
    title: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.title,
      fontWeight: FONT_WEIGHT.extrabold,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 100,
      gap: 20,
    },
    section: {
      gap: 10,
    },
    sectionTitle: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.semibold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sectionBody: {
      gap: 10,
    },
    row: {
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
    rowMain: {
      flex: 1,
      gap: 4,
    },
    rowTitle: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.base,
      fontWeight: FONT_WEIGHT.semibold,
    },
    rowMeta: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
    },
    rowDescription: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.tiny,
      marginTop: 2,
    },
    rowActions: {
      alignItems: 'flex-end',
      gap: 8,
    },
    statusBadge: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.tiny,
      fontWeight: FONT_WEIGHT.semibold,
      backgroundColor: theme.surfaceAlt,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      overflow: 'hidden',
      textTransform: 'capitalize',
    },
    statusBadgeActive: {
      color: theme.danger,
      backgroundColor: UI_ACCENT_MUTED,
    },
    deleteIconButton: {
      padding: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.danger,
    },
  });
}

export default InjuryListScreen;
