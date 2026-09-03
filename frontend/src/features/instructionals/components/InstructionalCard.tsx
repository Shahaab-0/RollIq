import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  LayoutAnimation,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { getTheme, Theme } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from '../../../theme/typography';
import {
  useInstructionalProgress,
  useInstructionalVideos,
  useRemoveProgress,
  useSetProgress,
} from '../hooks/useInstructionals';
import InstructionalVideoRow from './InstructionalVideoRow';
import type { InstructionalsStackParamList } from '../../../navigation/types';
import type { Difficulty, Instructional, ProgressStatus } from '../types';

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

type Nav = NativeStackNavigationProp<InstructionalsStackParamList>;

interface Props {
  instructional: Instructional;
}

// Self-contained: owns its own expand state, its own video fetch (only once
// expanded), and its own progress reads/writes -- the library screen just
// renders one of these per row.
function InstructionalCard({ instructional }: Readonly<Props>) {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();

  const [expanded, setExpanded] = useState(false);
  const { data: videos = [], isLoading } = useInstructionalVideos(
    expanded ? instructional.id : undefined,
  );
  const { data: progress = [] } = useInstructionalProgress();
  const setProgress = useSetProgress();
  const removeProgress = useRemoveProgress();

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(v => !v);
  };

  const badgeLabel =
    instructional.video_count === 0
      ? 'No videos yet'
      : `${instructional.completed_video_count}/${instructional.video_count} completed`;

  return (
    <View style={styles.card}>
      <Pressable style={styles.header} onPress={toggle}>
        <View style={styles.headerMain}>
          <Text style={styles.title}>{instructional.title}</Text>
          <Text style={styles.meta}>
            {instructional.instructor} · {instructional.category}
          </Text>
          <Text style={styles.difficultyBadge}>
            {DIFFICULTY_LABEL[instructional.difficulty]}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.badge}>{badgeLabel}</Text>
          {expanded ? (
            <ChevronUp color={theme.textSecondary} size={18} />
          ) : (
            <ChevronDown color={theme.textSecondary} size={18} />
          )}
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          {isLoading ? (
            <ActivityIndicator color={theme.accent} style={styles.loading} />
          ) : videos.length === 0 ? (
            <Text style={styles.emptyVideos}>No videos yet.</Text>
          ) : (
            videos.map(video => {
              const videoStatus: ProgressStatus | null =
                progress.find(p => p.video_id === video.id)?.status ?? null;
              return (
                <InstructionalVideoRow
                  key={video.id}
                  video={video}
                  status={videoStatus}
                  onChangeStatus={status =>
                    setProgress.mutate({ videoId: video.id, status })
                  }
                  onClearStatus={() => removeProgress.mutate(video.id)}
                  onWatch={() =>
                    navigation.navigate('InstructionalPlayer', {
                      title: video.title,
                      url: video.url ?? '',
                    })
                  }
                />
              );
            })
          )}
          <Pressable
            style={styles.addVideoButton}
            onPress={() =>
              navigation.navigate('InstructionalVideoForm', {
                instructionalId: instructional.id,
              })
            }
          >
            <Text style={styles.addVideoText}>+ Add Video</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      paddingHorizontal: 16,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      gap: 12,
    },
    headerMain: {
      flex: 1,
      gap: 4,
    },
    title: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.base,
      fontWeight: FONT_WEIGHT.semibold,
      fontFamily: FONT_FAMILY.semibold,
    },
    meta: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
    },
    difficultyBadge: {
      alignSelf: 'flex-start',
      color: theme.textSecondary,
      fontSize: FONT_SIZE.tiny,
      fontWeight: FONT_WEIGHT.semibold,
      fontFamily: FONT_FAMILY.semibold,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      overflow: 'hidden',
    },
    headerRight: {
      alignItems: 'flex-end',
      gap: 6,
    },
    badge: {
      color: theme.accent,
      fontSize: FONT_SIZE.tiny,
      fontWeight: FONT_WEIGHT.semibold,
      fontFamily: FONT_FAMILY.semibold,
      backgroundColor: theme.accentMuted,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      overflow: 'hidden',
    },
    body: {
      paddingBottom: 16,
    },
    loading: {
      paddingVertical: 12,
    },
    emptyVideos: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
      paddingTop: 12,
    },
    addVideoButton: {
      marginTop: 12,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.accent,
      alignItems: 'center',
    },
    addVideoText: {
      color: theme.accent,
      fontWeight: FONT_WEIGHT.semibold,
      fontFamily: FONT_FAMILY.semibold,
      fontSize: FONT_SIZE.label,
    },
  });
}

export default InstructionalCard;
