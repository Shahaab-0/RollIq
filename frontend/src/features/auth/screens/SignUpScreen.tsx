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
import {
  getTheme,
  Theme,
  UI_ACCENT,
  UI_ACCENT_TEXT,
} from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import { useSignUp } from '../hooks/useAuth';
import type { AuthStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

function SignUpScreen({ navigation }: Readonly<Props>) {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const signUp = useSignUp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Start your journey</Text>
        <Text style={styles.subtitle}>
          Create an account to track your training
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
          placeholder="Password (min. 6 characters)"
          placeholderTextColor={theme.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable
          style={[styles.button, signUp.isPending && styles.buttonDisabled]}
          disabled={signUp.isPending}
          onPress={() => signUp.mutate({ email, password })}
        >
          <Text style={styles.buttonText}>
            {signUp.isPending ? 'Creating account…' : 'Sign Up'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.linkButton}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.linkText}>
            Already have an account?{' '}
            <Text style={styles.linkTextAccent}>Sign in</Text>
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
    linkButton: {
      alignItems: 'center',
      marginTop: 16,
    },
    linkText: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.body,
    },
    linkTextAccent: {
      color: UI_ACCENT,
      fontWeight: FONT_WEIGHT.bold,
    },
  });
}

export default SignUpScreen;
