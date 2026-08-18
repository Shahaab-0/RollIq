import React, { useMemo, useState } from 'react';
import {
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import { getTheme, Theme, UI_ACCENT, UI_ACCENT_TEXT } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import { useJoinGym } from '../hooks/useGyms';
import type { HomeStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'GymJoin'>;

function GymJoinScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const joinGym = useJoinGym();

  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Code required', 'Enter the invite code your gym shared with you.');
      return;
    }
    setJoining(true);
    try {
      const gym = await joinGym.mutateAsync(inviteCode.trim());
      setJoining(false);
      navigation.replace('GymDetail', { gymId: gym.id });
    } catch {
      // toast already shown by the mutation itself
      setJoining(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => navigation.goBack()}>
          <ChevronLeft color={theme.textPrimary} size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>Join a Gym</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Invite code</Text>
        <TextInput
          style={styles.input}
          value={inviteCode}
          onChangeText={setInviteCode}
          placeholder="e.g. 7K3PQXM9"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="characters"
          autoCorrect={false}
        />

        <Pressable
          style={[styles.saveButton, joining && styles.saveButtonDisabled]}
          disabled={joining}
          onPress={handleJoin}>
          <Text style={styles.saveButtonText}>{joining ? 'Joining…' : 'Join Gym'}</Text>
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 16,
    },
    headerTitle: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.lg,
      fontWeight: FONT_WEIGHT.bold,
    },
    headerSpacer: {
      width: 24,
    },
    content: {
      padding: 20,
      gap: 8,
      paddingBottom: 40,
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
    saveButton: {
      backgroundColor: UI_ACCENT,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: UI_ACCENT_TEXT,
      fontWeight: FONT_WEIGHT.bold,
      fontSize: FONT_SIZE.base,
    },
  });
}

export default GymJoinScreen;
