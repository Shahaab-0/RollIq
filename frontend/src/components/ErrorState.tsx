import React, { useMemo } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { CircleAlert } from 'lucide-react-native';
import { getTheme, Theme } from '../theme/colors';
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from '../theme/typography';

interface Props {
  message?: string;
}

// Shown in place of a list's empty-state text when the query actually
// failed, so a failed fetch doesn't look identical to "no data yet" --
// without this, a user with real logged data would see the same "Nothing
// here yet" copy as someone who's never used the app, for what's actually
// a network/server error.
function ErrorState({
  message = "Couldn't load this. Check your connection and try again.",
}: Readonly<Props>) {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <CircleAlert color={theme.danger} size={28} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingHorizontal: 32,
    },
    text: {
      color: theme.textSecondary,
      fontSize: FONT_SIZE.body,
      fontWeight: FONT_WEIGHT.semibold,
      fontFamily: FONT_FAMILY.semibold,
      textAlign: 'center',
    },
  });
}

export default ErrorState;
