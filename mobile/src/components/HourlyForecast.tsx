import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import type { DailyWeather, HourlyWeather } from '@/types/weather';
import {
  getHourlyForecastOverview,
  getHourlyForecastSummary,
  getSolarMarkers,
} from '@/utils/hourlyForecast';
import { WEATHER_CONDITION_ICONS } from '@/utils/weatherPresentation';
import { layout, radius, spacing, typography } from '@/styles/tokens';
import type { WeatherTheme } from '@/styles/themes';

type Props = {
  hourly: HourlyWeather[];
  daily: DailyWeather;
  timezone: string;
  now: Date;
  theme: WeatherTheme;
};

const SNAP_INTERVAL = layout.hourlyItemWidth + layout.hourlyItemGap;

function getHourLabel(time: string): string {
  return `${time.slice(11, 13)}h`;
}

export function HourlyForecast({ hourly, daily, timezone, now, theme }: Props) {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const items = useMemo(() => getHourlyForecastOverview(hourly), [hourly]);
  const summary = useMemo(
    () => getHourlyForecastSummary(hourly, { timezone, now }),
    [hourly, now, timezone],
  );
  const solarMarkers = useMemo(
    () => getSolarMarkers(items, { sunrise: daily.sunrise, sunset: daily.sunset }),
    [daily.sunrise, daily.sunset, items],
  );
  const selectedItem = items.find((item) => item.time === selectedTime);

  return (
    <View>
      <Text accessibilityRole="summary" style={[styles.summary, { color: theme.muted }]}>
        {summary}
      </Text>
      <FlatList
        accessibilityLabel="Previsão do tempo por hora"
        contentContainerStyle={styles.listContent}
        data={items}
        decelerationRate="fast"
        horizontal
        keyExtractor={(item) => item.time}
        renderItem={({ item, index }) => {
          const markers = solarMarkers.filter((marker) => marker.index === index);
          const isSelected = item.time === selectedTime;

          return (
            <View style={styles.item}>
              <View accessible={false} style={styles.markerTrack}>
                {markers.map((marker) => (
                  <Text
                    key={`${marker.type}-${marker.time}`}
                    accessibilityElementsHidden
                    numberOfLines={1}
                    style={[
                      styles.marker,
                      {
                        color: theme.accent,
                        left: marker.offset * SNAP_INTERVAL - 28,
                      },
                    ]}
                  >
                    {marker.type === 'sunrise' ? '☀ ↑' : '☀ ↓'} {getHourLabel(marker.time)}
                  </Text>
                ))}
              </View>
              <Pressable
                accessibilityLabel={`${item.label}, ${WEATHER_CONDITION_ICONS[item.condition]}, ${Math.round(item.temp)} graus${item.rainChance >= 20 ? `, chance de chuva ${Math.round(item.rainChance)} por cento` : ''}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => setSelectedTime(item.time)}
                style={[
                  styles.hourButton,
                  {
                    backgroundColor: isSelected ? `${theme.accent}24` : 'transparent',
                  },
                ]}
              >
                <Text style={[styles.hourLabel, { color: theme.muted }]}>{item.label}</Text>
                <Text accessible={false} style={styles.icon}>
                  {WEATHER_CONDITION_ICONS[item.condition]}
                </Text>
                <Text style={[styles.temperature, { color: theme.text }]}>
                  {Math.round(item.temp)}°
                </Text>
                {item.rainChance >= 20 ? (
                  <Text style={[styles.rainChance, { color: theme.accent }]}>
                    {Math.round(item.rainChance)}%
                  </Text>
                ) : (
                  <View style={styles.rainChancePlaceholder} />
                )}
              </Pressable>
            </View>
          );
        }}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={SNAP_INTERVAL}
        style={styles.list}
      />
      {selectedItem ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.details, { color: theme.muted, borderTopColor: theme.border }]}
        >
          {`${getHourLabel(selectedItem.time)} · Sensação ${Math.round(selectedItem.feelsLike)}° · Umidade ${Math.round(selectedItem.humidity)}% · Vento ${Math.round(selectedItem.wind)} km/h`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    fontSize: typography.caption,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  list: {
    overflow: 'visible',
  },
  listContent: {
    paddingHorizontal: spacing.xs,
    paddingTop: 22,
    paddingBottom: spacing.sm,
  },
  item: {
    width: layout.hourlyItemWidth,
    marginRight: layout.hourlyItemGap,
    position: 'relative',
  },
  markerTrack: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 18,
    zIndex: 1,
    overflow: 'visible',
  },
  marker: {
    position: 'absolute',
    width: 88,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  hourButton: {
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.control,
    paddingVertical: spacing.xs,
  },
  hourLabel: {
    fontSize: typography.eyebrow,
    fontWeight: '600',
  },
  icon: {
    fontSize: 23,
    lineHeight: 30,
  },
  temperature: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  rainChance: {
    fontSize: typography.eyebrow,
    lineHeight: 16,
    fontWeight: '700',
  },
  rainChancePlaceholder: {
    height: 16,
  },
  details: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.md,
    marginTop: spacing.xs,
    fontSize: typography.caption,
  },
});
