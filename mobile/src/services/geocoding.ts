export type CityLocation = {
  latitude: number;
  longitude: number;
  city: string;
};

export async function searchCoordinates(city: string): Promise<CityLocation> {
  if (!city.trim()) {
    throw new Error('Informe o nome de uma cidade.');
  }

  const params = new URLSearchParams({
    name: city,
    language: 'pt',
    count: '1',
  });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`);

  if (!response.ok) {
    throw new Error(`Não foi possível consultar a API (${response.status})`);
  }

  const result = (await response.json()) as {
    results?: { latitude: number; longitude: number; name: string }[];
  };
  const place = result.results?.[0];

  if (
    !place ||
    typeof place.name !== 'string' ||
    !Number.isFinite(place.latitude) ||
    !Number.isFinite(place.longitude)
  ) {
    throw new Error('Cidade não encontrada');
  }

  return {
    latitude: place.latitude,
    longitude: place.longitude,
    city: place.name,
  };
}

export async function getCityFromCoordinates(latitude: number, longitude: number): Promise<string> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    localityLanguage: 'pt',
  });
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Não foi possível consultar a API (${response.status})`);
  }

  const result = (await response.json()) as {
    locality?: string;
    city?: string;
    country?: string;
  };

  return result.locality || result.city || result.country || 'Localidade desconhecida';
}
