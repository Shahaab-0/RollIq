import React, { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Repeat } from 'lucide-react-native';
import { getTheme, Theme, UI_ACCENT, UI_ACCENT_TEXT } from '../../../theme/colors';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchTechniques, incrementDrillCount } from '../techniquesSlice';
import { POSITION_OPTIONS } from '../types';
import type { TechniquesStackParamList } from '../../../navigation/types';
import type { Technique } from '../types';

type Nav = NativeStackNavigationProp<TechniquesStackParamList, 'TechniqueLibrary'>;

function TechniqueLibraryScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector(state => state.techniques);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTechniques());
    }
  }, [dispatch, status]);

  const sections = useMemo(
    () =>
      POSITION_OPTIONS.map(option => ({
        title: option.label,
        data: items.filter(t => t.position === option.value),
      })).filter(section => section.data.length > 0),
    [items],
  );

  const renderItem = ({ item }: { item: Technique }) => (
    <Pressable
      style={styles.row}
      onPress={() =>
        navigation.navigate('TechniqueForm', { techniqueId: item.id })
      }>
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle}>{item.name}</Text>
        <Text style={styles.rowMeta}>{item.drill_count} drills logged</Text>
      </View>
      <Pressable
        hitSlop={8}
        style={styles.drillButton}
        onPress={() => dispatch(incrementDrillCount(item.id))}>
        <Repeat color={UI_ACCENT} size={18} />
      </Pressable>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Technique Journal</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => navigation.navigate('TechniqueForm', undefined)}>
          <Plus color={UI_ACCENT_TEXT} size={20} strokeWidth={2.5} />
        </Pressable>
      </View>

      {status === 'loading' && items.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={UI_ACCENT} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            No techniques logged yet — tap + to add one.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 16,
    },
    title: {
      color: theme.textPrimary,
      fontSize: 24,
      fontWeight: '800',
    },
    addButton: {
      backgroundColor: UI_ACCENT,
      borderRadius: 20,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: 14,
      textAlign: 'center',
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 24,
    },
    sectionHeader: {
      color: theme.textSecondary,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 16,
      marginBottom: 8,
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
      marginBottom: 10,
    },
    rowMain: {
      gap: 4,
    },
    rowTitle: {
      color: theme.textPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
    rowMeta: {
      color: theme.textSecondary,
      fontSize: 13,
    },
    drillButton: {
      padding: 6,
    },
  });
}

export default TechniqueLibraryScreen;
