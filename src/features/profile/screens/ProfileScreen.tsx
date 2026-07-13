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
import { BELT_COLORS, getTheme, Theme, UI_ACCENT, UI_ACCENT_TEXT } from '../../../theme/colors';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { signOut } from '../../auth/authSlice';
import { fetchProfile, updateProfile } from '../profileSlice';
import type { Belt } from '../types';

const BELT_OPTIONS: { value: Belt; label: string }[] = [
  { value: 'white', label: 'White' },
  { value: 'blue', label: 'Blue' },
  { value: 'purple', label: 'Purple' },
  { value: 'brown', label: 'Brown' },
  { value: 'black', label: 'Black' },
];

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
    }
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
      fontSize: 24,
      fontWeight: '800',
    },
    email: {
      color: theme.textSecondary,
      fontSize: 14,
      marginBottom: 12,
    },
    label: {
      color: theme.textSecondary,
      fontSize: 13,
      fontWeight: '600',
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
      fontSize: 15,
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
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    chipText: {
      color: theme.textSecondary,
      fontSize: 13,
      fontWeight: '600',
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
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
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
      fontWeight: '700',
      fontSize: 15,
    },
    signOutButton: {
      borderWidth: 1.5,
      borderColor: theme.danger,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 12,
    },
    signOutButtonText: {
      color: theme.danger,
      fontWeight: '700',
      fontSize: 15,
    },
  });
}

export default ProfileScreen;
