import type { WeatherCondition, WeatherForecast } from '@/types/weather';

const WEATHER_CODE_BY_CONDITION: Record<WeatherCondition, number> = {
  clear: 0,
  rain: 61,
  cold: 0,
  snow: 71,
  cloudy: 3,
  night: 0,
  storm: 95,
};

const TEMPERATURE_BY_CONDITION: Record<WeatherCondition, number> = {
  clear: 26,
  rain: 18,
  cold: 8,
  snow: -2,
  cloudy: 19,
  night: 20,
  storm: 22,
};

function formatLocalTime(date: Date): string {
  return date.toISOString().slice(0, 16);
}

function getDay(date: Date, offset: number): string {
  const nextDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + offset, 12),
  );
  return nextDate.toISOString().slice(0, 10);
}

export function createMockWeatherForecast(condition: WeatherCondition, now: Date): WeatherForecast {
  const baseTemperature = TEMPERATURE_BY_CONDITION[condition];
  const weatherCode = WEATHER_CODE_BY_CONDITION[condition];
  const startOfHour = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
  );
  const hourlyTimes = Array.from({ length: 48 }, (_, index) =>
    formatLocalTime(new Date(startOfHour + index * 60 * 60 * 1000)),
  );
  const dailyTimes = Array.from({ length: 5 }, (_, index) => getDay(now, index));
  const rainChance = condition === 'rain' || condition === 'storm' ? 75 : 0;

  return {
    timezone: 'UTC',
    current: {
      temperature_2m: baseTemperature,
      apparent_temperature: baseTemperature - 1,
      relative_humidity_2m: condition === 'rain' || condition === 'storm' ? 82 : 55,
      wind_speed_10m: condition === 'storm' ? 48 : 12,
      wind_gusts_10m: condition === 'storm' ? 65 : 18,
      weather_code: weatherCode,
      is_day: condition === 'night' ? 0 : 1,
      uv_index: condition === 'clear' ? 8 : 2,
    },
    hourly: hourlyTimes.map((time, index) => {
      const temperature = baseTemperature + Math.sin(index / 5) * 3;
      const hour = Number(time.slice(11, 13));
      return {
        time,
        temp: temperature,
        feelsLike: temperature - 1,
        humidity: condition === 'rain' || condition === 'storm' ? 82 : 55,
        wind: condition === 'storm' ? 48 : 12,
        rainChance,
        condition,
        isDay: condition === 'night' ? 0 : hour >= 6 && hour < 19 ? 1 : 0,
      };
    }),
    hourlyPrecipitation: hourlyTimes.map(() => (rainChance ? 0.5 : 0)),
    daily: {
      time: dailyTimes,
      temperature_2m_max: dailyTimes.map(() => baseTemperature + 4),
      temperature_2m_min: dailyTimes.map(() => baseTemperature - 5),
      precipitation_probability_max: dailyTimes.map(() => rainChance),
      uv_index_max: dailyTimes.map(() => (condition === 'clear' ? 8 : 2)),
      sunrise: dailyTimes.map((day) => `${day}T06:00`),
      sunset: dailyTimes.map((day) => `${day}T18:00`),
      weather_code: dailyTimes.map(() => weatherCode),
    },
  };
}
