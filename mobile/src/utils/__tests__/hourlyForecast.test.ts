import type { HourlyWeather } from '@/types/weather';
import {
  findForecastStartIndex,
  getHourlyForecastOverview,
  getHourlyForecastSummary,
  getSolarMarkers,
  mapHourlyForecast,
} from '@/utils/hourlyForecast';
import type { OpenMeteoResponse } from '@/types/weather';

const now = new Date('2026-10-19T14:30:00.000Z');

function createHourly(time: string, temp: number, rainChance = 0): HourlyWeather {
  return {
    time,
    temp,
    feelsLike: temp,
    humidity: 50,
    wind: 10,
    rainChance,
    condition: 'clear',
    isDay: 1,
  };
}

describe('hourly forecast helpers', () => {
  it('filters from the next local hour in the queried timezone', () => {
    const times = ['2026-10-19T22:00', '2026-10-19T23:00', '2026-10-20T00:00', '2026-10-20T01:00'];

    expect(findForecastStartIndex(times, 'Asia/Tokyo', now)).toBe(2);
  });

  it('maps API arrays to the required hourly objects', () => {
    const hourly: OpenMeteoResponse['hourly'] = {
      time: ['2026-10-19T22:00', '2026-10-19T23:00', '2026-10-20T00:00', '2026-10-20T01:00'],
      temperature_2m: [23, 22, 21, 20],
      apparent_temperature: [24, 22, 20, 19],
      relative_humidity_2m: [45, 50, 55, 60],
      wind_speed_10m: [8, 9, 10, 11],
      precipitation_probability: [10, 20, 30, 40],
      precipitation: [0, 0.1, 0.2, 0.3],
      weather_code: [0, 0, 0, 61],
      is_day: [1, 0, 0, 0],
    };

    const result = mapHourlyForecast(hourly, 'Asia/Tokyo', now);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      time: '2026-10-20T00:00',
      temp: 21,
      feelsLike: 20,
      humidity: 55,
      wind: 10,
      rainChance: 30,
      condition: 'night',
      isDay: 0,
    });
  });

  it('labels the first displayed item as now', () => {
    const overview = getHourlyForecastOverview([
      createHourly('2026-10-19T15:00', 24),
      createHourly('2026-10-19T16:00', 23),
    ]);

    expect(overview.map((item) => item.label)).toEqual(['Agora', '16h']);
  });

  it('summarizes the first rain chance at or above twenty percent', () => {
    const items = [
      createHourly('2026-10-19T11:00', 24, 10),
      createHourly('2026-10-19T17:00', 21, 20),
      createHourly('2026-10-19T18:00', 20, 80),
    ];

    expect(getHourlyForecastSummary(items, { timezone: 'UTC', now })).toBe(
      'Chuva a partir das 17h',
    );
  });

  it('summarizes cooling when rain is unlikely', () => {
    const items = [
      createHourly('2026-10-19T15:00', 21),
      createHourly('2026-10-19T20:00', 18),
      createHourly('2026-10-19T22:00', 14),
    ];

    expect(getHourlyForecastSummary(items, { timezone: 'UTC', now })).toBe('Esfriando: 14° às 22h');
  });

  it('reports no rain when there is no significant cooling or rain chance', () => {
    const items = [createHourly('2026-10-19T15:00', 20), createHourly('2026-10-19T20:00', 19)];

    expect(getHourlyForecastSummary(items, { timezone: 'UTC', now })).toBe(
      'Sem chuva nas próximas 24h',
    );
  });

  it('places sunrise and sunset between the matching hourly items', () => {
    const items = [
      createHourly('2026-10-19T05:00', 18),
      createHourly('2026-10-19T06:00', 19),
      createHourly('2026-10-19T07:00', 20),
      createHourly('2026-10-19T18:00', 24),
      createHourly('2026-10-19T19:00', 23),
    ];

    expect(
      getSolarMarkers(items, {
        sunrise: ['2026-10-19T06:30'],
        sunset: ['2026-10-19T18:45'],
      }),
    ).toEqual([
      { type: 'sunrise', time: '2026-10-19T06:30', index: 1, offset: 0.5 },
      { type: 'sunset', time: '2026-10-19T18:45', index: 3, offset: 0.75 },
    ]);
  });
});
