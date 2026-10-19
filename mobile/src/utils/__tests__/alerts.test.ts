import type { WeatherForecast } from '@/types/weather';
import { getWeatherAlerts } from '@/utils/alerts';

describe('getWeatherAlerts', () => {
  it('keeps rain, wind, heat, and high-UV warnings', () => {
    const forecast: WeatherForecast = {
      current: {
        temperature_2m: 34,
        apparent_temperature: 36,
        relative_humidity_2m: 60,
        wind_speed_10m: 45,
        wind_gusts_10m: 55,
        weather_code: 0,
        is_day: 1,
        uv_index: 8,
      },
      hourly: [
        {
          time: '2026-10-19T15:00',
          temp: 34,
          feelsLike: 36,
          humidity: 60,
          wind: 45,
          rainChance: 20,
          condition: 'clear',
          isDay: 1,
        },
        {
          time: '2026-10-19T16:00',
          temp: 33,
          feelsLike: 35,
          humidity: 60,
          wind: 45,
          rainChance: 75,
          condition: 'rain',
          isDay: 1,
        },
      ],
      hourlyPrecipitation: [0, 2.5, 4.1],
      daily: {
        time: ['2026-10-19'],
        temperature_2m_max: [35],
        temperature_2m_min: [24],
        precipitation_probability_max: [88],
        uv_index_max: [8],
        sunrise: ['2026-10-19T06:00'],
        sunset: ['2026-10-19T19:00'],
        weather_code: [0],
      },
      timezone: 'America/Sao_Paulo',
    };

    const alerts = getWeatherAlerts(forecast);

    expect(alerts.map((alert) => alert.key)).toEqual(
      expect.arrayContaining(['rain', 'wind', 'heat', 'uv']),
    );
  });
});
