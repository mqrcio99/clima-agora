import { createMockWeatherForecast } from '@/playground/mockWeather';
import type { WeatherCondition } from '@/types/weather';
import { getWeatherCondition } from '@/utils/weatherCondition';

const conditions: WeatherCondition[] = [
  'clear',
  'rain',
  'cold',
  'snow',
  'cloudy',
  'night',
  'storm',
];

describe('playground weather scenarios', () => {
  it.each(conditions)('creates a complete %s mock forecast', (condition) => {
    const now = new Date('2026-10-19T14:30:00.000Z');
    const forecast = createMockWeatherForecast(condition, now);

    expect(forecast.hourly).toHaveLength(48);
    expect(forecast.daily.time).toHaveLength(5);
    expect(
      getWeatherCondition({
        weatherCode: forecast.current.weather_code,
        temperature: forecast.current.temperature_2m,
        isDay: forecast.current.is_day,
      }),
    ).toBe(condition);
  });
});
