import type { HourlyWeather, OpenMeteoResponse } from '@/types/weather';
import { getWeatherCondition } from '@/utils/weatherCondition';

const DEFAULT_HOURLY_LIMIT = 24;
const RAIN_CHANCE_THRESHOLD = 20;
const COOLING_THRESHOLD = 3;

export type HourlyForecastItem = HourlyWeather & {
  label: string;
};

export type SolarMarker = {
  type: 'sunrise' | 'sunset';
  time: string;
  index: number;
  offset: number;
};

function getLocalDateTimeKey(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((values, part) => {
      if (part.type !== 'literal') {
        values[part.type] = part.value;
      }
      return values;
    }, {});

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function findForecastStartIndex(times: string[], timezone: string, now: Date): number {
  const localNow = getLocalDateTimeKey(now, timezone);
  return times.findIndex((time) => time >= localNow);
}

export function mapHourlyForecast(
  hourly: OpenMeteoResponse['hourly'],
  timezone: string,
  now: Date,
): HourlyWeather[] {
  const startIndex = findForecastStartIndex(hourly.time, timezone, now);

  if (startIndex < 0) {
    return [];
  }

  return hourly.time.slice(startIndex).map((time, offset) => {
    const index = startIndex + offset;
    const isDay = hourly.is_day[index];
    const temp = hourly.temperature_2m[index];

    if (isDay !== 0 && isDay !== 1) {
      throw new Error(`A resposta da previsão tem um valor inválido em hourly.is_day[${index}].`);
    }

    const values = [
      temp,
      hourly.apparent_temperature[index],
      hourly.relative_humidity_2m[index],
      hourly.wind_speed_10m[index],
      hourly.precipitation_probability[index],
      hourly.weather_code[index],
    ];
    if (values.some((value) => !Number.isFinite(value))) {
      throw new Error(`A resposta da previsão contém um valor inválido no horário ${time}.`);
    }

    return {
      time,
      temp,
      feelsLike: hourly.apparent_temperature[index],
      humidity: hourly.relative_humidity_2m[index],
      wind: hourly.wind_speed_10m[index],
      rainChance: hourly.precipitation_probability[index],
      condition: getWeatherCondition({
        weatherCode: hourly.weather_code[index],
        temperature: temp,
        isDay,
      }),
      isDay,
    };
  });
}

function getWallClockMinutes(value: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);

  if (!match) {
    throw new Error(`Horário local inválido: ${value}`);
  }

  const [, year, month, day, hour, minute] = match;
  return (
    Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)) / 60000
  );
}

function formatHour(time: string): string {
  return `${time.slice(11, 13)}h`;
}

export function getHourlyForecastOverview(
  items: HourlyWeather[],
  { limit = DEFAULT_HOURLY_LIMIT }: { limit?: number } = {},
): HourlyForecastItem[] {
  return items.slice(0, limit).map((item, index) => ({
    ...item,
    label: index === 0 ? 'Agora' : formatHour(item.time),
  }));
}

export function getHourlyForecastSummary(
  items: HourlyWeather[],
  { timezone, now }: { timezone: string; now: Date },
): string {
  const start = getLocalDateTimeKey(now, timezone);
  const end = getLocalDateTimeKey(new Date(now.getTime() + 24 * 60 * 60 * 1000), timezone);
  const nextDay = items.filter((item) => item.time >= start && item.time <= end);
  const rain = nextDay.find((item) => item.rainChance >= RAIN_CHANCE_THRESHOLD);

  if (rain) {
    return `Chuva a partir das ${formatHour(rain.time)}`;
  }

  if (nextDay.length > 1) {
    const warmest = nextDay.reduce((highest, item) => (item.temp > highest.temp ? item : highest));
    const coldest = nextDay.reduce((lowest, item) => (item.temp < lowest.temp ? item : lowest));

    if (warmest.temp - coldest.temp >= COOLING_THRESHOLD) {
      return `Esfriando: ${Math.round(coldest.temp)}° às ${formatHour(coldest.time)}`;
    }
  }

  return 'Sem chuva nas próximas 24h';
}

export function getSolarMarkers(
  items: HourlyWeather[],
  { sunrise, sunset }: { sunrise: string[]; sunset: string[] },
): SolarMarker[] {
  if (!items.length) {
    return [];
  }

  const firstTime = getWallClockMinutes(items[0].time);
  const lastTime = getWallClockMinutes(items[items.length - 1].time);
  const events = [
    ...sunrise.map((time) => ({ type: 'sunrise' as const, time })),
    ...sunset.map((time) => ({ type: 'sunset' as const, time })),
  ];

  return events
    .map((event) => {
      const eventTime = getWallClockMinutes(event.time);

      if (eventTime < firstTime || eventTime > lastTime) {
        return null;
      }

      const nextIndex = items.findIndex((item) => getWallClockMinutes(item.time) >= eventTime);

      if (nextIndex === 0 || getWallClockMinutes(items[nextIndex].time) === eventTime) {
        return { ...event, index: nextIndex, offset: 0 };
      }

      const index = nextIndex - 1;
      const intervalStart = getWallClockMinutes(items[index].time);
      const intervalEnd = getWallClockMinutes(items[nextIndex].time);

      return {
        ...event,
        index,
        offset: (eventTime - intervalStart) / (intervalEnd - intervalStart),
      };
    })
    .filter((marker): marker is SolarMarker => marker !== null)
    .sort((left, right) => left.time.localeCompare(right.time));
}
