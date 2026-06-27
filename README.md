# Weatherline

Weatherline is a live weather dashboard built with Next.js, React, TypeScript, and Tailwind CSS. It turns Open-Meteo forecast data into an interactive front end with location search, current weather summaries, hourly and daily views, unit switching, and recent search history.

## What it does

- Search for a city, zip code, or airport code.
- Use your current location when browser geolocation is available.
- Switch between Fahrenheit and Celsius.
- View live current conditions, hourly forecast cards, and a 4-day outlook.
- Keep recent searches in local storage for quick reuse.

## Weather workflow

1. The client UI sends a request to the local API route at `/api/weather`.
2. The route resolves the place name with Open-Meteo geocoding when needed.
3. The route fetches the forecast data from Open-Meteo.
4. The dashboard maps the response into the current scene, summary text, metrics, hourly cards, and daily cards.
5. Recent searches are stored locally in the browser so they are available on the next visit.

## Project structure

- `app/page.tsx` handles page state, search, location loading, and weather data orchestration.
- `components/WeatherDashboard.tsx` renders the dashboard UI.
- `app/api/weather/route.ts` acts as a local weather proxy for geocoding and forecast requests.
- `app/globals.css` defines the visual system and reusable surface styles.

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Available scripts

- `npm run dev` starts the local Next.js development server.
- `npm run build` creates a production build.
- `npm run start` runs the production server after building.
- `npm run lint` runs ESLint.

## Notes

- The app depends on browser geolocation for the current-location shortcut.
- Weather data is sourced from Open-Meteo through the local API route, so the UI does not call the external endpoints directly.