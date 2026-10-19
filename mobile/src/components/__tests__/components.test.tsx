import { fireEvent, render } from '@testing-library/react-native';

import { Forecast } from '@/components/Forecast';
import { HourlyForecast } from '@/components/HourlyForecast';
import { WeatherCard } from '@/components/WeatherCard';
import type { WeatherForecast } from '@/types/weather';
import { getWeatherTheme } from '@/styles/themes';

const now = new Date('2026-10-19T04:30:00.000Z');
const theme = getWeatherTheme('clear');

function createForecast(): WeatherForecast {
  return {
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
    hourly: [
      {
        time: '2026-10-19T05:00',
        temp: 20,
        feelsLike: 19,
        humidity: 60,
        wind: 8,
        rainChance: 10,
        condition: 'clear',
        isDay: 0,
      },
      {
        time: '2026-10-19T06:00',
        temp: 21,
        feelsLike: 19,
        humidity: 62,
        wind: 9,
        rainChance: 20,
        condition: 'cloudy',
        isDay: 1,
      },
      {
        time: '2026-10-19T07:00',
        temp: 22,
        feelsLike: 20,
        humidity: 59,
        wind: 11,
        rainChance: 0,
        condition: 'clear',
        isDay: 1,
      },
    ],
    hourlyPrecipitation: [0, 0.1, 0],
    daily: {
      time: ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23'],
      temperature_2m_max: [24, 25, 23, 22, 21],
      temperature_2m_min: [16, 17, 15, 14, 13],
      precipitation_probability_max: [20, 30, 10, 0, 5],
      uv_index_max: [3, 4, 3, 2, 2],
      sunrise: ['2026-10-19T06:00'],
      sunset: ['2026-10-19T18:00'],
      weather_code: [0, 2, 61, 0, 3],
    },
    timezone: 'UTC',
  };
}

describe('weather display components', () => {
  it('shows hourly rain only when its chance reaches twenty percent and reveals details on tap', async () => {
    const forecast = createForecast();
    const { getByRole, getByText, queryByText } = await render(
      <HourlyForecast
        daily={forecast.daily}
        hourly={forecast.hourly}
        now={now}
        theme={theme}
        timezone={forecast.timezone}
      />,
    );

    expect(getByText('Chuva a partir das 06h')).toBeTruthy();
    expect(getByText('20%')).toBeTruthy();
    expect(queryByText('10%')).toBeNull();

    await fireEvent.press(getByRole('button', { name: /06h/ }));

    expect(getByText('06h · Sensação 19° · Umidade 62% · Vento 9 km/h')).toBeTruthy();
  });

  it('renders loading and error states with an accessible retry action', async () => {
    const onRetry = jest.fn();
    const { getByLabelText, getByRole, getByText, rerender } = await render(
      <WeatherCard condition="clear" loading now={now} theme={theme} />,
    );

    expect(getByLabelText('Carregando previsão')).toBeTruthy();

    await rerender(
      <WeatherCard
        condition="clear"
        error="Sem conexão"
        loading={false}
        now={now}
        onRetry={onRetry}
        theme={theme}
      />,
    );

    await fireEvent.press(getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(getByText('Sem conexão')).toBeTruthy();
  });

  it('renders current metrics and the five-day forecast', async () => {
    const forecast = createForecast();
    const { getByLabelText, getByText, getAllByText } = await render(
      <>
        <WeatherCard
          city="Campinas"
          condition="clear"
          forecast={forecast}
          loading={false}
          now={now}
          theme={theme}
        />
        <Forecast daily={forecast.daily} theme={theme} />
      </>,
    );

    expect(getByLabelText('Previsão do tempo para Campinas')).toBeTruthy();
    expect(getByLabelText('Temperatura 22 graus')).toBeTruthy();
    expect(getByText('Umidade')).toBeTruthy();
    expect(getByText('Próximos 5 dias')).toBeTruthy();
    expect(getAllByText('Hoje')).toHaveLength(1);
    expect(getAllByText(/°/).length).toBeGreaterThanOrEqual(10);
  });
});
