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
import { getTheme, Theme } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from '../../../theme/typography';
import { useForgotPassword } from '../hooks/useAuth';
import type { AuthStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

function ForgotPasswordScreen({ navigation }: Readonly<Props>) {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const forgotPassword = useForgotPassword();

  const [email, setEmail] = useState('');

  const handleSend = async () => {
    try {
      await forgotPassword.mutateAsync(email);
      navigation.navigate('ResetPassword', { email });
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
        <Text style={styles.title}>Forgot password?</Text>
        <Text style={styles.subtitle}>
          Enter your email and we'll send you a code to reset it.
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

        <Pressable
          style={[
            styles.button,
            forgotPassword.isPending && styles.buttonDisabled,
          ]}
          disabled={forgotPassword.isPending || !email}
          onPress={handleSend}
        >
          <Text style={styles.buttonText}>
            {forgotPassword.isPending ? 'Sending…' : 'Send Reset Code'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.linkButton}
          onPress={() => navigation.navigate('ResetPassword', { email })}
        >
          <Text style={styles.linkText}>Already have a code?</Text>
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
      fontFamily: FONT_FAMILY.extrabold,
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
      backgroundColor: theme.accent,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: theme.accentText,
      fontWeight: FONT_WEIGHT.bold,
      fontFamily: FONT_FAMILY.bold,
      fontSize: FONT_SIZE.base,
    },
    linkButton: {
      alignItems: 'center',
      marginTop: 16,
    },
    linkText: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.body,
    },
  });
}

export default ForgotPasswordScreen;
