import { act, renderHook, waitFor } from '@testing-library/react-native';
import { PermissionStatus } from 'expo';
import * as Location from 'expo-location';

import { getCityFromCoordinates, searchCoordinates } from '@/services/geocoding';
import { fetchWeather } from '@/services/weather';
import type { CachedWeather, WeatherForecast } from '@/types/weather';
import { getStoredCity, getWeatherCache, setStoredCity, setWeatherCache } from '@/utils/storage';
import { useWeather } from '@/hooks/useWeather';

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 'balanced' },
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock('@/services/geocoding', () => ({
  getCityFromCoordinates: jest.fn(),
  searchCoordinates: jest.fn(),
}));

jest.mock('@/services/weather', () => ({
  fetchWeather: jest.fn(),
}));

jest.mock('@/utils/storage', () => ({
  getStoredCity: jest.fn(),
  getWeatherCache: jest.fn(),
  setStoredCity: jest.fn(),
  setWeatherCache: jest.fn(),
}));

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

describe('useWeather', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getStoredCity).mockResolvedValue('');
    jest.mocked(getWeatherCache).mockResolvedValue(null);
    jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({
      status: PermissionStatus.DENIED,
      granted: false,
      canAskAgain: true,
      expires: 'never',
    });
    jest.mocked(searchCoordinates).mockResolvedValue({
      latitude: -22.9,
      longitude: -47.1,
      city: 'Campinas',
    });
    jest.mocked(getCityFromCoordinates).mockResolvedValue('Campinas');
    jest.mocked(fetchWeather).mockResolvedValue(forecast);
    jest.mocked(setStoredCity).mockResolvedValue();
    jest.mocked(setWeatherCache).mockResolvedValue();
  });

  it('explains a denied location permission and keeps city search available', async () => {
    const { result } = await renderHook(() => useWeather());

    await waitFor(() => expect(result.current.error).toContain('Permissão de localização negada'));

    await act(async () => {
      await result.current.searchCity('  Campinas  ');
    });

    expect(searchCoordinates).toHaveBeenCalledWith('Campinas');
    expect(fetchWeather).toHaveBeenCalledWith(-22.9, -47.1);
    expect(result.current.city).toBe('Campinas');
    expect(result.current.condition).toBe('clear');
    expect(result.current.forecast).toEqual(forecast);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(setStoredCity).toHaveBeenCalledWith('Campinas');
    expect(setWeatherCache).toHaveBeenCalledWith(forecast, 'Campinas');
  });

  it('restores a saved forecast while refreshing the remembered city', async () => {
    const cached: CachedWeather = {
      forecast,
      city: 'Campinas',
      savedAt: 1_792_420_000_000,
    };
    jest.mocked(getStoredCity).mockResolvedValue('Campinas');
    jest.mocked(getWeatherCache).mockResolvedValue(cached);

    const { result } = await renderHook(() => useWeather());

    await waitFor(() => expect(result.current.city).toBe('Campinas'));
    expect(searchCoordinates).toHaveBeenCalledWith('Campinas');
    expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
    await waitFor(() => expect(result.current.stale).toBe(false));
    expect(result.current.forecast).toEqual(forecast);
  });

  it('refreshes device coordinates instead of reusing the previous position', async () => {
    jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({
      status: PermissionStatus.GRANTED,
      granted: true,
      canAskAgain: true,
      expires: 'never',
    });
    jest
      .mocked(Location.getCurrentPositionAsync)
      .mockResolvedValueOnce({
        coords: {
          latitude: -22.9,
          longitude: -47.1,
          altitude: null,
          accuracy: 5,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: 1,
      })
      .mockResolvedValueOnce({
        coords: {
          latitude: -23.5,
          longitude: -46.6,
          altitude: null,
          accuracy: 5,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: 2,
      });

    const { result } = await renderHook(() => useWeather());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.refresh();
    });

    expect(fetchWeather).toHaveBeenNthCalledWith(1, -22.9, -47.1);
    expect(fetchWeather).toHaveBeenNthCalledWith(2, -23.5, -46.6);
  });
});
