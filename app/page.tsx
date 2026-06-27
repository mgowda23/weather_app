"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import WeatherDashboard from "@/components/WeatherDashboard";

type WeatherScene = "sunny" | "cloudy" | "rainy" | "clear";

type TemperatureUnit = "fahrenheit" | "celsius";

type ForecastCard = {
  time: string;
  temp: string;
  condition: string;
};

type DailyCard = {
  day: string;
  high: string;
  low: string;
  summary: string;
};

type Metric = {
  label: string;
  value: string;
};

type DashboardState = {
  scene: WeatherScene;
  city: string;
  headline: string;
  temp: string;
  feelsLike: string;
  summary: string;
  status: string;
  sunset: string;
  accent: string;
  accentSoft: string;
  sky: string;
  hourly: ForecastCard[];
  daily: DailyCard[];
  metrics: Metric[];
};

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

const sceneStyles: Record<
  WeatherScene,
  { headline: string; accent: string; accentSoft: string; sky: string; label: string }
> = {
  sunny: {
    headline: "Bright skies and a warm afternoon",
    accent: "#f59e0b",
    accentSoft: "rgba(245, 158, 11, 0.12)",
    sky: "linear-gradient(180deg, #fffbe8 0%, #f8fbff 45%, #e8f4ff 100%)",
    label: "Sunny",
  },
  cloudy: {
    headline: "Soft overcast with a calm breeze",
    accent: "#64748b",
    accentSoft: "rgba(100, 116, 139, 0.1)",
    sky: "linear-gradient(180deg, #f7fbff 0%, #eef4fb 50%, #dfeaf5 100%)",
    label: "Cloudy",
  },
  rainy: {
    headline: "Cool showers with animated rainfall",
    accent: "#3b82f6",
    accentSoft: "rgba(59, 130, 246, 0.1)",
    sky: "linear-gradient(180deg, #f7fbff 0%, #eef5fd 50%, #dce9f8 100%)",
    label: "Rainy",
  },
  clear: {
    headline: "Crisp blue skies with excellent visibility",
    accent: "#22c55e",
    accentSoft: "rgba(34, 197, 94, 0.1)",
    sky: "linear-gradient(180deg, #f7fffe 0%, #eef8ff 48%, #e4f3ff 100%)",
    label: "Clear sky",
  },
};

function weatherSceneFromCode(code: number, isDay: 0 | 1): WeatherScene {
  if (code === 0) return isDay === 1 ? "sunny" : "clear";
  if ([1, 2, 3, 45, 48, 71, 73, 75, 77, 85, 86].includes(code)) return "cloudy";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) {
    return "rainy";
  }
  return isDay === 1 ? "cloudy" : "clear";
}

function weatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Heavy showers",
    82: "Violent showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Severe thunderstorm",
  };

  return descriptions[code] ?? "Weather update";
}

function formatTemp(value: number, unit: TemperatureUnit): string {
  return `${Math.round(value)}°${unit === "fahrenheit" ? "F" : "C"}`;
}

function formatMiles(value: number): string {
  return `${Math.round(value)} mi`;
}

function formatTimeLabel(value: string): string {
  return new Date(value).toLocaleTimeString([], { hour: "numeric" });
}

function formatWeekday(value: string): string {
  return new Date(value).toLocaleDateString([], { weekday: "short" });
}

function buildDashboard(payload: ForecastResponse, placeLabel: string, unit: TemperatureUnit): DashboardState {
  const current = payload.current;
  const hourly = payload.hourly;
  const daily = payload.daily;

  if (!current || !hourly || !daily) {
    throw new Error("Weather data is incomplete.");
  }

  const scene = weatherSceneFromCode(current.weather_code, current.is_day);
  const sceneStyle = sceneStyles[scene];
  const condition = weatherDescription(current.weather_code);
  const currentIndex = Math.max(hourly.time.findIndex((time) => time === current.time), 0);
  const hourlyCards = hourly.time.slice(currentIndex, currentIndex + 6).map((time, index) => ({
    time: index === 0 ? "Now" : formatTimeLabel(time),
    temp: formatTemp(hourly.temperature_2m[currentIndex + index], unit),
    condition: weatherDescription(hourly.weather_code[currentIndex + index]),
  }));

  const dailyCards = daily.time.slice(0, 4).map((time, index) => ({
    day: index === 0 ? "Today" : formatWeekday(time),
    high: formatTemp(daily.temperature_2m_max[index], unit),
    low: formatTemp(daily.temperature_2m_min[index], unit),
    summary: index === 0 ? condition : weatherDescription(hourly.weather_code[Math.min(currentIndex + index * 24, hourly.weather_code.length - 1)]),
  }));

  return {
    scene,
    city: placeLabel,
    headline: sceneStyle.headline,
    temp: formatTemp(current.temperature_2m, unit),
    feelsLike: formatTemp(current.apparent_temperature, unit),
    summary: `${condition}. ${placeLabel} is currently ${formatTemp(current.temperature_2m, unit)} with feels-like ${formatTemp(current.apparent_temperature, unit)} and ${Math.round(current.relative_humidity_2m)}% humidity.`,
    status: `${sceneStyle.label} · ${condition}`,
    sunset: daily.sunset?.[0] ? new Date(daily.sunset[0]).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "Sunset unavailable",
    accent: sceneStyle.accent,
    accentSoft: sceneStyle.accentSoft,
    sky: sceneStyle.sky,
    hourly: hourlyCards,
    daily: dailyCards,
    metrics: [
      { label: "Humidity", value: `${Math.round(current.relative_humidity_2m)}%` },
      { label: "Wind", value: `${Math.round(current.wind_speed_10m)} mph` },
      { label: "Pressure", value: `${Math.round(current.pressure_msl)} hPa` },
      { label: "UV Index", value: `${Math.round(current.uv_index)}` },
      { label: "Visibility", value: formatMiles(current.visibility) },
      { label: "Feels Like", value: formatTemp(current.apparent_temperature, unit) },
    ],
  };
}

export default function Home() {
  const [query, setQuery] = useState("San Francisco");
  const [unit, setUnit] = useState<TemperatureUnit>("fahrenheit");
  const [dashboard, setDashboard] = useState<DashboardState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [lastSearch, setLastSearch] = useState<{ kind: "query" | "geo"; query?: string } | null>(null);

  const pageStyle = useMemo(
    () =>
      ({
        ["--page-bg" as string]: dashboard?.sky ?? sceneStyles.sunny.sky,
        ["--page-accent-soft" as string]: dashboard?.accentSoft ?? sceneStyles.sunny.accentSoft,
        ["--page-accent" as string]: dashboard?.accent ?? sceneStyles.sunny.accent,
      }) as CSSProperties,
    [dashboard]
  );

  useEffect(() => {
    const storedRecentSearches = window.localStorage.getItem("weatherline-recent-searches");
    if (storedRecentSearches) {
      try {
        const parsed = JSON.parse(storedRecentSearches) as string[];
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.filter((item) => typeof item === "string" && item.trim().length > 0).slice(0, 6));
        }
      } catch {
        window.localStorage.removeItem("weatherline-recent-searches");
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("weatherline-recent-searches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  const storeRecentSearch = useCallback((searchValue: string) => {
    const normalized = searchValue.trim();
    if (!normalized) {
      return;
    }

    setRecentSearches((currentSearches) => {
      const nextSearches = [normalized, ...currentSearches.filter((item) => item.toLowerCase() !== normalized.toLowerCase())];
      return nextSearches.slice(0, 6);
    });
  }, []);

  const loadByQuery = useCallback(async (name: string, selectedUnit: TemperatureUnit) => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a city name first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/weather?query=${encodeURIComponent(trimmed)}&unit=${selectedUnit}`);
      const data: { place?: string; forecast?: ForecastResponse; error?: string } = await response.json();

      if (!response.ok || !data.forecast || !data.place) {
        throw new Error(data.error ?? "Unable to load the weather forecast.");
      }

      setDashboard(buildDashboard(data.forecast, data.place, selectedUnit));
      setQuery(trimmed);
      setLastSearch({ kind: "query", query: trimmed });
      storeRecentSearch(trimmed);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Something went wrong while loading weather.");
    } finally {
      setIsLoading(false);
    }
  }, [storeRecentSearch]);

  const loadCurrentLocation = useCallback((selectedUnit: TemperatureUnit) => {
    if (!navigator.geolocation) {
      setError("Your browser does not support location access.");
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`/api/weather?latitude=${latitude}&longitude=${longitude}&unit=${selectedUnit}`);
          const data: { place?: string; forecast?: ForecastResponse; error?: string } = await response.json();

          if (!response.ok || !data.forecast || !data.place) {
            throw new Error(data.error ?? "Unable to load the weather forecast.");
          }

          setDashboard(buildDashboard(data.forecast, data.place, selectedUnit));
          setQuery("My location");
          setLastSearch({ kind: "geo" });
        } catch (loadError) {
          setError(loadError instanceof Error ? loadError.message : "Something went wrong while loading weather.");
        } finally {
          setIsLoading(false);
        }
      },
      () => {
        setError("Location access was denied.");
        setIsLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    void loadByQuery("San Francisco", "fahrenheit");
  }, [loadByQuery]);

  const refreshCurrentWeather = useCallback(
    (selectedUnit: TemperatureUnit) => {
      if (lastSearch?.kind === "geo") {
        loadCurrentLocation(selectedUnit);
        return;
      }

      void loadByQuery(lastSearch?.query ?? query, selectedUnit);
    },
    [lastSearch, loadByQuery, loadCurrentLocation, query]
  );

  const handleUnitChange = useCallback(
    (nextUnit: TemperatureUnit) => {
      if (nextUnit === unit) {
        return;
      }

      setUnit(nextUnit);
      refreshCurrentWeather(nextUnit);
    },
    [refreshCurrentWeather, unit]
  );

  return (
    <WeatherDashboard
      pageStyle={pageStyle}
      dashboard={dashboard}
      isLoading={isLoading}
      error={error}
      query={query}
      setQuery={setQuery}
      unit={unit}
      handleUnitChange={handleUnitChange}
      loadByQuery={loadByQuery}
      loadCurrentLocation={loadCurrentLocation}
      recentSearches={recentSearches}
    />
  );
}