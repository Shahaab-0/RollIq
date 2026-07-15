import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import {
  BELT_COLORS,
  getTheme,
  Theme,
  UI_ACCENT,
  UI_ACCENT_MUTED,
  UI_ACCENT_TEXT,
} from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { signOut } from '../../../redux/authSlice';
import { fetchProfile, updateProfile } from '../../../redux/profileSlice';
import { logProgressMilestone } from '../../../redux/beltPromotionsSlice';
import { toLocalDateString } from '../../../lib/dateFormat';
import BeltHistorySection from '../components/BeltHistorySection';
import BeltDatePromptModal from '../components/BeltDatePromptModal';
import { BELT_OPTIONS, type Belt } from '../types';

const STRIPE_OPTIONS = [0, 1, 2, 3, 4];

function ProfileScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useAppDispatch();
  const email = useAppSelector(state => state.auth.session?.user.email);
  const { data: profile, status } = useAppSelector(state => state.profile);

  const [displayName, setDisplayName] = useState('');
  const [belt, setBelt] = useState<Belt>('white');
  const [stripes, setStripes] = useState(0);
  const [homeGym, setHomeGym] = useState('');
  const [saving, setSaving] = useState(false);

  const [pendingBeltChange, setPendingBeltChange] = useState<Belt | null>(
    null,
  );
  const [pendingBeltDate, setPendingBeltDate] = useState(
    toLocalDateString(new Date()),
  );

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProfile());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? '');
      setBelt(profile.current_belt);
      setStripes(profile.current_stripes);
      setHomeGym(profile.home_gym ?? '');
    }
  }, [profile]);

  const handleSave = async () => {
    const previousBelt = profile?.current_belt;
    const previousStripes = profile?.current_stripes ?? 0;

    setSaving(true);
    const result = await dispatch(
      updateProfile({
        display_name: displayName || null,
        current_belt: belt,
        current_stripes: stripes,
        home_gym: homeGym || null,
      }),
    );
    setSaving(false);
    if (result.type !== updateProfile.fulfilled.type) {
      Alert.alert('Something went wrong', 'Could not save your profile.');
      return;
    }

    const beltChanged = previousBelt !== undefined && previousBelt !== belt;
    const stripesGained = previousBelt === belt && stripes > previousStripes;

    if (beltChanged) {
      // Ask when the promotion actually happened rather than assuming
      // today — the profile might just be getting updated to reflect a
      // promotion from weeks ago, and the timeline should use that date.
      setPendingBeltDate(toLocalDateString(new Date()));
      setPendingBeltChange(belt);
    } else if (stripesGained) {
      const milestoneResult = await dispatch(
        logProgressMilestone({ belt, stripes }),
      );
      const beltLabel =
        BELT_OPTIONS.find(o => o.value === belt)?.label ?? belt;
      if (milestoneResult.type === logProgressMilestone.fulfilled.type) {
        Alert.alert(
          'Nice progress! 🎉',
          `Stripe ${stripes} earned on your ${beltLabel} Belt. Every stripe counts!`,
        );
      } else {
        Alert.alert(
          'Saved, but…',
          'Your stripe was saved, but logging it to the timeline failed. You can try again next time you save.',
        );
      }
    }
  };

  const handleConfirmBeltDate = async () => {
    if (!pendingBeltChange) return;
    const result = await dispatch(
      logProgressMilestone({
        belt: pendingBeltChange,
        stripes: 0,
        promotedOn: pendingBeltDate,
      }),
    );
    if (result.type !== logProgressMilestone.fulfilled.type) {
      Alert.alert(
        'Something went wrong',
        "Could not log this promotion — your belt is still saved, but the timeline won't reflect it yet. Try again from Belt History.",
      );
      setPendingBeltChange(null);
      return;
    }
    const beltLabel =
      BELT_OPTIONS.find(o => o.value === pendingBeltChange)?.label ??
      pendingBeltChange;
    setPendingBeltChange(null);
    Alert.alert(
      'Congratulations! 🥋',
      `You've been promoted to ${beltLabel} Belt! Huge milestone on your journey — keep it up.`,
    );
  };

  if (status === 'loading' && !profile) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <ActivityIndicator color={UI_ACCENT} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>
        {email ? <Text style={styles.email}>{email}</Text> : null}

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your name"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={styles.label}>Belt</Text>
        <View style={styles.chipRow}>
          {BELT_OPTIONS.map(option => {
            const active = belt === option.value;
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
                onPress={() => setBelt(option.value)}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Stripes</Text>
        <View style={styles.chipRow}>
          {STRIPE_OPTIONS.map(count => (
            <Pressable
              key={count}
              style={[styles.stripeDot, stripes === count && styles.stripeDotActive]}
              onPress={() => setStripes(count)}>
              <Text
                style={[
                  styles.chipText,
                  stripes === count && styles.chipTextActive,
                ]}>
                {count}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Home gym</Text>
        <TextInput
          style={styles.input}
          value={homeGym}
          onChangeText={setHomeGym}
          placeholder="Optional"
          placeholderTextColor={theme.textSecondary}
        />

        <BeltHistorySection
          onPromotionAdded={addedBelt => {
            setBelt(addedBelt);
            setStripes(0);
          }}
        />

        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
          onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Text>
        </Pressable>

        <Pressable style={styles.signOutButton} onPress={() => dispatch(signOut())}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </Pressable>
      </ScrollView>

      <BeltDatePromptModal
        visible={pendingBeltChange !== null}
        beltLabel={
          pendingBeltChange
            ? BELT_OPTIONS.find(o => o.value === pendingBeltChange)?.label ?? ''
            : ''
        }
        date={pendingBeltDate}
        onChangeDate={setPendingBeltDate}
        onConfirm={handleConfirmBeltDate}
        onSkip={() => setPendingBeltChange(null)}
      />
    </KeyboardAvoidingView>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    centered: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      padding: 24,
      paddingTop: 60,
      gap: 8,
    },
    title: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.title,
      fontWeight: FONT_WEIGHT.extrabold,
    },
    email: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.body,
      marginBottom: 12,
    },
    label: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.semibold,
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
      backgroundColor: UI_ACCENT_MUTED,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    chipText: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.semibold,
    },
    chipTextActive: {
      color: UI_ACCENT_TEXT,
    },
    stripeDot: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: UI_ACCENT_MUTED,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    stripeDotActive: {
      backgroundColor: UI_ACCENT,
      borderColor: UI_ACCENT,
    },
    saveButton: {
      backgroundColor: UI_ACCENT,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 24,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: UI_ACCENT_TEXT,
      fontWeight: FONT_WEIGHT.bold,
      fontSize: FONT_SIZE.base,
    },
    signOutButton: {
      borderWidth: 1.5,
      borderColor: UI_ACCENT,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 12,
    },
    signOutButtonText: {
      color: UI_ACCENT,
      fontWeight: FONT_WEIGHT.bold,
      fontSize: FONT_SIZE.base,
    },
  });
}

export default ProfileScreen;
