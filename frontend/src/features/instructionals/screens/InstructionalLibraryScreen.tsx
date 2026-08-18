import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SlidersHorizontal } from 'lucide-react-native';
import { getTheme, Theme, TOAST_TEXT, UI_ACCENT, UI_ACCENT_TEXT } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import FloatingAddButton from '../../../components/FloatingAddButton';
import ErrorState from '../../../components/ErrorState';
import { useInstructionals } from '../hooks/useInstructionals';
import InstructionalCard from '../components/InstructionalCard';
import InstructionalFilters, { type OverallStatus } from '../components/InstructionalFilters';
import type { InstructionalsStackParamList } from '../../../navigation/types';
import type { Difficulty, Instructional } from '../types';

type Nav = NativeStackNavigationProp<InstructionalsStackParamList, 'InstructionalLibrary'>;

function overallStatus(item: Instructional): OverallStatus {
  if (item.video_count > 0 && item.completed_video_count === item.video_count) {
    return 'completed';
  }
  if (item.completed_video_count > 0 || item.in_progress_video_count > 0) {
    return 'in_progress';
  }
  return 'not_started';
}

function InstructionalLibraryScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const { data: items = [], isLoading, isError } = useInstructionals();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [instructor, setInstructor] = useState<string | null>(null);
  const [status, setStatus] = useState<OverallStatus | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const activeFilterCount = [category, instructor, status, difficulty].filter(Boolean).length;

  const categories = useMemo(
    () => Array.from(new Set(items.map(i => i.category))).sort(),
    [items],
  );
  const instructors = useMemo(
    () => Array.from(new Set(items.map(i => i.instructor))).sort(),
    [items],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter(item => {
      if (category && item.category !== category) return false;
      if (instructor && item.instructor !== instructor) return false;
      if (status && overallStatus(item) !== status) return false;
      if (difficulty && item.difficulty !== difficulty) return false;
      if (
        query &&
        !item.title.toLowerCase().includes(query) &&
        !item.instructor.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [items, search, category, instructor, status, difficulty]);

  const renderItem = ({ item }: { item: Instructional }) => (
    <InstructionalCard instructional={item} />
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Instructionals</Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.input}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by title or instructor"
          placeholderTextColor={theme.textSecondary}
        />
        <Pressable
          style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
          onPress={() => setFiltersVisible(true)}>
          <SlidersHorizontal
            color={activeFilterCount > 0 ? UI_ACCENT_TEXT : UI_ACCENT}
            size={20}
          />
          {activeFilterCount > 0 ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <InstructionalFilters
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        categories={categories}
        instructors={instructors}
        selectedCategory={category}
        selectedInstructor={instructor}
        selectedStatus={status}
        selectedDifficulty={difficulty}
        onChangeCategory={setCategory}
        onChangeInstructor={setInstructor}
        onChangeStatus={setStatus}
        onChangeDifficulty={setDifficulty}
        onClearAll={() => {
          setCategory(null);
          setInstructor(null);
          setStatus(null);
          setDifficulty(null);
        }}
      />

      {isLoading && items.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={UI_ACCENT} />
        </View>
      ) : isError ? (
        <ErrorState />
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No instructionals match your filters.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      <FloatingAddButton onPress={() => navigation.navigate('InstructionalForm')} />
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
    title: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.title,
      fontWeight: FONT_WEIGHT.extrabold,
    },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
    input: {
      flex: 1,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      color: theme.textPrimary,
      fontSize: FONT_SIZE.base,
    },
    filterButton: {
      padding: 11,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: UI_ACCENT,
    },
    filterButtonActive: {
      backgroundColor: UI_ACCENT,
    },
    filterBadge: {
      position: 'absolute',
      top: -6,
      right: -6,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      paddingHorizontal: 4,
      backgroundColor: theme.danger,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterBadgeText: {
      color: TOAST_TEXT,
      fontSize: FONT_SIZE.tiny,
      fontWeight: FONT_WEIGHT.bold,
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
  });
}

export default InstructionalLibraryScreen;
