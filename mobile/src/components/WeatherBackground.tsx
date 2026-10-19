import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import type { WeatherTheme } from '@/styles/themes';

type Props = PropsWithChildren<{
  theme: WeatherTheme;
}>;

export function WeatherBackground({ children, theme }: Props) {
  return (
    <View style={[styles.container, { backgroundColor: theme.gradientColors[0] }]}>
      <LinearGradient
        accessibilityElementsHidden
        colors={theme.gradientColors}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
