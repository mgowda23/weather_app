# Weatherline

Live weather dashboard built with Next.js, React, TypeScript, and Tailwind CSS. It turns Open-Meteo forecast data into current conditions, hourly cards, and a 4-day outlook.

## Features

- Search by city, zip code, or airport code
- Browser geolocation when available
- Fahrenheit / Celsius toggle
- Hourly forecast cards and a 4-day outlook
- Recent searches stored in localStorage

## How it works

1. The UI calls `/api/weather`.
2. The route geocodes the place name with Open-Meteo when needed.
3. The route fetches the forecast.
4. The dashboard maps the response into the current scene, metrics, hourly cards, and daily cards.

API calls stay on the server. The browser never talks to Open-Meteo directly.

## Stack

Next.js · React · TypeScript · Tailwind CSS · Open-Meteo

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Layout

- `app/page.tsx` — search, location, and data orchestration
- `components/WeatherDashboard.tsx` — dashboard UI
- `app/api/weather/route.ts` — geocoding and forecast proxy
