import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CachedWeather, WeatherForecast } from '@/types/weather';

export const LAST_CITY_KEY = 'clima-agora:last-city';
export const WEATHER_CACHE_KEY = 'clima-agora:weather-cache';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCachedWeather(value: unknown): value is CachedWeather {
  if (!isRecord(value) || !isRecord(value.forecast)) {
    return false;
  }

  const forecast = value.forecast;
  return (
    typeof value.savedAt === 'number' &&
    Number.isFinite(value.savedAt) &&
    typeof forecast.timezone === 'string' &&
    isRecord(forecast.current) &&
    Array.isArray(forecast.hourly) &&
    Array.isArray(forecast.hourlyPrecipitation) &&
    isRecord(forecast.daily)
  );
}

export async function getStoredCity(): Promise<string> {
  return (await AsyncStorage.getItem(LAST_CITY_KEY)) ?? '';
}

export async function setStoredCity(city: string): Promise<void> {
  const normalized = city.trim();

  if (!normalized) {
    await AsyncStorage.removeItem(LAST_CITY_KEY);
    return;
  }

  await AsyncStorage.setItem(LAST_CITY_KEY, normalized);
}

export async function getWeatherCache(): Promise<CachedWeather | null> {
  const value = await AsyncStorage.getItem(WEATHER_CACHE_KEY);

  if (value === null) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch (error) {
    throw new Error('O cache local do clima está corrompido.', { cause: error });
  }

  if (!isCachedWeather(parsed)) {
    throw new Error('O cache local do clima tem um formato inválido.');
  }

  return parsed;
}

export async function setWeatherCache(
  forecast: WeatherForecast,
  savedAt = Date.now(),
): Promise<void> {
  const value: CachedWeather = { forecast, savedAt };
  await AsyncStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(value));
}
