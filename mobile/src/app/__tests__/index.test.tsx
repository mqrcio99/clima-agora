import { render } from '@testing-library/react-native';
import HomeScreen from '../index';

jest.mock('@/components/WeatherBackground', () => ({
  WeatherBackground: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/hooks/useWeather', () => ({
  useWeather: () => ({
    city: '',
    condition: 'clear',
    error: null,
    forecast: null,
    loading: true,
    stale: false,
    refresh: jest.fn(),
    searchCity: jest.fn(),
    useCurrentLocation: jest.fn(),
  }),
}));

describe('home screen', () => {
  it('renders the app title', async () => {
    const { getByRole } = await render(<HomeScreen />);

    expect(getByRole('header', { name: 'Clima Agora' })).toBeTruthy();
  });
});
