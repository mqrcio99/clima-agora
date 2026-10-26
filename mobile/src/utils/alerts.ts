import type { WeatherForecast } from '@/types/weather';

export type WeatherAlert = {
  key: 'rain' | 'storm' | 'wind' | 'heat' | 'cold' | 'uv';
  severity: 'alerta' | 'atenção';
  title: string;
  description: string;
  icon: string;
};

export function getWeatherAlerts(data: WeatherForecast): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const maxChance = data.hourly.reduce((highest, item) => Math.max(highest, item.rainChance), 0);
  const highestHourlyRain = data.hourlyPrecipitation.reduce(
    (highest, value) => Math.max(highest, value),
    0,
  );

  if (maxChance >= 80 || highestHourlyRain >= 3) {
    alerts.push({
      key: 'rain',
      severity: 'alerta',
      title: 'Chuva intensa nas próximas horas',
      description: 'Há alta chance de precipitação forte e intensa no período mais próximo.',
      icon: '🌧️',
    });
  } else if (maxChance >= 55) {
    alerts.push({
      key: 'rain',
      severity: 'atenção',
      title: 'Possível chuva forte',
      description: 'A probabilidade de chuva aumenta nos próximos horários.',
      icon: '🌦️',
    });
  }

  if ([95, 96, 99].includes(data.current.weather_code)) {
    alerts.push({
      key: 'storm',
      severity: 'alerta',
      title: 'Tempestade possível',
      description: 'Há condições favoráveis a descargas elétricas e rajadas intensas.',
      icon: '⛈️',
    });
  }

  if (data.current.wind_speed_10m >= 40 || data.current.wind_gusts_10m >= 50) {
    alerts.push({
      key: 'wind',
      severity: 'atenção',
      title: 'Vento forte',
      description: 'Rajadas e deslocamento do ar podem aumentar no período mais próximo.',
      icon: '💨',
    });
  }

  if (data.current.temperature_2m >= 32) {
    alerts.push({
      key: 'heat',
      severity: 'alerta',
      title: 'Calor extremo',
      description: 'Temperaturas elevadas podem gerar desconforto e atenção à hidratação.',
      icon: '☀️',
    });
  }

  if (data.current.temperature_2m <= 5) {
    alerts.push({
      key: 'cold',
      severity: 'atenção',
      title: 'Frio intenso',
      description: 'Temperaturas baixas podem demandar proteção extra para o exterior.',
      icon: '❄️',
    });
  }

  const uvIndex = data.current.uv_index ?? data.daily.uv_index_max[0] ?? 0;
  if (uvIndex >= 7) {
    alerts.push({
      key: 'uv',
      severity: 'atenção',
      title: 'UV alto',
      description: 'A radiação ultravioleta está elevada em comparação com o normal.',
      icon: '🛡️',
    });
  }

  return alerts;
}
