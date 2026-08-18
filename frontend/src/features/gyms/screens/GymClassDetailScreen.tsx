import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { getTheme, Theme, UI_ACCENT } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import { formatDisplayDate } from '../../../lib/dateFormat';
import FloatingAddButton from '../../../components/FloatingAddButton';
import { useDeleteGymClassVideo, useGym, useGymClassVideos, useGymClasses } from '../hooks/useGyms';
import GymClassVideoRow from '../components/GymClassVideoRow';
import type { HomeStackParamList } from '../../../navigation/types';
import type { GymClassVideo } from '../types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'GymClassDetail'>;
type Route = RouteProp<HomeStackParamList, 'GymClassDetail'>;

function GymClassDetailScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { gymId, classId } = route.params;

  const { data: gym } = useGym(gymId);
  const { data: classes = [] } = useGymClasses(gymId);
  const { data: videos = [], isLoading } = useGymClassVideos(gymId, classId);
  const deleteVideo = useDeleteGymClassVideo(gymId, classId);

  const entry = classes.find(c => c.id === classId);
  const canManage = gym?.my_role === 'owner' || gym?.my_role === 'trainer';

  const renderItem = ({ item }: { item: GymClassVideo }) => (
    <GymClassVideoRow
      video={item}
      canManage={canManage}
      onWatch={() =>
        navigation.navigate('GymVideoPlayer', {
          url: item.url ?? '',
          techniques: item.techniques,
        })
      }
      onDelete={() => deleteVideo.mutate(item.id)}
    />
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => navigation.goBack()}>
          <ChevronLeft color={theme.textPrimary} size={24} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {entry?.title ?? 'Class'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading && videos.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={UI_ACCENT} />
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            entry ? (
              <View style={styles.infoSection}>
                <Text style={styles.classDate}>{formatDisplayDate(entry.class_date)}</Text>
                {entry.description ? (
                  <Text style={styles.description}>{entry.description}</Text>
                ) : null}
              </View>
            ) : null
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {canManage
                ? 'No videos yet — tap + to add one.'
                : "This class doesn't have any videos yet."}
            </Text>
          }
        />
      )}

      {canManage ? (
        <FloatingAddButton
          onPress={() => navigation.navigate('GymClassVideoForm', { gymId, classId })}
        />
      ) : null}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 16,
      gap: 12,
    },
    headerTitle: {
      flex: 1,
      color: theme.textPrimary,
      fontSize: FONT_SIZE.lg,
      fontWeight: FONT_WEIGHT.bold,
      textAlign: 'center',
    },
    headerSpacer: {
      width: 24,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 100,
      gap: 10,
    },
    infoSection: {
      gap: 6,
      marginBottom: 16,
    },
    classDate: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.label,
      fontWeight: FONT_WEIGHT.semibold,
    },
    description: {
      color: theme.textPrimary,
      fontSize: FONT_SIZE.body,
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.body,
      textAlign: 'center',
      paddingTop: 12,
    },
  });
}

export default GymClassDetailScreen;
