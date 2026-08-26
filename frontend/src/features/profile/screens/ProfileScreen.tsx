import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Menu } from 'lucide-react-native';
import { API_BASE_URL } from '@env';
import {
  BELT_COLORS,
  getTheme,
  Theme,
  UI_ACCENT,
  UI_ACCENT_MUTED,
  UI_ACCENT_TEXT,
} from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import { useAppSelector } from '../../../redux/hooks';
import { useDeleteAccount, useSignOut } from '../../auth/hooks/useAuth';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { useLogMilestone } from '../hooks/useBeltPromotions';
import { useGyms } from '../../gyms/hooks/useGyms';
import { toLocalDateString } from '../../../lib/dateFormat';
import BeltHistorySection from '../components/BeltHistorySection';
import BeltDatePromptModal from '../components/BeltDatePromptModal';
import { BELT_OPTIONS, type Belt } from '../types';

const STRIPE_OPTIONS = [0, 1, 2, 3, 4];

// API_BASE_URL is "<host>/api/v1" -- the legal pages are static content
// served by the same backend, but outside that API prefix.
const LEGAL_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

function ProfileScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();
  const email = useAppSelector(state => state.auth.session?.user.email);
  const { data: profile, isLoading } = useProfile();
  const { data: gyms = [] } = useGyms();
  const updateProfile = useUpdateProfile();
  const logMilestone = useLogMilestone();
  const signOut = useSignOut();
  const deleteAccount = useDeleteAccount();

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
    try {
      await updateProfile.mutateAsync({
        display_name: displayName || null,
        current_belt: belt,
        current_stripes: stripes,
        home_gym: homeGym || null,
      });
    } catch {
      // toast already shown by the mutation itself
      setSaving(false);
      return;
    }
    setSaving(false);

    const beltChanged = previousBelt !== undefined && previousBelt !== belt;
    const stripesGained = previousBelt === belt && stripes > previousStripes;

    if (beltChanged) {
      // Ask when the promotion actually happened rather than assuming
      // today — the profile might just be getting updated to reflect a
      // promotion from weeks ago, and the timeline should use that date.
      setPendingBeltDate(toLocalDateString(new Date()));
      setPendingBeltChange(belt);
    } else if (stripesGained) {
      const beltLabel =
        BELT_OPTIONS.find(o => o.value === belt)?.label ?? belt;
      try {
        await logMilestone.mutateAsync({ belt, stripes });
        Alert.alert(
          'Nice progress! 🎉',
          `Stripe ${stripes} earned on your ${beltLabel} Belt. Every stripe counts!`,
        );
      } catch {
        Alert.alert(
          'Saved, but…',
          'Your stripe was saved, but logging it to the timeline failed. You can try again next time you save.',
        );
      }
    }
  };

  const handleConfirmBeltDate = async () => {
    if (!pendingBeltChange) return;
    try {
      await logMilestone.mutateAsync({
        belt: pendingBeltChange,
        stripes: 0,
        promoted_on: pendingBeltDate,
      });
    } catch {
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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete your account?',
      'This permanently deletes your account and everything in it -- sessions, techniques, rolls, injuries, competitions, and gym memberships. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => deleteAccount.mutate(),
        },
      ],
    );
  };

  if (isLoading && !profile) {
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
        <View style={styles.header}>
          <Pressable
            hitSlop={12}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Menu color={theme.textPrimary} size={22} />
          </Pressable>
          <Text style={styles.title}>Profile</Text>
        </View>
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
        {gyms.length === 0 ? (
          <Text style={styles.hintText}>
            Add a gym from the Dashboard to pick it here as your home gym.
          </Text>
        ) : (
          <View style={styles.chipRow}>
            <Pressable
              style={[styles.chip, homeGym === '' && styles.chipActive]}
              onPress={() => setHomeGym('')}>
              <Text style={[styles.chipText, homeGym === '' && styles.chipTextActive]}>
                None
              </Text>
            </Pressable>
            {gyms.map(gym => {
              const active = homeGym === gym.name;
              return (
                <Pressable
                  key={gym.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setHomeGym(gym.name)}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {gym.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

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

        <Pressable style={styles.signOutButton} onPress={() => signOut.mutate()}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </Pressable>

        <View style={styles.legalRow}>
          <Pressable onPress={() => Linking.openURL(`${LEGAL_BASE_URL}/legal/privacy.html`)}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Pressable>
          <Text style={styles.legalDivider}>·</Text>
          <Pressable onPress={() => Linking.openURL(`${LEGAL_BASE_URL}/legal/terms.html`)}>
            <Text style={styles.legalLink}>Terms of Service</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.deleteAccountButton}
          disabled={deleteAccount.isPending}
          onPress={handleDeleteAccount}>
          <Text style={styles.deleteAccountButtonText}>
            {deleteAccount.isPending ? 'Deleting…' : 'Delete Account'}
          </Text>
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
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
    chipActive: {
      backgroundColor: UI_ACCENT,
      borderColor: UI_ACCENT,
    },
    hintText: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
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
    legalRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginTop: 24,
    },
    legalLink: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
      textDecorationLine: 'underline',
    },
    legalDivider: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
    },
    deleteAccountButton: {
      alignItems: 'center',
      marginTop: 20,
      padding: 8,
    },
    deleteAccountButtonText: {
      color: theme.danger,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.semibold,
    },
  });
}

export default ProfileScreen;
