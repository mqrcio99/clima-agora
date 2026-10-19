import type { WeatherCondition } from '@/types/weather';

export type WeatherTheme = {
  gradientColors: readonly [string, string, string];
  card: string;
  text: string;
  muted: string;
  accent: string;
  border: string;
  isDark: boolean;
};

export const weatherThemes: Record<WeatherCondition, WeatherTheme> = {
  clear: {
    gradientColors: ['#F9D65C', '#FFFFFF', '#BFE5FF'],
    card: '#FFFFFF',
    text: '#10213C',
    muted: '#4A5B73',
    accent: '#B45309',
    border: 'rgba(16, 33, 60, 0.12)',
    isDark: false,
  },
  rain: {
    gradientColors: ['#334155', '#475569', '#334155'],
    card: '#1F2937',
    text: '#F5F7FB',
    muted: '#CBD5E1',
    accent: '#93C5FD',
    border: 'rgba(203, 213, 225, 0.2)',
    isDark: true,
  },
  cold: {
    gradientColors: ['#A7D8F5', '#F8FCFF', '#CFE6F7'],
    card: '#F8FCFF',
    text: '#17314F',
    muted: '#3F566C',
    accent: '#2563EB',
    border: 'rgba(23, 49, 79, 0.12)',
    isDark: false,
  },
  snow: {
    gradientColors: ['#A7D8F5', '#F8FCFF', '#CFE6F7'],
    card: '#F8FCFF',
    text: '#17314F',
    muted: '#3F566C',
    accent: '#2563EB',
    border: 'rgba(23, 49, 79, 0.12)',
    isDark: false,
  },
  cloudy: {
    gradientColors: ['#B8C9D6', '#E5EEF5', '#9FB9CF'],
    card: '#F5F9FC',
    text: '#22364C',
    muted: '#34475A',
    accent: '#496A86',
    border: 'rgba(34, 54, 76, 0.14)',
    isDark: false,
  },
  night: {
    gradientColors: ['#08152F', '#203B73', '#172A50'],
    card: '#08152F',
    text: '#F8FBFF',
    muted: '#B8C7E8',
    accent: '#F8D66D',
    border: 'rgba(184, 199, 232, 0.2)',
    isDark: true,
  },
  storm: {
    gradientColors: ['#111827', '#27364A', '#111827'],
    card: '#1F2937',
    text: '#F5F7FB',
    muted: '#CBD5E1',
    accent: '#93C5FD',
    border: 'rgba(203, 213, 225, 0.2)',
    isDark: true,
  },
};

export function getWeatherTheme(condition: WeatherCondition): WeatherTheme {
  return weatherThemes[condition];
}
