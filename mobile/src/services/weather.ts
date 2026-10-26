import type { OpenMeteoResponse, WeatherForecast } from '@/types/weather';
import { findForecastStartIndex, mapHourlyForecast } from '@/utils/hourlyForecast';

const WEATHER_CACHE = new Map<string, { timestamp: number; data: OpenMeteoResponse }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCacheKey(latitude: number, longitude: number): string {
  return `${Number(latitude).toFixed(4)},${Number(longitude).toFixed(4)}`;
}

function requireNumber(value: number, label: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(`A resposta da previsão contém um valor inválido em ${label}.`);
  }

  return value;
}

function requireLength(values: unknown[], expectedLength: number, label: string): void {
  if (values.length !== expectedLength) {
    throw new Error(`A resposta da previsão tem dados incompletos em ${label}.`);
  }
}

function validatePayload(payload: OpenMeteoResponse): void {
  if (
    !payload ||
    typeof payload.timezone !== 'string' ||
    !Array.isArray(payload.hourly?.time) ||
    !Array.isArray(payload.daily?.time) ||
    !payload.current
  ) {
    throw new Error('A resposta da previsão está incompleta.');
  }

  const hourlyLength = payload.hourly.time.length;
  for (const [field, values] of Object.entries(payload.hourly)) {
    if (Array.isArray(values)) {
      requireLength(values, hourlyLength, `hourly.${field}`);
    }
  }

  const dailyLength = payload.daily.time.length;
  for (const [field, values] of Object.entries(payload.daily)) {
    if (Array.isArray(values)) {
      requireLength(values, dailyLength, `daily.${field}`);
    }
  }

  for (const [field, value] of Object.entries(payload.current)) {
    requireNumber(value, `current.${field}`);
  }
}

export function mapOpenMeteoResponse(payload: OpenMeteoResponse, now: Date): WeatherForecast {
  validatePayload(payload);

  const hourly = mapHourlyForecast(payload.hourly, payload.timezone, now);
  const firstHourlyIndex = findForecastStartIndex(payload.hourly.time, payload.timezone, now);
  const hourlyPrecipitation =
    firstHourlyIndex < 0
      ? []
      : payload.hourly.precipitation
          .slice(firstHourlyIndex)
          .map((value, index) =>
            requireNumber(value, `hourly.precipitation[${firstHourlyIndex + index}]`),
          );

  return {
    current: payload.current,
    hourly,
    hourlyPrecipitation,
    daily: payload.daily,
    timezone: payload.timezone,
  };
}

export function buildWeatherUrl(latitude: number, longitude: number): string {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error('As coordenadas informadas são inválidas.');
  }

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,weather_code,is_day,uv_index',
    hourly:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation_probability,weather_code,is_day,precipitation',
    daily:
      'temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset,weather_code',
    minutely_15: 'precipitation',
    forecast_days: '5',
    timezone: 'auto',
  });

  return `https://api.open-meteo.com/v1/forecast?${params}`;
}

export async function fetchWeather(latitude: number, longitude: number): Promise<WeatherForecast> {
  const cacheKey = getCacheKey(latitude, longitude);
  const cachedEntry = WEATHER_CACHE.get(cacheKey);
  const now = new Date();

  if (cachedEntry && now.getTime() - cachedEntry.timestamp < CACHE_TTL_MS) {
    return mapOpenMeteoResponse(cachedEntry.data, now);
  }

  const response = await fetch(buildWeatherUrl(latitude, longitude));

  if (!response.ok) {
    throw new Error(`Não foi possível consultar a API (${response.status})`);
  }

  const payload = (await response.json()) as OpenMeteoResponse;
  const forecast = mapOpenMeteoResponse(payload, now);
  WEATHER_CACHE.set(cacheKey, { timestamp: now.getTime(), data: payload });
  return forecast;
}
