import React, { useMemo } from 'react';
import {
  Modal,
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
import { getTheme, Theme } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from '../../../theme/typography';
import { formatDisplayDate, toLocalDateString } from '../../../lib/dateFormat';

interface Props {
  visible: boolean;
  beltLabel: string;
  date: string;
  onChangeDate: (date: string) => void;
  onConfirm: () => void;
  onSkip: () => void;
}

// Asks "when did you receive this belt?" instead of silently assuming
// today, since a profile update might just be reflecting a promotion
// from weeks ago — the Dashboard timeline needs the real date.
function BeltDatePromptModal({
  visible,
  beltLabel,
  date,
  onChangeDate,
  onConfirm,
  onSkip,
}: Readonly<Props>) {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dateObj = useMemo(() => new Date(`${date}T00:00:00`), [date]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onSkip}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>
            When did you receive your {beltLabel} Belt?
          </Text>

          {Platform.OS === 'ios' ? (
            <DateTimePicker
              value={dateObj}
              mode="date"
              display="spinner"
              themeVariant={theme.scheme}
              accentColor={theme.accent}
              maximumDate={new Date()}
              onChange={(_event, selected) => {
                if (selected) onChangeDate(toLocalDateString(selected));
              }}
            />
          ) : (
            <Pressable
              style={styles.androidDateButton}
              onPress={() =>
                DateTimePickerAndroid.open({
                  value: dateObj,
                  mode: 'date',
                  maximumDate: new Date(),
                  onChange: (_event, selected) => {
                    if (selected) {
                      onChangeDate(toLocalDateString(selected));
                    }
                  },
                })
              }
            >
              <Text style={styles.androidDateText}>
                {formatDisplayDate(date)}
              </Text>
            </Pressable>
          )}

          <Pressable style={styles.confirmButton} onPress={onConfirm}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </Pressable>
          <Pressable style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    card: {
      width: '100%',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      padding: 20,
    },
    title: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.lg,
      fontWeight: FONT_WEIGHT.bold,
      fontFamily: FONT_FAMILY.bold,
      marginBottom: 12,
      textAlign: 'center',
    },
    androidDateButton: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    androidDateText: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.base,
    },
    confirmButton: {
      backgroundColor: theme.accent,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 16,
    },
    confirmButtonText: {
      color: theme.accentText,
      fontWeight: FONT_WEIGHT.bold,
      fontFamily: FONT_FAMILY.bold,
      fontSize: FONT_SIZE.base,
    },
    skipButton: {
      alignItems: 'center',
      paddingVertical: 14,
      marginTop: 4,
    },
    skipButtonText: {
      color: theme.textSecondary,
      fontWeight: FONT_WEIGHT.semibold,
      fontFamily: FONT_FAMILY.semibold,
      fontSize: FONT_SIZE.body,
    },
  });
}

export default BeltDatePromptModal;
