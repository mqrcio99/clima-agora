import { buildWeatherUrl, mapOpenMeteoResponse } from '@/services/weather';
import type { OpenMeteoResponse } from '@/types/weather';

function createPayload(): OpenMeteoResponse {
  return {
    timezone: 'Asia/Tokyo',
    current: {
      temperature_2m: 22,
      apparent_temperature: 21,
      relative_humidity_2m: 55,
      wind_speed_10m: 10,
      wind_gusts_10m: 16,
      weather_code: 0,
      is_day: 0,
      uv_index: 0,
    },
    hourly: {
      time: ['2026-10-19T22:00', '2026-10-19T23:00', '2026-10-20T00:00', '2026-10-20T01:00'],
      temperature_2m: [23, 22, 21, 20],
      apparent_temperature: [24, 22, 20, 19],
      relative_humidity_2m: [45, 50, 55, 60],
      wind_speed_10m: [8, 9, 10, 11],
      precipitation_probability: [10, 20, 30, 40],
      precipitation: [0, 0.1, 0.2, 0.3],
      weather_code: [0, 0, 0, 61],
      is_day: [1, 0, 0, 0],
    },
    daily: {
      time: ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23'],
      temperature_2m_max: [23, 24, 25, 24, 22],
      temperature_2m_min: [17, 18, 19, 18, 16],
      precipitation_probability_max: [20, 30, 10, 0, 10],
      uv_index_max: [3, 4, 4, 3, 2],
      sunrise: [
        '2026-10-19T06:00',
        '2026-10-20T06:01',
        '2026-10-21T06:02',
        '2026-10-22T06:03',
        '2026-10-23T06:04',
      ],
      sunset: [
        '2026-10-19T17:00',
        '2026-10-20T16:59',
        '2026-10-21T16:58',
        '2026-10-22T16:57',
        '2026-10-23T16:56',
      ],
      weather_code: [0, 1, 2, 3, 61],
    },
  };
}

describe('Open-Meteo weather service', () => {
  it('requests the required hourly fields, five days and automatic timezone', () => {
    const url = new URL(buildWeatherUrl(-23.55, -46.63));

    expect(url.searchParams.get('hourly')).toBe(
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation_probability,weather_code,is_day,precipitation',
    );
    expect(url.searchParams.get('daily')).toBe(
      'temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset,weather_code',
    );
    expect(url.searchParams.get('forecast_days')).toBe('5');
    expect(url.searchParams.get('timezone')).toBe('auto');
    expect(url.searchParams.get('minutely_15')).toBe('precipitation');
  });

  it('maps fields and filters hours using the queried timezone', () => {
    const forecast = mapOpenMeteoResponse(createPayload(), new Date('2026-10-19T14:30:00Z'));

    expect(forecast.timezone).toBe('Asia/Tokyo');
    expect(forecast.hourly).toHaveLength(2);
    expect(Object.keys(forecast.hourly[0])).toEqual([
      'time',
      'temp',
      'feelsLike',
      'humidity',
      'wind',
      'rainChance',
      'condition',
      'isDay',
    ]);
    expect(forecast.hourly[0]).toEqual({
      time: '2026-10-20T00:00',
      temp: 21,
      feelsLike: 20,
      humidity: 55,
      wind: 10,
      rainChance: 30,
      condition: 'night',
      isDay: 0,
    });
    expect(forecast.hourlyPrecipitation).toEqual([0.2, 0.3]);
    expect(forecast.daily.sunrise).toHaveLength(5);
  });

  it('rejects incomplete API arrays instead of fabricating forecast values', () => {
    const payload = createPayload();
    payload.hourly.wind_speed_10m.pop();

    expect(() => mapOpenMeteoResponse(payload, new Date('2026-10-19T14:30:00Z'))).toThrow(
      'A resposta da previsão tem dados incompletos em hourly.wind_speed_10m.',
    );
  });
});
