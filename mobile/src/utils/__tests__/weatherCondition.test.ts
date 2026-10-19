import { getWeatherCondition } from '@/utils/weatherCondition';

describe('getWeatherCondition', () => {
  it('prioritizes storms', () => {
    expect(getWeatherCondition({ weatherCode: 95, temperature: 30, isDay: 1 })).toBe('storm');
  });

  it('classifies snow and rain', () => {
    expect(getWeatherCondition({ weatherCode: 71, temperature: 5, isDay: 1 })).toBe('snow');
    expect(getWeatherCondition({ weatherCode: 61, temperature: 15, isDay: 1 })).toBe('rain');
  });

  it('classifies cold and clear skies', () => {
    expect(getWeatherCondition({ weatherCode: 0, temperature: 8, isDay: 1 })).toBe('cold');
    expect(getWeatherCondition({ weatherCode: 0, temperature: 25, isDay: 1 })).toBe('clear');
    expect(getWeatherCondition({ weatherCode: 0, temperature: 25, isDay: 0 })).toBe('night');
  });
});
