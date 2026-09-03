import React, { useMemo, useState } from 'react';
import {
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
import TagInput from '../../../components/TagInput';
import { useCreateGymClassVideo, useGymClassVideos } from '../hooks/useGyms';
import type { HomeStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'GymClassVideoForm'>;
type Route = RouteProp<HomeStackParamList, 'GymClassVideoForm'>;

function GymClassVideoFormScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { gymId, classId } = route.params;
  const { data: existingVideos = [] } = useGymClassVideos(gymId, classId);
  const createVideo = useCreateGymClassVideo(gymId, classId);

  const [url, setUrl] = useState('');
  const [techniques, setTechniques] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await createVideo.mutateAsync({
        url: url || null,
        techniques,
        sequence_number: existingVideos.length + 1,
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
        <Text style={styles.label}>Link</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="Optional"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Techniques shown in this video</Text>
        <TagInput
          values={techniques}
          onChange={setTechniques}
          placeholder="e.g. Ashi Garami, then hit return"
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

export default GymClassVideoFormScreen;
