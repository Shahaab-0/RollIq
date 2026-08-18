import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getTheme, Theme, UI_ACCENT, UI_ACCENT_MUTED } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import FloatingAddButton from '../../../components/FloatingAddButton';
import ErrorState from '../../../components/ErrorState';
import { useGyms } from '../hooks/useGyms';
import type { HomeStackParamList } from '../../../navigation/types';
import type { Gym } from '../types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'GymList'>;

function GymListScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const { data: gyms = [], isLoading, isError } = useGyms();

  const openAddChoices = () => {
    Alert.alert('Add a Gym', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Create a Gym', onPress: () => navigation.navigate('GymForm') },
      { text: 'Join with Code', onPress: () => navigation.navigate('GymJoin') },
    ]);
  };

  const renderItem = ({ item }: { item: Gym }) => (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate('GymDetail', { gymId: item.id })}>
      <View style={styles.cardMain}>
        <Text style={styles.title}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <Text style={styles.meta}>
          {item.member_count} member{item.member_count === 1 ? '' : 's'} · {item.class_count} class
          {item.class_count === 1 ? '' : 'es'}
        </Text>
      </View>
      <Text style={styles.roleBadge}>{item.my_role}</Text>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gyms</Text>
      </View>

      {isLoading && gyms.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={UI_ACCENT} />
        </View>
      ) : isError ? (
        <ErrorState />
      ) : gyms.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            No gyms yet — create one or join with an invite code.
          </Text>
        </View>
      ) : (
        <FlatList
          data={gyms}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      <FloatingAddButton onPress={openAddChoices} />
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
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 12,
    },
    headerTitle: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.title,
      fontWeight: FONT_WEIGHT.extrabold,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.body,
      textAlign: 'center',
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 100,
      gap: 10,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      padding: 16,
    },
    cardMain: {
      flex: 1,
      gap: 4,
    },
    title: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.base,
      fontWeight: FONT_WEIGHT.semibold,
    },
    description: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
    },
    meta: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.tiny,
      marginTop: 2,
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
  });
}

export default GymListScreen;
