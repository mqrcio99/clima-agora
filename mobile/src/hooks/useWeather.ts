import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { AppState } from 'react-native';

import { getCityFromCoordinates, searchCoordinates } from '@/services/geocoding';
import { fetchWeather } from '@/services/weather';
import type { WeatherCondition, WeatherForecast } from '@/types/weather';
import { getStoredCity, getWeatherCache, setStoredCity, setWeatherCache } from '@/utils/storage';
import { getWeatherCondition } from '@/utils/weatherCondition';

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

type WeatherState = {
  forecast: WeatherForecast | null;
  city: string;
  condition: WeatherCondition;
  loading: boolean;
  error: string | null;
  stale: boolean;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

type SavedLocation = Coordinates & {
  city: string;
  rememberCity: boolean;
  isDeviceLocation: boolean;
};

const initialState: WeatherState = {
  forecast: null,
  city: '',
  condition: 'clear',
  loading: true,
  error: null,
  stale: false,
};

function getCurrentCondition(forecast: WeatherForecast): WeatherCondition {
  return getWeatherCondition({
    weatherCode: forecast.current.weather_code,
    temperature: forecast.current.temperature_2m,
    isDay: forecast.current.is_day,
  });
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof TypeError) {
    return 'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.';
  }

  return error instanceof Error ? error.message : fallback;
}

function getLocationError(error: unknown): string {
  return error instanceof Error
    ? `Não foi possível obter a localização: ${error.message}. Pesquise uma cidade para continuar.`
    : 'Não foi possível obter a localização. Pesquise uma cidade para continuar.';
}

export function useWeather() {
  const [state, setState] = useState<WeatherState>(initialState);
  const requestId = useRef(0);
  const lastLocation = useRef<SavedLocation | null>(null);

  const loadCoordinates = useCallback(
    async (
      coordinates: Coordinates,
      cityName: string | null,
      rememberCity: boolean,
      id: number,
      isDeviceLocation = false,
    ) => {
      setState((previous) => ({ ...previous, loading: true, error: null }));

      try {
        const forecastPromise = fetchWeather(coordinates.latitude, coordinates.longitude);
        const cityPromise = cityName
          ? Promise.resolve({ city: cityName, rememberCity })
          : getCityFromCoordinates(coordinates.latitude, coordinates.longitude).then(
              (city) => ({
                city: city === 'Localidade desconhecida' ? 'Minha localização' : city,
                rememberCity: false,
              }),
              (error: unknown) => {
                console.warn('Não foi possível resolver o nome da localização.', error);
                return { city: 'Minha localização', rememberCity: false };
              },
            );
        const [forecast, resolved] = await Promise.all([forecastPromise, cityPromise]);

        if (requestId.current !== id) {
          return;
        }

        lastLocation.current = {
          ...coordinates,
          city: resolved.city,
          rememberCity: resolved.rememberCity,
          isDeviceLocation,
        };
        setState((previous) => ({
          ...previous,
          forecast,
          city: resolved.city,
          condition: getCurrentCondition(forecast),
          stale: false,
          error: null,
        }));

        try {
          await Promise.all([
            setWeatherCache(forecast, resolved.city),
            setStoredCity(resolved.rememberCity ? resolved.city : ''),
          ]);
        } catch (error) {
          if (requestId.current === id) {
            setState((previous) => ({
              ...previous,
              loading: false,
              error: `Previsão atualizada, mas não foi possível salvar os dados: ${getErrorMessage(error, 'erro de armazenamento')}`,
            }));
          }
          return;
        }

        if (requestId.current === id) {
          setState((previous) => ({ ...previous, loading: false }));
        }
      } catch (error) {
        if (requestId.current === id) {
          setState((previous) => ({
            ...previous,
            loading: false,
            error: getErrorMessage(error, 'Não foi possível carregar o clima.'),
          }));
        }
      }
    },
    [],
  );

  const searchCity = useCallback(
    async (city: string) => {
      const query = city.trim();

      if (!query) {
        setState((previous) => ({
          ...previous,
          loading: false,
          error: 'Digite o nome de uma cidade para buscar.',
        }));
        return;
      }

      const id = ++requestId.current;
      setState((previous) => ({ ...previous, loading: true, error: null }));

      try {
        const place = await searchCoordinates(query);
        await loadCoordinates(
          { latitude: place.latitude, longitude: place.longitude },
          place.city,
          true,
          id,
        );
      } catch (error) {
        if (requestId.current === id) {
          setState((previous) => ({
            ...previous,
            loading: false,
            error: getErrorMessage(error, 'Não foi possível buscar essa cidade.'),
          }));
        }
      }
    },
    [loadCoordinates],
  );

  const requestCurrentLocation = useCallback(async () => {
    const id = ++requestId.current;
    setState((previous) => ({ ...previous, loading: true, error: null }));

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        throw new Error(
          'Permissão de localização negada. Pesquise uma cidade ou permita o acesso nas configurações.',
        );
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await loadCoordinates(
        { latitude: position.coords.latitude, longitude: position.coords.longitude },
        null,
        false,
        id,
        true,
      );
    } catch (error) {
      if (requestId.current === id) {
        setState((previous) => ({
          ...previous,
          loading: false,
          error: getLocationError(error),
        }));
      }
    }
  }, [loadCoordinates]);

  const refresh = useCallback(async () => {
    const location = lastLocation.current;
    if (!location) {
      await requestCurrentLocation();
      return;
    }
    if (location.isDeviceLocation) {
      await requestCurrentLocation();
      return;
    }

    const id = ++requestId.current;
    await loadCoordinates(location, location.city, location.rememberCity, id);
  }, [loadCoordinates, requestCurrentLocation]);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const [cityResult, cacheResult] = await Promise.allSettled([
        getStoredCity(),
        getWeatherCache(),
      ]);

      if (!mounted) {
        return;
      }

      const storedCity = cityResult.status === 'fulfilled' ? cityResult.value : '';
      const cachedWeather = cacheResult.status === 'fulfilled' ? cacheResult.value : null;
      if (cityResult.status === 'rejected') {
        console.warn('Não foi possível ler a última cidade armazenada.', cityResult.reason);
      }

      if (cachedWeather) {
        const forecast = cachedWeather.forecast;
        setState((previous) => ({
          ...previous,
          forecast,
          city: storedCity || cachedWeather.city,
          condition: getCurrentCondition(forecast),
          stale: true,
        }));
      } else if (cacheResult.status === 'rejected') {
        console.warn('Não foi possível ler o cache local do clima.', cacheResult.reason);
      }

      if (storedCity) {
        await searchCity(storedCity);
      } else {
        await requestCurrentLocation();
      }
    };

    void initialize();

    return () => {
      mounted = false;
      requestId.current += 1;
    };
  }, [searchCity, requestCurrentLocation]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') {
        void refresh();
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [refresh]);

  return {
    ...state,
    refresh,
    searchCity,
    useCurrentLocation: requestCurrentLocation,
  };
}
