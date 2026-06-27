export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-sky-100 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-sky-500">
            Weatherline
          </p>
          <div className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
            Forecast dashboard
          </div>
        </div>

        <div className="hidden flex-1 max-w-xl md:block">
          <label className="flex items-center gap-3 rounded-full border border-sky-100 bg-sky-50/80 px-4 py-2 text-sm text-slate-500 shadow-sm">
            <span className="size-2 rounded-full bg-[var(--page-accent)] shadow-[0_0_0_4px_rgba(59,130,246,0.12)]" />
            Search city, zip, or airport
          </label>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/80 px-3 py-2 text-sm text-slate-700 shadow-sm">
          <span className="size-2 rounded-full bg-emerald-400" />
          Live data ready
        </div>
      </div>
    </header>
  );
}