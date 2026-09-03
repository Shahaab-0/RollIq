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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Users } from 'lucide-react-native';
import { getTheme, Theme, UI_ACCENT } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import EmptyState from '../../../components/EmptyState';
import ErrorState from '../../../components/ErrorState';
import { usePartnerHistory } from '../hooks/useRolls';
import type { RollsStackParamList } from '../../../navigation/types';
import type { PartnerHistoryEntry } from '../types';

type Nav = NativeStackNavigationProp<RollsStackParamList, 'PartnerHistory'>;

function tapRateLabel(entry: PartnerHistoryEntry): string {
  const total = entry.landed_total + entry.received_total;
  if (total === 0) return 'Even';
  const landedShare = Math.round((entry.landed_total / total) * 100);
  return `${landedShare}% you`;
}

function PartnerHistoryScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const { data: partners = [], isLoading, isError } = usePartnerHistory();

  const renderItem = ({ item }: { item: PartnerHistoryEntry }) => (
    <View style={styles.row}>
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle}>{item.partner_name}</Text>
        <Text style={styles.rowMeta}>
          {item.roll_count} roll{item.roll_count === 1 ? '' : 's'} ·{' '}
          {item.landed_total} landed · {item.received_total} received
        </Text>
      </View>
      <Text style={styles.tapRate}>{tapRateLabel(item)}</Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => navigation.goBack()}>
          <ChevronLeft color={theme.textPrimary} size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>Partner History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading && partners.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={UI_ACCENT} />
        </View>
      ) : isError ? (
        <ErrorState />
      ) : partners.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No partners yet"
          description="Log a roll with a partner's name to start building your history against them."
        />
      ) : (
        <FlatList
          data={partners}
          keyExtractor={item => item.partner_name}
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
      paddingBottom: 40,
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
    },
    rowMain: {
      gap: 4,
      flexShrink: 1,
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
    tapRate: {
      color: UI_ACCENT,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.bold,
    },
  });
}

export default PartnerHistoryScreen;
