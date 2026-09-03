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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { getTheme, Theme } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from '../../../theme/typography';
import {
  useCreateVideo,
  useInstructionalVideos,
} from '../hooks/useInstructionals';
import type { InstructionalsStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<
  InstructionalsStackParamList,
  'InstructionalVideoForm'
>;
type Route = RouteProp<InstructionalsStackParamList, 'InstructionalVideoForm'>;

function InstructionalVideoFormScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { instructionalId } = route.params;
  const { data: existingVideos = [] } = useInstructionalVideos(instructionalId);
  const createVideo = useCreateVideo(instructionalId);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Give this video a title.');
      return;
    }
    setSaving(true);
    try {
      await createVideo.mutateAsync({
        title: title.trim(),
        sequence_number: existingVideos.length + 1,
        url: url || null,
        duration_minutes: durationMinutes
          ? parseInt(durationMinutes, 10)
          : null,
      });
      setSaving(false);
      navigation.goBack();
    } catch {
      // toast already shown by the mutation itself
      setSaving(false);
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
        <Text style={styles.headerTitle}>Add Video</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder={`e.g. Volume ${existingVideos.length + 1}`}
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={styles.label}>Link</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="Optional"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Duration (minutes)</Text>
        <TextInput
          style={styles.input}
          value={durationMinutes}
          onChangeText={setDurationMinutes}
          keyboardType="number-pad"
          placeholder="Optional"
          placeholderTextColor={theme.textSecondary}
        />

        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving…' : 'Add Video'}
          </Text>
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
      fontFamily: FONT_FAMILY.bold,
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
    saveButton: {
      backgroundColor: theme.accent,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: theme.accentText,
      fontWeight: FONT_WEIGHT.bold,
      fontFamily: FONT_FAMILY.bold,
      fontSize: FONT_SIZE.base,
    },
  });
}

export default InstructionalVideoFormScreen;
