"use client";

import type { CSSProperties } from "react";

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

type WeatherDashboardProps = {
	pageStyle: CSSProperties;
	dashboard: DashboardState | null;
	isLoading: boolean;
	error: string | null;
	query: string;
	setQuery: (value: string) => void;
	unit: TemperatureUnit;
	handleUnitChange: (nextUnit: TemperatureUnit) => void;
	loadByQuery: (name: string, selectedUnit: TemperatureUnit) => void;
	loadCurrentLocation: (selectedUnit: TemperatureUnit) => void;
	recentSearches: string[];
};

const quickExamples = ["San Diego", "Portland", "Seattle", "Denver"];

export default function WeatherDashboard({
	pageStyle,
	dashboard,
	isLoading,
	error,
	query,
	setQuery,
	unit,
	handleUnitChange,
	loadByQuery,
	loadCurrentLocation,
	recentSearches,
}: WeatherDashboardProps) {
	return (
		<div className="relative overflow-hidden bg-[var(--page-bg)]" style={pageStyle}>
			<div className="absolute inset-0 -z-10 weather-backdrop" />

			<section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
				<div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
					<article className="glass-panel rounded-[2rem] p-6 sm:p-8">
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
									className="rounded-2xl border border-sky-100 bg-white/95 p-4 shadow-[0_16px_60px_rgba(15,23,42,0.05)]"
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
								void loadByQuery(query, unit);
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
								onClick={() => loadCurrentLocation(unit)}
								className="flex-1 rounded-2xl border border-sky-100 bg-white/85 px-4 py-3 text-sm font-medium text-[var(--page-text)] shadow-sm transition hover:bg-sky-50/70"
							>
								Use my location
							</button>
						</div>

						<div className="mt-4 rounded-3xl border border-sky-100 bg-white/92 p-4">
							<div className="flex items-center justify-between gap-3 text-sm">
								<span className="text-[var(--page-muted)]">Temperature unit</span>
								<div className="grid grid-cols-2 rounded-full border border-sky-100 bg-sky-50/70 p-1">
									{(["fahrenheit", "celsius"] as TemperatureUnit[]).map((item) => {
										const active = unit === item;
										return (
											<button
												key={item}
												type="button"
												onClick={() => handleUnitChange(item)}
												className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition ${
													active
														? "bg-white text-[var(--page-text)] shadow-sm"
														: "text-[var(--page-muted)] hover:text-[var(--page-text)]"
												}`}
											>
												{item === "fahrenheit" ? "°F" : "°C"}
											</button>
										);
									})}
								</div>
							</div>
							</div>

						<div className="mt-6 rounded-3xl border border-sky-100 bg-white/92 p-4">
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
										void loadByQuery(city, unit);
									}}
									className="flex w-full items-center justify-between rounded-2xl border border-sky-100 bg-white/92 px-4 py-3 text-left text-sm text-[var(--page-text)] transition hover:bg-sky-50/70"
								>
									<span>{city}</span>
									<span className="text-[var(--page-muted)]">Quick load</span>
								</button>
							))}
						</div>

						<div className="mt-6 rounded-3xl border border-sky-100 bg-white/92 p-4">
							<div className="flex items-center justify-between gap-3">
								<p className="text-sm uppercase tracking-[0.28em] text-sky-600">Recent searches</p>
								<span className="text-xs text-[var(--page-muted)]">Saved locally</span>
							</div>
							<div className="mt-3 flex flex-wrap gap-2">
								{recentSearches.length === 0 ? (
									<span className="text-sm text-[var(--page-muted)]">No recent searches yet.</span>
								) : (
									recentSearches.map((recent) => (
										<button
											key={recent}
											type="button"
											onClick={() => {
												setQuery(recent);
												void loadByQuery(recent, unit);
											}}
											className="rounded-full border border-sky-100 bg-sky-50/80 px-3 py-2 text-xs font-medium text-[var(--page-text)] transition hover:bg-white"
										>
											{recent}
										</button>
									))
								)}
							</div>
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
									className="rounded-2xl border border-sky-100 bg-white/95 p-4 text-center shadow-sm"
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
									className="flex items-center justify-between gap-4 rounded-2xl border border-sky-100 bg-white/95 px-4 py-4 shadow-sm"
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