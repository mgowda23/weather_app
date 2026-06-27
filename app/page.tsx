"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

type WeatherMode = "sunny" | "cloudy" | "rainy" | "clear";

type WeatherTheme = {
  city: string;
  label: string;
  headline: string;
  temp: string;
  feelsLike: string;
  summary: string;
  aqi: string;
  sunset: string;
  scene: "sunny" | "cloudy" | "rainy" | "clear";
  sky: string;
  backdrop: string;
  accent: string;
  accentSoft: string;
  hourly: Array<{ time: string; temp: string; condition: string }>;
  daily: Array<{ day: string; high: string; low: string; summary: string }>;
  stats: Array<{ label: string; value: string }>;
};

const themes: Record<WeatherMode, WeatherTheme> = {
  sunny: {
    city: "San Diego, CA",
    label: "Sunny",
    headline: "Bright skies and a warm afternoon",
    temp: "82°",
    feelsLike: "86°",
    summary: "Clear skies, warm sun, and a soft coastal breeze. Ideal for outdoor plans.",
    aqi: "AQI 28 · Good",
    sunset: "Sunset 8:17 PM",
    scene: "sunny",
    sky: "linear-gradient(180deg, #fffbe8 0%, #f8fbff 45%, #e8f4ff 100%)",
    backdrop:
      "radial-gradient(circle at 18% 10%, rgba(255, 223, 128, 0.24), transparent 20%), radial-gradient(circle at 84% 14%, rgba(96, 165, 250, 0.18), transparent 22%)",
    accent: "#f59e0b",
    accentSoft: "rgba(245, 158, 11, 0.12)",
    hourly: [
      { time: "Now", temp: "82°", condition: "Strong sun" },
      { time: "1 PM", temp: "84°", condition: "Peak warmth" },
      { time: "2 PM", temp: "85°", condition: "Clear sky" },
      { time: "3 PM", temp: "84°", condition: "Bright" },
      { time: "4 PM", temp: "82°", condition: "Golden light" },
      { time: "5 PM", temp: "79°", condition: "Cooling" },
    ],
    daily: [
      { day: "Today", high: "84°", low: "69°", summary: "Sunny, bright, and warm through sunset" },
      { day: "Sat", high: "86°", low: "71°", summary: "Mostly sunny with light breezes" },
      { day: "Sun", high: "83°", low: "70°", summary: "Sunny intervals and a warm afternoon" },
      { day: "Mon", high: "80°", low: "68°", summary: "Clear morning with a mild evening" },
    ],
    stats: [
      { label: "Humidity", value: "38%" },
      { label: "Wind", value: "8 mph" },
      { label: "Pressure", value: "1015 hPa" },
      { label: "UV Index", value: "8" },
      { label: "Visibility", value: "10 mi" },
      { label: "Feels Like", value: "86°" },
    ],
  },
  cloudy: {
    city: "Portland, OR",
    label: "Cloudy",
    headline: "Soft overcast with a calm breeze",
    temp: "66°",
    feelsLike: "65°",
    summary: "Heavy cloud cover keeps the light soft and the temperature mild.",
    aqi: "AQI 32 · Good",
    sunset: "Sunset 8:52 PM",
    scene: "cloudy",
    sky: "linear-gradient(180deg, #f7fbff 0%, #eef4fb 50%, #dfeaf5 100%)",
    backdrop:
      "radial-gradient(circle at 18% 12%, rgba(148, 163, 184, 0.18), transparent 20%), radial-gradient(circle at 82% 16%, rgba(191, 219, 254, 0.22), transparent 24%)",
    accent: "#64748b",
    accentSoft: "rgba(100, 116, 139, 0.1)",
    hourly: [
      { time: "Now", temp: "66°", condition: "Overcast" },
      { time: "1 PM", temp: "67°", condition: "Soft light" },
      { time: "2 PM", temp: "68°", condition: "Grey sky" },
      { time: "3 PM", temp: "67°", condition: "Steady" },
      { time: "4 PM", temp: "66°", condition: "Cool breeze" },
      { time: "5 PM", temp: "64°", condition: "Evening cloud" },
    ],
    daily: [
      { day: "Today", high: "68°", low: "59°", summary: "Cloudy, mild, and steady all day" },
      { day: "Sat", high: "70°", low: "58°", summary: "Mostly cloudy with brief bright breaks" },
      { day: "Sun", high: "67°", low: "57°", summary: "Overcast and cool with calm wind" },
      { day: "Mon", high: "69°", low: "58°", summary: "Soft skies and comfortable temps" },
    ],
    stats: [
      { label: "Humidity", value: "64%" },
      { label: "Wind", value: "7 mph" },
      { label: "Pressure", value: "1019 hPa" },
      { label: "UV Index", value: "4" },
      { label: "Visibility", value: "8.7 mi" },
      { label: "Feels Like", value: "65°" },
    ],
  },
  rainy: {
    city: "Seattle, WA",
    label: "Rainy",
    headline: "Cool showers with animated rainfall",
    temp: "58°",
    feelsLike: "56°",
    summary: "Rain bands move through the area, creating a cooler and wetter afternoon.",
    aqi: "AQI 21 · Good",
    sunset: "Sunset 9:03 PM",
    scene: "rainy",
    sky: "linear-gradient(180deg, #f7fbff 0%, #eef5fd 50%, #dce9f8 100%)",
    backdrop:
      "radial-gradient(circle at 18% 14%, rgba(59, 130, 246, 0.18), transparent 20%), radial-gradient(circle at 82% 18%, rgba(148, 163, 184, 0.2), transparent 24%)",
    accent: "#3b82f6",
    accentSoft: "rgba(59, 130, 246, 0.1)",
    hourly: [
      { time: "Now", temp: "58°", condition: "Light rain" },
      { time: "1 PM", temp: "57°", condition: "Passing shower" },
      { time: "2 PM", temp: "58°", condition: "Steady rain" },
      { time: "3 PM", temp: "59°", condition: "Drizzle" },
      { time: "4 PM", temp: "58°", condition: "Wet roads" },
      { time: "5 PM", temp: "56°", condition: "Rain easing" },
    ],
    daily: [
      { day: "Today", high: "60°", low: "52°", summary: "Rain through afternoon with damp streets" },
      { day: "Sat", high: "62°", low: "51°", summary: "Showers taper later in the day" },
      { day: "Sun", high: "61°", low: "50°", summary: "Clouds linger with a chance of drizzle" },
      { day: "Mon", high: "64°", low: "53°", summary: "A drier day with brighter breaks" },
    ],
    stats: [
      { label: "Humidity", value: "88%" },
      { label: "Wind", value: "12 mph" },
      { label: "Pressure", value: "1006 hPa" },
      { label: "UV Index", value: "2" },
      { label: "Visibility", value: "4.1 mi" },
      { label: "Feels Like", value: "56°" },
    ],
  },
  clear: {
    city: "Denver, CO",
    label: "Clear",
    headline: "Crisp blue skies with excellent visibility",
    temp: "71°",
    feelsLike: "70°",
    summary: "Clear, dry, and bright with a comfortable temperature swing during the day.",
    aqi: "AQI 20 · Good",
    sunset: "Sunset 8:29 PM",
    scene: "clear",
    sky: "linear-gradient(180deg, #f7fffe 0%, #eef8ff 48%, #e4f3ff 100%)",
    backdrop:
      "radial-gradient(circle at 16% 12%, rgba(34, 197, 94, 0.1), transparent 18%), radial-gradient(circle at 84% 12%, rgba(56, 189, 248, 0.14), transparent 24%)",
    accent: "#22c55e",
    accentSoft: "rgba(34, 197, 94, 0.1)",
    hourly: [
      { time: "Now", temp: "71°", condition: "Blue sky" },
      { time: "1 PM", temp: "73°", condition: "Dry air" },
      { time: "2 PM", temp: "75°", condition: "Stable" },
      { time: "3 PM", temp: "74°", condition: "Light breeze" },
      { time: "4 PM", temp: "72°", condition: "Clean horizon" },
      { time: "5 PM", temp: "69°", condition: "Cooling" },
    ],
    daily: [
      { day: "Today", high: "75°", low: "58°", summary: "Clear and dry with a comfortable afternoon" },
      { day: "Sat", high: "77°", low: "60°", summary: "Sunny and bright with low humidity" },
      { day: "Sun", high: "76°", low: "59°", summary: "Cloudless morning and a calm evening" },
      { day: "Mon", high: "74°", low: "57°", summary: "Clear sky with crisp morning air" },
    ],
    stats: [
      { label: "Humidity", value: "29%" },
      { label: "Wind", value: "6 mph" },
      { label: "Pressure", value: "1016 hPa" },
      { label: "UV Index", value: "7" },
      { label: "Visibility", value: "10 mi" },
      { label: "Feels Like", value: "70°" },
    ],
  },
};

const modeButtons: Array<{ mode: WeatherMode; label: string }> = [
  { mode: "sunny", label: "Sunny" },
  { mode: "cloudy", label: "Cloudy" },
  { mode: "rainy", label: "Rainy" },
  { mode: "clear", label: "Clear sky" },
];

export default function Home() {
  const [mode, setMode] = useState<WeatherMode>("sunny");
  const theme = themes[mode];

  const pageStyle = useMemo(
    () =>
      ({
        ["--page-bg" as string]: theme.sky,
        ["--page-accent-soft" as string]: theme.accentSoft,
        ["--page-accent" as string]: theme.accent,
      }) as CSSProperties,
    [theme]
  );

  const rainDrops = mode === "rainy" ? Array.from({ length: 18 }, (_, index) => index) : [];

  return (
    <div className="relative overflow-hidden bg-[var(--page-bg)]" style={pageStyle}>
      <div className="absolute inset-0 -z-10 weather-backdrop" />

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
          <article className="glass-panel relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
            <div className="weather-scene">
              {theme.scene === "sunny" && (
                <>
                  <div className="weather-sun scene-float" />
                  <div className="weather-cloud medium scene-float" style={{ top: "58%", right: "8%" }} />
                  <div className="weather-cloud small scene-float" style={{ top: "22%", left: "38%", opacity: 0.65 }} />
                </>
              )}
              {theme.scene === "cloudy" && (
                <>
                  <div className="weather-cloud large scene-float" style={{ top: "18%", left: "8%" }} />
                  <div className="weather-cloud medium scene-float" style={{ top: "44%", right: "10%" }} />
                  <div className="weather-cloud small scene-float" style={{ top: "68%", left: "34%", opacity: 0.78 }} />
                </>
              )}
              {theme.scene === "rainy" && (
                <>
                  <div className="weather-cloud large scene-float" style={{ top: "14%", left: "12%" }} />
                  <div className="weather-cloud medium scene-float" style={{ top: "36%", right: "10%" }} />
                  {rainDrops.map((drop) => (
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
              {theme.scene === "clear" && (
                <>
                  <div className="weather-sun scene-float" style={{ transform: "scale(0.8)", top: "1.4rem", right: "2rem" }} />
                  <div className="weather-cloud small scene-float" style={{ top: "18%", left: "48%", opacity: 0.3 }} />
                  <div className="weather-cloud medium scene-float" style={{ top: "65%", right: "12%", opacity: 0.4 }} />
                </>
              )}
            </div>

            <div className="relative z-10 max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.34em] text-sky-600">
                {theme.city}
              </p>
              <div className="mt-4 flex flex-wrap items-end gap-4">
                <h1 className="text-6xl font-semibold tracking-tight text-[var(--page-text)] sm:text-7xl">
                  {theme.temp}
                </h1>
                <div className="pb-2 text-sm text-[var(--page-muted)] sm:text-base">
                  <p className="font-semibold text-[var(--page-text)]">{theme.label}</p>
                  <p>Feels like {theme.feelsLike}</p>
                </div>
              </div>

              <div className="mt-4 inline-flex items-center rounded-full border border-sky-100 bg-sky-50/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-[var(--page-text)] shadow-sm">
                {theme.headline}
              </div>

              <p className="mt-4 max-w-xl text-base leading-7 text-[var(--page-muted)] sm:text-lg">
                {theme.summary}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-full border border-sky-100 bg-sky-50/80 px-4 py-2 text-sm text-[var(--page-text)] shadow-sm">
                  Updated 8 min ago
                </div>
                <div className="rounded-full border border-sky-100 bg-sky-50/80 px-4 py-2 text-sm text-[var(--page-text)] shadow-sm">
                  {theme.aqi}
                </div>
                <div className="rounded-full border border-sky-100 bg-sky-50/80 px-4 py-2 text-sm text-[var(--page-text)] shadow-sm">
                  {theme.sunset}
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {theme.stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-sky-100 bg-white/85 p-4 shadow-[0_16px_60px_rgba(15,23,42,0.05)]"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-sky-600">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--page-text)]">{item.value}</p>
                </div>
              ))}
            </div>
          </article>

          <aside className="glass-panel rounded-[2rem] p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.34em] text-sky-600">
                  Weather mode
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--page-text)]">
                  Dashboard reacts to the sky
                </h2>
              </div>
              <div className="rounded-full border border-sky-100 bg-sky-50/80 px-3 py-2 text-xs font-medium uppercase tracking-[0.22em] text-[var(--page-text)] shadow-sm">
                Interactive theme
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
              {modeButtons.map((button) => {
                const active = button.mode === mode;

                return (
                  <button
                    key={button.mode}
                    type="button"
                    onClick={() => setMode(button.mode)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                      active
                        ? "border-[var(--page-accent)] bg-[var(--page-accent-soft)] text-[var(--page-text)] shadow-sm"
                        : "border-sky-100 bg-white/85 text-[var(--page-muted)] hover:bg-sky-50/70"
                    }`}
                  >
                    {button.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-3xl border border-sky-100 bg-white/85 p-4">
              <div className="flex items-center justify-between text-sm text-[var(--page-muted)]">
                <span>Selected location</span>
                <span>{theme.city}</span>
              </div>
              <div className="mt-3 rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm text-[var(--page-muted)] shadow-sm">
                Search city, zip code, or airport code
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {["San Jose", "Austin", "Seattle"].map((city) => (
                <button
                  key={city}
                  type="button"
                  className="flex w-full items-center justify-between rounded-2xl border border-sky-100 bg-white/85 px-4 py-3 text-left text-sm text-[var(--page-text)] transition hover:bg-sky-50/70"
                >
                  <span>{city}</span>
                  <span className="text-[var(--page-muted)]">Tap to load</span>
                </button>
              ))}
            </div>
          </aside>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <article className="glass-panel rounded-[2rem] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.34em] text-sky-600">
                  Hourly forecast
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--page-text)]">
                  Next 6 hours
                </h2>
              </div>
              <p className="text-sm text-[var(--page-muted)]">Updated every 30 minutes</p>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              {theme.hourly.map((hour) => (
                <div
                  key={hour.time}
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
              <p className="text-sm uppercase tracking-[0.34em] text-sky-600">
                Daily outlook
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--page-text)]">
                4-day forecast
              </h2>
            </div>

            <div className="mt-6 space-y-3">
              {theme.daily.map((day) => (
                <div
                  key={day.day}
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
