import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CitySearch } from '@/components/CitySearch';
import { Forecast } from '@/components/Forecast';
import { WeatherBackground } from '@/components/WeatherBackground';
import { WeatherCard } from '@/components/WeatherCard';
import { useWeather } from '@/hooks/useWeather';
import { Playground } from '@/playground/Playground';
import { createMockWeatherForecast } from '@/playground/mockWeather';
import type { WeatherCondition } from '@/types/weather';
import { getWeatherTheme } from '@/styles/themes';
import { layout, spacing, typography } from '@/styles/tokens';

export default function HomeScreen() {
  const weather = useWeather();
  const [now, setNow] = useState(() => new Date());
  const [playgroundCondition, setPlaygroundCondition] = useState<WeatherCondition | null>(null);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const mockForecast = useMemo(
    () =>
      __DEV__ && playgroundCondition ? createMockWeatherForecast(playgroundCondition, now) : null,
    [now, playgroundCondition],
  );
  const isPlaygroundActive = __DEV__ && playgroundCondition !== null;
  const forecast = mockForecast ?? weather.forecast;
  const condition = isPlaygroundActive ? playgroundCondition : weather.condition;
  const theme = getWeatherTheme(condition);
  const city = mockForecast ? 'Ambiente de demonstração' : weather.city;

  return (
    <WeatherBackground
      animationsEnabled={!isPlaygroundActive || animationsEnabled}
      condition={condition}
      theme={theme}
    >
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
              Clima Agora
            </Text>
            <CitySearch
              disabled={weather.loading}
              key={weather.city}
              onSearch={weather.searchCity}
              onUseCurrentLocation={weather.useCurrentLocation}
              theme={theme}
              value={weather.city}
            />
            <WeatherCard
              city={city}
              condition={condition}
              error={isPlaygroundActive ? null : weather.error}
              forecast={forecast}
              loading={!isPlaygroundActive && weather.loading}
              now={now}
              onRetry={weather.refresh}
              stale={!isPlaygroundActive && weather.stale}
              theme={theme}
            />
            {forecast ? <Forecast daily={forecast.daily} theme={theme} /> : null}
            {__DEV__ ? (
              <Playground
                animationsEnabled={animationsEnabled}
                condition={playgroundCondition}
                onAnimationToggle={() => setAnimationsEnabled((enabled) => !enabled)}
                onConditionChange={setPlaygroundCondition}
                theme={theme}
              />
            ) : null}
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
