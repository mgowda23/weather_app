"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

type WeatherScene = "sunny" | "cloudy" | "rainy" | "clear";

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

const quickExamples = ["San Diego", "Portland", "Seattle", "Denver"];

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

function formatTemp(value: number): string {
  return `${Math.round(value)}°`;
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

function buildDashboard(payload: ForecastResponse, placeLabel: string): DashboardState {
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
    temp: formatTemp(hourly.temperature_2m[currentIndex + index]),
    condition: weatherDescription(hourly.weather_code[currentIndex + index]),
  }));

  const dailyCards = daily.time.slice(0, 4).map((time, index) => ({
    day: index === 0 ? "Today" : formatWeekday(time),
    high: formatTemp(daily.temperature_2m_max[index]),
    low: formatTemp(daily.temperature_2m_min[index]),
    summary: index === 0 ? condition : weatherDescription(hourly.weather_code[Math.min(currentIndex + index * 24, hourly.weather_code.length - 1)]),
  }));

  return {
    scene,
    city: placeLabel,
    headline: sceneStyle.headline,
    temp: formatTemp(current.temperature_2m),
    feelsLike: formatTemp(current.apparent_temperature),
    summary: `${condition}. ${placeLabel} is currently ${formatTemp(current.temperature_2m)} with feels-like ${formatTemp(current.apparent_temperature)} and ${Math.round(current.relative_humidity_2m)}% humidity.`,
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
      { label: "Feels Like", value: formatTemp(current.apparent_temperature) },
    ],
  };
}

export default function Home() {
  const [query, setQuery] = useState("San Francisco");
  const [dashboard, setDashboard] = useState<DashboardState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageStyle = useMemo(
    () =>
      ({
        ["--page-bg" as string]: dashboard?.sky ?? sceneStyles.sunny.sky,
        ["--page-accent-soft" as string]: dashboard?.accentSoft ?? sceneStyles.sunny.accentSoft,
        ["--page-accent" as string]: dashboard?.accent ?? sceneStyles.sunny.accent,
      }) as CSSProperties,
    [dashboard]
  );

  const loadByQuery = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a city name first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/weather?query=${encodeURIComponent(trimmed)}`);
      const data: { place?: string; forecast?: ForecastResponse; error?: string } = await response.json();

      if (!response.ok || !data.forecast || !data.place) {
        throw new Error(data.error ?? "Unable to load the weather forecast.");
      }

      setDashboard(buildDashboard(data.forecast, data.place));
      setQuery(trimmed);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Something went wrong while loading weather.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCurrentLocation = useCallback(() => {
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
          const response = await fetch(`/api/weather?latitude=${latitude}&longitude=${longitude}`);
          const data: { place?: string; forecast?: ForecastResponse; error?: string } = await response.json();

          if (!response.ok || !data.forecast || !data.place) {
            throw new Error(data.error ?? "Unable to load the weather forecast.");
          }

          setDashboard(buildDashboard(data.forecast, data.place));
          setQuery("My location");
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
    void loadByQuery("San Francisco");
  }, [loadByQuery]);

  const weatherScene = dashboard?.scene ?? "sunny";

  const sceneBackground = (
    <div className="weather-scene">
      {weatherScene === "sunny" && (
        <>
          <div className="weather-sun scene-float" />
          <div className="weather-cloud medium scene-float" style={{ top: "58%", right: "8%" }} />
          <div className="weather-cloud small scene-float" style={{ top: "22%", left: "38%", opacity: 0.65 }} />
        </>
      )}
      {weatherScene === "cloudy" && (
        <>
          <div className="weather-cloud large scene-float" style={{ top: "18%", left: "8%" }} />
          <div className="weather-cloud medium scene-float" style={{ top: "44%", right: "10%" }} />
          <div className="weather-cloud small scene-float" style={{ top: "68%", left: "34%", opacity: 0.78 }} />
        </>
      )}
      {weatherScene === "rainy" && (
        <>
          <div className="weather-cloud large scene-float" style={{ top: "14%", left: "12%" }} />
          <div className="weather-cloud medium scene-float" style={{ top: "36%", right: "10%" }} />
          {Array.from({ length: 18 }, (_, index) => index).map((drop) => (
            <span
              key={drop}
              className="rain-drop"
              style={{
                left: `${5 + drop * 5}%`,
                animationDelay: `${(drop % 6) * 0.14}s`,
                animationDuration: `${0.95 + (drop % 5) * 0.08}s`,
                height: `${22 + (drop % 4) * 8}px`,
                opacity: 0.8,
              }}
            />
          ))}
        </>
      )}
      {weatherScene === "clear" && (
        <>
          <div className="weather-sun scene-float" style={{ transform: "scale(0.8)", top: "1.4rem", right: "2rem" }} />
          <div className="weather-cloud small scene-float" style={{ top: "18%", left: "48%", opacity: 0.3 }} />
          <div className="weather-cloud medium scene-float" style={{ top: "65%", right: "12%", opacity: 0.4 }} />
        </>
      )}
    </div>
  );

  return (
    <div className="relative overflow-hidden bg-[var(--page-bg)]" style={pageStyle}>
      <div className="absolute inset-0 -z-10 weather-backdrop" />

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
          <article className="glass-panel relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
            {sceneBackground}

            <div className="relative z-10 max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.34em] text-sky-600">
                {dashboard?.city ?? "Loading location"}
              </p>
              <div className="mt-4 flex flex-wrap items-end gap-4">
                <h1 className="text-6xl font-semibold tracking-tight text-[var(--page-text)] sm:text-7xl">
                  {isLoading && !dashboard ? "--°" : dashboard?.temp ?? "--°"}
                </h1>
                <div className="pb-2 text-sm text-[var(--page-muted)] sm:text-base">
                  <p className="font-semibold text-[var(--page-text)]">
                    {isLoading && !dashboard ? "Loading weather" : dashboard?.headline ?? "Weather update"}
                  </p>
                  <p>{isLoading && !dashboard ? "Please wait" : `Feels like ${dashboard?.feelsLike ?? "--°"}`}</p>
                </div>
              </div>

              <div className="mt-4 inline-flex items-center rounded-full border border-sky-100 bg-sky-50/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-[var(--page-text)] shadow-sm">
                {isLoading && !dashboard ? "Fetching real weather data" : dashboard?.status ?? "Weather status"}
              </div>

              <p className="mt-4 max-w-xl text-base leading-7 text-[var(--page-muted)] sm:text-lg">
                {error ?? dashboard?.summary ?? "Use the search box or your location to load the latest forecast."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-full border border-sky-100 bg-sky-50/80 px-4 py-2 text-sm text-[var(--page-text)] shadow-sm">
                  {isLoading && !dashboard ? "Loading..." : "Updated just now"}
                </div>
                <div className="rounded-full border border-sky-100 bg-sky-50/80 px-4 py-2 text-sm text-[var(--page-text)] shadow-sm">
                  {dashboard?.status ?? "Open-Meteo powered"}
                </div>
                <div className="rounded-full border border-sky-100 bg-sky-50/80 px-4 py-2 text-sm text-[var(--page-text)] shadow-sm">
                  Sunset {dashboard?.sunset ?? "--:--"}
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {(dashboard?.metrics ?? [
                { label: "Humidity", value: "--%" },
                { label: "Wind", value: "-- mph" },
                { label: "Pressure", value: "-- hPa" },
              ]).map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-sky-100 bg-white/85 p-4 shadow-[0_16px_60px_rgba(15,23,42,0.05)]"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-sky-600">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--page-text)]">{item.value}</p>
                </div>
              ))}
            </div>
          </article>

          <aside className="glass-panel rounded-[2rem] p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.34em] text-sky-600">Search weather</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--page-text)]">
                  Load a real location
                </h2>
              </div>
              <div className="rounded-full border border-sky-100 bg-sky-50/80 px-3 py-2 text-xs font-medium uppercase tracking-[0.22em] text-[var(--page-text)] shadow-sm">
                Interactive data
              </div>
            </div>

            <form
              className="mt-6 flex gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                void loadByQuery(query);
              }}
            >
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search city or place"
                className="min-w-0 flex-1 rounded-2xl border border-sky-100 bg-white/90 px-4 py-3 text-sm text-[var(--page-text)] shadow-sm outline-none placeholder:text-[var(--page-muted)] focus:border-[var(--page-accent)]"
              />
              <button
                type="submit"
                className="rounded-2xl border border-[var(--page-accent)] bg-[var(--page-accent-soft)] px-4 py-3 text-sm font-semibold text-[var(--page-text)] shadow-sm transition hover:brightness-105"
              >
                Search
              </button>
            </form>

            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={loadCurrentLocation}
                className="flex-1 rounded-2xl border border-sky-100 bg-white/85 px-4 py-3 text-sm font-medium text-[var(--page-text)] shadow-sm transition hover:bg-sky-50/70"
              >
                Use my location
              </button>
            </div>

            <div className="mt-6 rounded-3xl border border-sky-100 bg-white/85 p-4">
              <div className="flex items-center justify-between text-sm text-[var(--page-muted)]">
                <span>Selected location</span>
                <span>{dashboard?.city ?? "Waiting for search"}</span>
              </div>
              <div className="mt-3 rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm text-[var(--page-muted)] shadow-sm">
                Search city, zip code, or airport code
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {quickExamples.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setQuery(city);
                    void loadByQuery(city);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-sky-100 bg-white/85 px-4 py-3 text-left text-sm text-[var(--page-text)] transition hover:bg-sky-50/70"
                >
                  <span>{city}</span>
                  <span className="text-[var(--page-muted)]">Quick load</span>
                </button>
              ))}
            </div>
          </aside>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <article className="glass-panel rounded-[2rem] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.34em] text-sky-600">Hourly forecast</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--page-text)]">
                  Next 6 hours
                </h2>
              </div>
              <p className="text-sm text-[var(--page-muted)]">Current forecast from Open-Meteo</p>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              {(dashboard?.hourly ?? Array.from({ length: 6 }, (_, index) => ({
                time: index === 0 ? "Now" : `${index}:00`,
                temp: "--°",
                condition: "Loading",
              }))).map((hour, index) => (
                <div
                  key={`${hour.time}-${hour.condition}-${index}`}
                  className="rounded-2xl border border-sky-100 bg-white/85 p-4 text-center shadow-sm"
                >
                  <p className="text-sm text-[var(--page-muted)]">{hour.time}</p>
                  <p className="mt-3 text-3xl font-semibold text-[var(--page-text)]">{hour.temp}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[var(--page-muted)]">
                    {hour.condition}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-panel rounded-[2rem] p-6 sm:p-8">
            <div>
              <p className="text-sm uppercase tracking-[0.34em] text-sky-600">Daily outlook</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--page-text)]">
                4-day forecast
              </h2>
            </div>

            <div className="mt-6 space-y-3">
              {(dashboard?.daily ?? Array.from({ length: 4 }, (_, index) => ({
                day: index === 0 ? "Today" : "--",
                high: "--°",
                low: "--°",
                summary: "Loading forecast",
              }))).map((day, index) => (
                <div
                  key={`${day.day}-${day.high}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-sky-100 bg-white/85 px-4 py-4 shadow-sm"
                >
                  <div>
                    <p className="text-base font-medium text-[var(--page-text)]">{day.day}</p>
                    <p className="mt-1 text-sm text-[var(--page-muted)]">{day.summary}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-[var(--page-text)]">
                      {day.high} <span className="text-[var(--page-muted)]">/ {day.low}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </section>
    </div>
  );
}