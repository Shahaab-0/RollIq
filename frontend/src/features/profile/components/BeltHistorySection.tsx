import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { Plus, Trash2 } from 'lucide-react-native';
import { BELT_COLORS, getTheme, Theme } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from '../../../theme/typography';
import {
  useBeltPromotions,
  useCreatePromotion,
  useDeletePromotion,
} from '../hooks/useBeltPromotions';
import { formatDisplayDate, toLocalDateString } from '../../../lib/dateFormat';
import { BELT_OPTIONS, type Belt } from '../types';

interface Props {
  onPromotionAdded: (belt: Belt) => void;
}

// Self-contained: owns its own fetch, its own "add promotion" form state,
// and dispatches directly — the parent Profile form only needs to know
// when a promotion was added, so it can sync its belt/stripes fields.
function BeltHistorySection({ onPromotionAdded }: Readonly<Props>) {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data: promotions = [] } = useBeltPromotions();
  const createPromotion = useCreatePromotion();
  const deletePromotion = useDeletePromotion();

  const [showAddPromotion, setShowAddPromotion] = useState(false);
  const [newPromotionBelt, setNewPromotionBelt] = useState<Belt>('white');
  const [newPromotionDate, setNewPromotionDate] = useState(
    toLocalDateString(new Date()),
  );
  const newPromotionDateObj = useMemo(
    () => new Date(`${newPromotionDate}T00:00:00`),
    [newPromotionDate],
  );

  const handleAddPromotion = async () => {
    try {
      await createPromotion.mutateAsync({
        belt: newPromotionBelt,
        promoted_on: newPromotionDate,
        notes: null,
      });
      setShowAddPromotion(false);
      onPromotionAdded(newPromotionBelt);
    } catch {
      // toast already shown by the mutation itself
    }
  };

  return (
    <View>
      <View style={styles.historyHeader}>
        <Text style={styles.label}>Belt history</Text>
        <Pressable
          hitSlop={8}
          style={styles.addPromotionButton}
          onPress={() => setShowAddPromotion(v => !v)}
        >
          <Plus color={theme.accent} size={16} strokeWidth={2.5} />
        </Pressable>
      </View>

      {promotions.length === 0 ? (
        <Text style={styles.emptyHistoryText}>No promotions logged yet.</Text>
      ) : (
        [...promotions].reverse().map(promotion => (
          <View key={promotion.id} style={styles.promotionRow}>
            <View>
              <Text style={styles.promotionBelt}>
                {BELT_OPTIONS.find(o => o.value === promotion.belt)?.label ??
                  promotion.belt}{' '}
                Belt
                {promotion.stripes > 0 ? ` · Stripe ${promotion.stripes}` : ''}
              </Text>
              <Text style={styles.promotionDate}>
                {formatDisplayDate(promotion.promoted_on)}
              </Text>
            </View>
            <Pressable
              hitSlop={8}
              style={styles.deleteIconButton}
              onPress={() => deletePromotion.mutate(promotion.id)}
            >
              <Trash2 color={theme.danger} size={16} />
            </Pressable>
          </View>
        ))
      )}

      {showAddPromotion ? (
        <View style={styles.addPromotionCard}>
          <Text style={styles.label}>New belt</Text>
          <View style={styles.chipRow}>
            {BELT_OPTIONS.map(option => {
              const active = newPromotionBelt === option.value;
              return (
                <Pressable
                  key={option.value}
                  style={[
                    styles.chip,
                    active && {
                      backgroundColor: BELT_COLORS[option.value],
                      borderColor: BELT_COLORS[option.value],
                    },
                  ]}
                  onPress={() => setNewPromotionBelt(option.value)}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Date</Text>
          {Platform.OS === 'ios' ? (
            <DateTimePicker
              value={newPromotionDateObj}
              mode="date"
              display="compact"
              themeVariant={theme.scheme}
              accentColor={theme.accent}
              maximumDate={new Date()}
              onChange={(_event, selected) => {
                if (selected) setNewPromotionDate(toLocalDateString(selected));
              }}
            />
          ) : (
            <Pressable
              style={styles.input}
              onPress={() =>
                DateTimePickerAndroid.open({
                  value: newPromotionDateObj,
                  mode: 'date',
                  maximumDate: new Date(),
                  onChange: (_event, selected) => {
                    if (selected) {
                      setNewPromotionDate(toLocalDateString(selected));
                    }
                  },
                })
              }
            >
              <Text style={styles.androidDateText}>
                {formatDisplayDate(newPromotionDate)}
              </Text>
            </Pressable>
          )}

          <Pressable style={styles.saveButton} onPress={handleAddPromotion}>
            <Text style={styles.saveButtonText}>Log Promotion</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    label: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.semibold,
      fontFamily: FONT_FAMILY.semibold,
      marginTop: 12,
      marginBottom: 4,
    },
    input: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: theme.textPrimary,
      fontSize: FONT_SIZE.base,
    },
    chipRow: {
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
    chipText: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.semibold,
      fontFamily: FONT_FAMILY.semibold,
    },
    chipTextActive: {
      color: theme.accentText,
    },
    saveButton: {
      backgroundColor: theme.accent,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    saveButtonText: {
      color: theme.accentText,
      fontWeight: FONT_WEIGHT.bold,
      fontFamily: FONT_FAMILY.bold,
      fontSize: FONT_SIZE.base,
    },
    historyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    addPromotionButton: {
      padding: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.accent,
    },
    emptyHistoryText: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
    },
    promotionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
    },
    promotionBelt: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.body,
      fontWeight: FONT_WEIGHT.semibold,
      fontFamily: FONT_FAMILY.semibold,
    },
    promotionDate: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.sm,
      marginTop: 2,
    },
    deleteIconButton: {
      padding: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.danger,
    },
    addPromotionCard: {
      backgroundColor: theme.surfaceAlt,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      padding: 16,
      marginTop: 4,
      marginBottom: 8,
      gap: 4,
    },
    androidDateText: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.base,
    },
  });
}

export default BeltHistorySection;
