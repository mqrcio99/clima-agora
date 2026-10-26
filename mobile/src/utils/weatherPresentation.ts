import type { WeatherCondition } from '@/types/weather';

export const WEATHER_CONDITION_LABELS: Record<WeatherCondition, string> = {
  clear: 'Sol forte',
  rain: 'Chuva',
  cold: 'Frio',
  snow: 'Neve',
  cloudy: 'Nublado',
  night: 'Noite clara',
  storm: 'Tempestade',
};

export const WEATHER_CONDITION_ICONS: Record<WeatherCondition, string> = {
  clear: '☀️',
  rain: '🌧️',
  cold: '❄️',
  snow: '❄️',
  cloudy: '☁️',
  night: '🌙',
  storm: '⛈️',
};
