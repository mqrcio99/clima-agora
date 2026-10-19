import AsyncStorage from '@react-native-async-storage/async-storage';

import type { WeatherForecast } from '@/types/weather';
import {
  getStoredCity,
  getWeatherCache,
  LAST_CITY_KEY,
  setStoredCity,
  setWeatherCache,
  WEATHER_CACHE_KEY,
} from '@/utils/storage';

jest.mock('@react-native-async-storage/async-storage', () => {
  const values = new Map<string, string>();

  return {
    __esModule: true,
    default: {
      clear: jest.fn(async () => {
        values.clear();
      }),
      getItem: jest.fn(async (key: string) => values.get(key) ?? null),
      removeItem: jest.fn(async (key: string) => {
        values.delete(key);
      }),
      setItem: jest.fn(async (key: string, value: string) => {
        values.set(key, value);
      }),
    },
  };
});

const forecast: WeatherForecast = {
  current: {
    temperature_2m: 22,
    apparent_temperature: 21,
    relative_humidity_2m: 55,
    wind_speed_10m: 10,
    wind_gusts_10m: 16,
    weather_code: 0,
    is_day: 1,
    uv_index: 3,
  },
  hourly: [],
  hourlyPrecipitation: [],
  daily: {
    time: [],
    temperature_2m_max: [],
    temperature_2m_min: [],
    precipitation_probability_max: [],
    uv_index_max: [],
    sunrise: [],
    sunset: [],
    weather_code: [],
  },
  timezone: 'America/Sao_Paulo',
};

describe('weather storage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('persists the normalized last city', async () => {
    await setStoredCity('  Campinas  ');

    expect(await getStoredCity()).toBe('Campinas');
    expect(await AsyncStorage.getItem(LAST_CITY_KEY)).toBe('Campinas');
  });

  it('removes the last city when the value is empty', async () => {
    await setStoredCity('Campinas');
    await setStoredCity('  ');

    expect(await getStoredCity()).toBe('');
  });

  it('round-trips a weather cache with its save time', async () => {
    await setWeatherCache(forecast, 'Campinas', 1_792_420_000_000);

    await expect(getWeatherCache()).resolves.toEqual({
      forecast,
      city: 'Campinas',
      savedAt: 1_792_420_000_000,
    });
  });

  it('reports corrupted cache data explicitly', async () => {
    await AsyncStorage.setItem(WEATHER_CACHE_KEY, '{invalid');

    await expect(getWeatherCache()).rejects.toThrow('O cache local do clima está corrompido.');
  });
});
