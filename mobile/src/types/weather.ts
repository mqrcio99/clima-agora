export type WeatherCondition = 'clear' | 'rain' | 'cold' | 'snow' | 'cloudy' | 'night' | 'storm';

export type IsDay = 0 | 1;

export type HourlyWeather = {
  time: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  wind: number;
  rainChance: number;
  condition: WeatherCondition;
  isDay: IsDay;
};

export type CurrentWeather = {
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  wind_gusts_10m: number;
  weather_code: number;
  is_day: IsDay;
  uv_index: number;
};

export type DailyWeather = {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[];
  uv_index_max: number[];
  sunrise: string[];
  sunset: string[];
  weather_code: number[];
};

export type WeatherForecast = {
  current: CurrentWeather;
  hourly: HourlyWeather[];
  hourlyPrecipitation: number[];
  daily: DailyWeather;
  timezone: string;
};

export type CachedWeather = {
  forecast: WeatherForecast;
  city: string;
  savedAt: number;
};

export type OpenMeteoResponse = {
  current: CurrentWeather;
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    relative_humidity_2m: number[];
    wind_speed_10m: number[];
    precipitation_probability: number[];
    precipitation: number[];
    weather_code: number[];
    is_day: IsDay[];
  };
  daily: DailyWeather;
  timezone: string;
};
