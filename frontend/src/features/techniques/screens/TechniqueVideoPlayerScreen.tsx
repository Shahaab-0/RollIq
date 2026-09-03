import React, { useMemo } from 'react';
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { ChevronLeft, ExternalLink } from 'lucide-react-native';
import { getTheme, Theme } from '../../../theme/colors';
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from '../../../theme/typography';
import type { TechniquesStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<
  TechniquesStackParamList,
  'TechniqueVideoPlayer'
>;
type Route = RouteProp<TechniquesStackParamList, 'TechniqueVideoPlayer'>;

// Same "frame the real page, never host the video" approach as
// InstructionalPlayerScreen/GymVideoPlayerScreen -- RollIQ doesn't store or
// stream the resource link itself, just frames wherever it actually lives.
function TechniqueVideoPlayerScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { name, url } = route.params;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => navigation.goBack()}>
          <ChevronLeft color={theme.textPrimary} size={24} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {name}
        </Text>
        <Pressable hitSlop={12} onPress={() => Linking.openURL(url)}>
          <ExternalLink color={theme.accent} size={22} />
        </Pressable>
      </View>

      <WebView source={{ uri: url }} style={styles.webview} />
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
      fontFamily: FONT_FAMILY.bold,
      textAlign: 'center',
    },
    webview: {
      flex: 1,
    },
  });
}

export default TechniqueVideoPlayerScreen;
