import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WeatherBackground } from '@/components/WeatherBackground';
import { WeatherCard } from '@/components/WeatherCard';
import type { WeatherCondition } from '@/types/weather';
import { getWeatherTheme } from '@/styles/themes';
import { layout, spacing, typography } from '@/styles/tokens';

const INITIAL_CONDITION: WeatherCondition = 'clear';
const initialTheme = getWeatherTheme(INITIAL_CONDITION);

export default function HomeScreen() {
  return (
    <WeatherBackground theme={initialTheme}>
      <StatusBar style={initialTheme.isDark ? 'light' : 'dark'} />
      <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text accessibilityRole="header" style={[styles.title, { color: initialTheme.text }]}>
              Clima Agora
            </Text>
            <WeatherCard
              condition={INITIAL_CONDITION}
              loading
              now={new Date()}
              theme={initialTheme}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </WeatherBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  content: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
  },
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
});
