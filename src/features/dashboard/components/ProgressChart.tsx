import React, { useMemo } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { getTheme, Theme } from '../../../theme/colors';

interface Point {
  label: string;
  value: number;
}

interface Props {
  title: string;
  points: Point[];
  color: string;
  maxValue?: number;
}

const CHART_HEIGHT = 80;

// Basic bar chart, built from plain Views (no charting library needed) —
// enough for "rounds per session" / "productivity" style trend glances.
function ProgressChart({ title, points, color, maxValue }: Readonly<Props>) {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (points.length === 0) {
    return null;
  }

  const max = maxValue ?? Math.max(...points.map(p => p.value), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartRow}>
        {points.map((point, i) => (
          <View key={`${point.label}-${i}`} style={styles.barColumn}>
            <Text style={styles.valueLabel}>{point.value}</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max((point.value / max) * CHART_HEIGHT, 3),
                    backgroundColor: color,
                  },
                ]}
              />
            </View>
            <Text style={styles.xLabel}>{point.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      gap: 10,
    },
    title: {
      color: theme.textPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    chartRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },
    barColumn: {
      alignItems: 'center',
      flex: 1,
      gap: 4,
    },
    valueLabel: {
      color: theme.textSecondary,
      fontSize: 11,
    },
    barTrack: {
      height: CHART_HEIGHT,
      justifyContent: 'flex-end',
      width: 16,
    },
    bar: {
      width: '100%',
      borderRadius: 4,
    },
    xLabel: {
      color: theme.textSecondary,
      fontSize: 10,
    },
  });
}

export default ProgressChart;
