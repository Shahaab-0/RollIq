import React, { useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';
import { getTheme, Theme } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from '../../../theme/typography';
import { DIFFICULTY_OPTIONS, Difficulty } from '../types';

export type OverallStatus = 'not_started' | 'in_progress' | 'completed';

const STATUS_FILTER_OPTIONS: { value: OverallStatus; label: string }[] = [
  { value: 'not_started', label: 'Want to Watch' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  categories: string[];
  instructors: string[];
  selectedCategory: string | null;
  selectedInstructor: string | null;
  selectedStatus: OverallStatus | null;
  selectedDifficulty: Difficulty | null;
  onChangeCategory: (value: string | null) => void;
  onChangeInstructor: (value: string | null) => void;
  onChangeStatus: (value: OverallStatus | null) => void;
  onChangeDifficulty: (value: Difficulty | null) => void;
  onClearAll: () => void;
}

// A bottom-sheet modal (same Modal-based pattern as BeltDatePromptModal)
// rather than inline scrolling rows -- each filter group gets its own
// labeled section with chips that wrap across lines instead of being
// squeezed into a single horizontal-scroll strip.
function InstructionalFilters({
  visible,
  onClose,
  categories,
  instructors,
  selectedCategory,
  selectedInstructor,
  selectedStatus,
  selectedDifficulty,
  onChangeCategory,
  onChangeInstructor,
  onChangeStatus,
  onChangeDifficulty,
  onClearAll,
}: Readonly<Props>) {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouchable} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <Pressable hitSlop={12} onPress={onClose}>
              <X color={theme.textPrimary} size={22} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <FilterSection title="Status" theme={theme} styles={styles}>
              {STATUS_FILTER_OPTIONS.map(option => (
                <Chip
                  key={option.value}
                  label={option.label}
                  active={selectedStatus === option.value}
                  onPress={() =>
                    onChangeStatus(
                      selectedStatus === option.value ? null : option.value,
                    )
                  }
                  styles={styles}
                />
              ))}
            </FilterSection>

            <FilterSection title="Difficulty" theme={theme} styles={styles}>
              {DIFFICULTY_OPTIONS.map(option => (
                <Chip
                  key={option.value}
                  label={option.label}
                  active={selectedDifficulty === option.value}
                  onPress={() =>
                    onChangeDifficulty(
                      selectedDifficulty === option.value ? null : option.value,
                    )
                  }
                  styles={styles}
                />
              ))}
            </FilterSection>

            {categories.length > 0 ? (
              <FilterSection title="Category" theme={theme} styles={styles}>
                {categories.map(value => (
                  <Chip
                    key={value}
                    label={value}
                    active={selectedCategory === value}
                    onPress={() =>
                      onChangeCategory(
                        selectedCategory === value ? null : value,
                      )
                    }
                    styles={styles}
                  />
                ))}
              </FilterSection>
            ) : null}

            {instructors.length > 0 ? (
              <FilterSection title="Instructor" theme={theme} styles={styles}>
                {instructors.map(value => (
                  <Chip
                    key={value}
                    label={value}
                    active={selectedInstructor === value}
                    onPress={() =>
                      onChangeInstructor(
                        selectedInstructor === value ? null : value,
                      )
                    }
                    styles={styles}
                  />
                ))}
              </FilterSection>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.clearButton} onPress={onClearAll}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </Pressable>
            <Pressable style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneButtonText}>Show Results</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface SectionProps {
  title: string;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
  children: React.ReactNode;
}

function FilterSection({ title, styles, children }: Readonly<SectionProps>) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.chipWrap}>{children}</View>
    </View>
  );
}

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
}

function Chip({ label, active, onPress, styles }: Readonly<ChipProps>) {
  return (
    <Pressable
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end',
    },
    backdropTouchable: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    sheet: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      maxHeight: '80%',
      paddingBottom: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.lg,
      fontWeight: FONT_WEIGHT.bold,
      fontFamily: FONT_FAMILY.bold,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
      gap: 20,
    },
    section: {
      gap: 10,
    },
    sectionLabel: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.semibold,
      fontFamily: FONT_FAMILY.semibold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    chipWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: theme.accentMuted,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    chipActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    chipText: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.semibold,
      fontFamily: FONT_FAMILY.semibold,
    },
    chipTextActive: {
      color: theme.accentText,
    },
    footer: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 20,
      paddingTop: 16,
    },
    clearButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.accent,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
    },
    clearButtonText: {
      color: theme.accent,
      fontWeight: FONT_WEIGHT.semibold,
      fontFamily: FONT_FAMILY.semibold,
      fontSize: FONT_SIZE.base,
    },
    doneButton: {
      flex: 1,
      backgroundColor: theme.accent,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
    },
    doneButtonText: {
      color: theme.accentText,
      fontWeight: FONT_WEIGHT.bold,
      fontFamily: FONT_FAMILY.bold,
      fontSize: FONT_SIZE.base,
    },
  });
}

export default InstructionalFilters;
