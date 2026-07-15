import React, { useMemo } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { getTheme } from '../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../theme/typography';

// Temporary stand-in for a feature screen that hasn't been built out yet.
function PlaceholderScreen({ title }: Readonly<{ title: string }>) {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Coming soon
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
  },
  subtitle: {
    fontSize: FONT_SIZE.body,
  },
});

export default PlaceholderScreen;
