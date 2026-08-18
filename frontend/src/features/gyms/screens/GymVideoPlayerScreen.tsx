import React, { useMemo } from 'react';
import { Linking, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { ChevronLeft, ExternalLink } from 'lucide-react-native';
import { getTheme, Theme, UI_ACCENT } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/typography';
import type { HomeStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'GymVideoPlayer'>;
type Route = RouteProp<HomeStackParamList, 'GymVideoPlayer'>;

// Same "frame the real page, never host the video" approach as
// InstructionalPlayerScreen -- the header shows the technique tags instead
// of a per-video title, since gym class videos don't have one.
function GymVideoPlayerScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { url, techniques } = route.params;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => navigation.goBack()}>
          <ChevronLeft color={theme.textPrimary} size={24} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {techniques.length > 0 ? techniques.join(', ') : 'Video'}
        </Text>
        <Pressable
          hitSlop={12}
          onPress={() => {
            if (url) Linking.openURL(url);
          }}>
          <ExternalLink color={UI_ACCENT} size={22} />
        </Pressable>
      </View>

      {url ? (
        <WebView source={{ uri: url }} style={styles.webview} />
      ) : (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>This video doesn't have a link yet.</Text>
        </View>
      )}
    </View>
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
      gap: 12,
    },
    headerTitle: {
      flex: 1,
      color: theme.textPrimary,
      fontSize: FONT_SIZE.lg,
      fontWeight: FONT_WEIGHT.bold,
      textAlign: 'center',
    },
    webview: {
      flex: 1,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.body,
      textAlign: 'center',
    },
  });
}

export default GymVideoPlayerScreen;
