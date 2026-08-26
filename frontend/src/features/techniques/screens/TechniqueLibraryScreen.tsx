import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  useColorScheme,
  View,
} from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronDown,
  ChevronUp,
  Menu,
  PlayCircle,
  Repeat,
  Trash2,
} from 'lucide-react-native';
import { getTheme, Theme, UI_ACCENT, UI_ACCENT_TEXT } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import FloatingAddButton from '../../../components/FloatingAddButton';
import ErrorState from '../../../components/ErrorState';
import {
  useDeleteTechnique,
  useImportFundamentals,
  useIncrementDrillCount,
  useTechniques,
} from '../hooks/useTechniques';
import { FUNDAMENTALS_SEED } from '../fundamentalsSeed';
import { POSITION_PRESETS } from '../types';
import type { TechniquesStackParamList } from '../../../navigation/types';
import type { Technique } from '../types';

type Nav = NativeStackNavigationProp<TechniquesStackParamList, 'TechniqueLibrary'>;

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface PositionGroup {
  position: string;
  techniques: Technique[];
}

function groupByPosition(items: Technique[]): PositionGroup[] {
  const map = new Map<string, Technique[]>();
  for (const t of items) {
    const key = t.position || 'Uncategorized';
    const group = map.get(key) ?? [];
    group.push(t);
    map.set(key, group);
  }

  const keys = Array.from(map.keys()).sort((a, b) => {
    const ai = POSITION_PRESETS.indexOf(a);
    const bi = POSITION_PRESETS.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });

  return keys.map(position => ({ position, techniques: map.get(position)! }));
}

function TechniqueLibraryScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const { data: items = [], isLoading, isError } = useTechniques();
  const deleteTechnique = useDeleteTechnique();
  const incrementDrillCount = useIncrementDrillCount();
  const importFundamentals = useImportFundamentals();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const groups = useMemo(() => groupByPosition(items), [items]);
  const [importing, setImporting] = useState(false);

  const handleImportFundamentals = async () => {
    setImporting(true);
    await importFundamentals.mutateAsync(
      FUNDAMENTALS_SEED.map(seed => ({
        name: seed.name,
        position: seed.position,
        notes: seed.description,
        resource_url: seed.videoUrl,
      })),
    );
    setImporting(false);
  };

  const toggleGroup = (position: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(position)) {
        next.delete(position);
      } else {
        next.add(position);
      }
      return next;
    });
  };

  const renderTechnique = (item: Technique) => (
    <Pressable
      key={item.id}
      style={styles.row}
      onPress={() =>
        navigation.navigate('TechniqueForm', { techniqueId: item.id })
      }>
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle}>{item.name}</Text>
        <Text style={styles.rowMeta}>{item.drill_count} drills logged</Text>
      </View>
      <View style={styles.rowActions}>
        {item.resource_url ? (
          <Pressable
            hitSlop={8}
            style={styles.watchButton}
            onPress={() =>
              navigation.navigate('TechniqueVideoPlayer', {
                name: item.name,
                url: item.resource_url as string,
              })
            }>
            <PlayCircle color={UI_ACCENT} size={18} />
          </Pressable>
        ) : null}
        <Pressable
          hitSlop={8}
          style={styles.drillButton}
          onPress={() => incrementDrillCount.mutate(item.id)}>
          <Repeat color={UI_ACCENT} size={18} />
        </Pressable>
        <Pressable
          hitSlop={8}
          style={styles.deleteIconButton}
          onPress={() => deleteTechnique.mutate(item.id)}>
          <Trash2 color={theme.danger} size={18} />
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          hitSlop={12}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Menu color={theme.textPrimary} size={22} />
        </Pressable>
        <Text style={styles.title}>Technique Journal</Text>
      </View>

      {isLoading && items.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={UI_ACCENT} />
        </View>
      ) : isError ? (
        <ErrorState />
      ) : items.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            No techniques logged yet — tap + to add one.
          </Text>
          <Pressable
            style={[styles.importButton, importing && styles.importButtonDisabled]}
            disabled={importing}
            onPress={handleImportFundamentals}>
            <Text style={styles.importButtonText}>
              {importing ? 'Importing…' : 'Import Fundamentals'}
            </Text>
          </Pressable>
          <Text style={styles.importHint}>
            Adds {FUNDAMENTALS_SEED.length} beginner-friendly techniques to
            get you started — you can edit, drill, or delete any of them.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}>
          {groups.map(group => {
            const isCollapsed = collapsed.has(group.position);
            return (
              <View key={group.position} style={styles.section}>
                <Pressable
                  style={styles.sectionHeader}
                  onPress={() => toggleGroup(group.position)}>
                  <Text style={styles.sectionHeaderText}>
                    {group.position} ({group.techniques.length})
                  </Text>
                  {isCollapsed ? (
                    <ChevronDown color={theme.textSecondary} size={18} />
                  ) : (
                    <ChevronUp color={theme.textSecondary} size={18} />
                  )}
                </Pressable>
                {!isCollapsed ? (
                  <View style={styles.sectionBody}>
                    {group.techniques.map(renderTechnique)}
                  </View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      )}

      <FloatingAddButton onPress={() => navigation.navigate('TechniqueForm', undefined)} />
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
      paddingHorizontal: 32,
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.body,
      textAlign: 'center',
      marginBottom: 20,
    },
    importButton: {
      backgroundColor: UI_ACCENT,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    importButtonDisabled: {
      opacity: 0.6,
    },
    importButtonText: {
      color: UI_ACCENT_TEXT,
      fontWeight: FONT_WEIGHT.bold,
      fontSize: FONT_SIZE.base,
    },
    importHint: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.sm,
      textAlign: 'center',
      marginTop: 12,
      paddingHorizontal: 16,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 100,
    },
    section: {
      marginBottom: 12,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.surfaceAlt,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    sectionHeaderText: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.body,
      fontWeight: FONT_WEIGHT.bold,
    },
    sectionBody: {
      gap: 10,
      marginTop: 10,
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
    rowActions: {
      flexDirection: 'row',
      gap: 8,
    },
    watchButton: {
      padding: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: UI_ACCENT,
    },
    drillButton: {
      padding: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: UI_ACCENT,
    },
    deleteIconButton: {
      padding: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.danger,
    },
  });
}

export default TechniqueLibraryScreen;
