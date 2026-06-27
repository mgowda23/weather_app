import { NextResponse } from "next/server";

type GeocodeResult = {
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
};

type ForecastResponse = {
  current?: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    weather_code: number;
    is_day: 0 | 1;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    pressure_msl: number;
    visibility: number;
    uv_index: number;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunset?: string[];
  };
};

function getPlaceLabel(item: GeocodeResult): string {
  return [item.name, item.admin1, item.country].filter(Boolean).join(", ");
}

async function getForecast(latitude: number, longitude: number): Promise<ForecastResponse> {
  const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code,is_day,relative_humidity_2m,wind_speed_10m,pressure_msl,visibility,uv_index&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&visibility_unit=mi&timezone=auto`,
    {
      cache: "no-store",
    }
  );

  if (!weatherResponse.ok) {
    throw new Error("Unable to load the weather forecast.");
  }

  return weatherResponse.json();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query");
  const latitude = url.searchParams.get("latitude");
  const longitude = url.searchParams.get("longitude");

  try {
    if (latitude && longitude) {
      const forecast = await getForecast(Number(latitude), Number(longitude));
      return NextResponse.json({
        place: `Your location (${Number(latitude).toFixed(2)}, ${Number(longitude).toFixed(2)})`,
        forecast,
      });
    }

    const trimmed = query?.trim();
    if (!trimmed) {
      return NextResponse.json({ error: "Enter a city name first." }, { status: 400 });
    }

    const geocodeResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=1&language=en&format=json`,
      {
        cache: "no-store",
      }
    );

    if (!geocodeResponse.ok) {
      throw new Error("Could not search for that location.");
    }

    const geocodeData: { results?: GeocodeResult[] } = await geocodeResponse.json();
    const location = geocodeData.results?.[0];

    if (!location) {
      return NextResponse.json({ error: `No location found for \"${trimmed}\".` }, { status: 404 });
    }

    const forecast = await getForecast(location.latitude, location.longitude);

    return NextResponse.json({
      place: getPlaceLabel(location),
      forecast,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong while loading weather." },
      { status: 500 }
    );
  }
}