import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import {
  getTheme,
  Theme,
  UI_ACCENT,
  UI_ACCENT_TEXT,
} from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import { useResetPassword } from '../hooks/useAuth';
import type { AuthStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

function ResetPasswordScreen({ navigation, route }: Readonly<Props>) {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const resetPassword = useResetPassword();

  const [email, setEmail] = useState(route.params.email);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const canSubmit = email && code && newPassword.length >= 8;

  const handleReset = async () => {
    try {
      await resetPassword.mutateAsync({ email, code, newPassword });
      navigation.navigate('SignIn');
    } catch {
      // toast already shown by the mutation itself
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => navigation.goBack()}>
          <ChevronLeft color={theme.textPrimary} size={24} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Enter your code</Text>
        <Text style={styles.subtitle}>
          Check your email for a 6-digit code, then set a new password below.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="6-digit code"
          placeholderTextColor={theme.textSecondary}
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={setCode}
        />
        <TextInput
          style={styles.input}
          placeholder="New password (min. 8 characters)"
          placeholderTextColor={theme.textSecondary}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <Pressable
          style={[
            styles.button,
            (!canSubmit || resetPassword.isPending) && styles.buttonDisabled,
          ]}
          disabled={!canSubmit || resetPassword.isPending}
          onPress={handleReset}
        >
          <Text style={styles.buttonText}>
            {resetPassword.isPending ? 'Resetting…' : 'Reset Password'}
          </Text>
        </Pressable>
      </View>
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
      paddingHorizontal: 20,
      paddingTop: 60,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      padding: 24,
      gap: 12,
    },
    title: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.display,
      fontWeight: FONT_WEIGHT.extrabold,
    },
    subtitle: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.base,
      marginBottom: 12,
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
    button: {
      backgroundColor: UI_ACCENT,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: UI_ACCENT_TEXT,
      fontWeight: FONT_WEIGHT.bold,
      fontSize: FONT_SIZE.base,
    },
  });
}

export default ResetPasswordScreen;
