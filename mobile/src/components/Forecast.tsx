import { StyleSheet, Text, View } from 'react-native';

import type { DailyWeather, WeatherCondition } from '@/types/weather';
import { getWeatherCondition } from '@/utils/weatherCondition';
import { WEATHER_CONDITION_ICONS, WEATHER_CONDITION_LABELS } from '@/utils/weatherPresentation';
import { radius, spacing, typography } from '@/styles/tokens';
import type { WeatherTheme } from '@/styles/themes';

type Props = {
  daily: DailyWeather;
  theme: WeatherTheme;
};

function getDayLabel(date: string, index: number): string {
  if (index === 0) {
    return 'Hoje';
  }

  const [year, month, day] = date.split('-').map(Number);
  const localCalendarDate = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'UTC' })
    .format(localCalendarDate)
    .replace('.', '');
}

export function Forecast({ daily, theme }: Props) {
  return (
    <View
      accessibilityLabel="Previsão para os próximos cinco dias"
      style={[styles.container, { backgroundColor: theme.card }]}
    >
      <Text accessibilityRole="header" style={[styles.heading, { color: theme.text }]}>
        Próximos 5 dias
      </Text>
      {daily.time.slice(0, 5).map((date, index) => {
        const maximum = daily.temperature_2m_max[index] ?? 0;
        const minimum = daily.temperature_2m_min[index] ?? 0;
        const condition = getWeatherCondition({
          weatherCode: daily.weather_code[index] ?? 0,
          temperature: maximum,
          isDay: 1,
        });
        const rainChance = daily.precipitation_probability_max[index] ?? 0;

        return (
          <DayForecast
            condition={condition}
            date={date}
            index={index}
            key={date}
            maximum={maximum}
            minimum={minimum}
            rainChance={rainChance}
            theme={theme}
          />
        );
      })}
    </View>
  );
}

function DayForecast({
  condition,
  date,
  index,
  maximum,
  minimum,
  rainChance,
  theme,
}: {
  condition: WeatherCondition;
  date: string;
  index: number;
  maximum: number;
  minimum: number;
  rainChance: number;
  theme: WeatherTheme;
}) {
  const label = getDayLabel(date, index);
  const description = `${label}, ${WEATHER_CONDITION_LABELS[condition]}, máxima ${Math.round(maximum)} graus, mínima ${Math.round(minimum)} graus, chance de chuva ${Math.round(rainChance)} por cento`;

  return (
    <View
      accessible
      accessibilityLabel={description}
      style={[styles.day, { borderBottomColor: theme.border }]}
    >
      <Text style={[styles.dayLabel, { color: theme.text }]}>{label}</Text>
      <Text accessibilityLabel={WEATHER_CONDITION_LABELS[condition]} style={styles.icon}>
        {WEATHER_CONDITION_ICONS[condition]}
      </Text>
      <Text style={[styles.condition, { color: theme.muted }]}>
        {WEATHER_CONDITION_LABELS[condition]}
      </Text>
      <View style={styles.temperatures}>
        <Text style={[styles.maximum, { color: theme.text }]}>{Math.round(maximum)}°</Text>
        <Text style={[styles.minimum, { color: theme.muted }]}>{Math.round(minimum)}°</Text>
      </View>
      {rainChance >= 20 ? (
        <Text style={[styles.rain, { color: theme.accent }]}>{Math.round(rainChance)}%</Text>
      ) : (
        <View style={styles.rainPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: radius.card,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    marginTop: spacing.xl,
  },
  heading: {
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  day: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dayLabel: {
    width: 52,
    fontSize: typography.body,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  icon: {
    width: 38,
    fontSize: 22,
  },
  condition: {
    flex: 1,
    fontSize: typography.caption,
  },
  temperatures: {
    width: 86,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  maximum: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  minimum: {
    fontSize: typography.body,
  },
  rain: {
    width: 42,
    textAlign: 'right',
    fontSize: typography.eyebrow,
    fontWeight: '700',
  },
  rainPlaceholder: {
    width: 42,
  },
});
