"use client";

import { useId, useSyncExternalStore } from "react";
import {
  emptyFilters,
  filterPlaces,
  parseFilters,
  toQueryString,
  type FilterablePlace,
  type PlaceFilters,
} from "@/lib/place-filter";

type Option = { value: string; label: string };

type ExplorerLabels = {
  search: string;
  searchPlaceholder: string;
  area: string;
  anyArea: string;
  category: string;
  anyCategory: string;
  featuredOnly: string;
  reset: string;
  /** e.g. "{count} place" and "{count} places". */
  resultsOne: string;
  results: string;
  noResults: string;
  /** Hidden heading above the results, for screen-reader navigation. */
  resultsHeading: string;
};

type PlaceExplorerProps = {
  /** For the plural rule ("1 place", and in French "0 adresse"). */
  locale: string;
  /** Each place's searchable facts plus its card, rendered on the server. */
  places: (FilterablePlace & { card: React.ReactNode })[];
  areas: Option[];
  categories: Option[];
  labels: ExplorerLabels;
};

/**
 * Search and filters for the places page.
 *
 * The filters live in the URL (?q=…&area=…), so a filtered list can be shared
 * or bookmarked, and the back button works. The page is still fully
 * prerendered: the server sends every card, and this component only decides
 * which ones to show. Without JavaScript, all places are listed.
 */
export function PlaceExplorer({
  locale,
  places,
  areas,
  categories,
  labels,
}: PlaceExplorerProps) {
  const search = useSyncExternalStore(subscribeToUrl, () => window.location.search, () => "");
  const filters = parseFilters(search);
  const results = filterPlaces(places, filters);
  const active = toQueryString(filters) !== "";
  const id = useId();

  const update = (change: Partial<PlaceFilters>) => {
    const next = { ...filters, ...change };
    const url = window.location.pathname + toQueryString(next) + window.location.hash;
    window.history.replaceState(window.history.state, "", url);
    window.dispatchEvent(new Event(URL_CHANGE));
  };

  const fieldClass =
    "mt-2 block min-h-11 w-full rounded-sm border border-line bg-white px-3 text-base text-ink focus:border-ocean-700";

  return (
    <div>
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="grid gap-4 rounded-sm bg-sand-50 p-5 ring-1 ring-line sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end"
      >
        <label className="block text-sm font-medium sm:col-span-2 lg:col-span-1">
          {labels.search}
          <input
            type="search"
            value={filters.q}
            placeholder={labels.searchPlaceholder}
            onChange={(e) => update({ q: e.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="block text-sm font-medium">
          {labels.area}
          <select
            value={filters.area}
            onChange={(e) => update({ area: e.target.value })}
            className={fieldClass}
          >
            <option value="">{labels.anyArea}</option>
            {areas.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          {labels.category}
          <select
            value={filters.category}
            onChange={(e) => update({ category: e.target.value })}
            className={fieldClass}
          >
            <option value="">{labels.anyCategory}</option>
            {categories.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex min-h-11 flex-wrap items-center gap-x-6 gap-y-2 sm:col-span-2 lg:col-span-1">
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.featured}
              onChange={(e) => update({ featured: e.target.checked })}
              className="size-5 accent-ocean-900"
            />
            {labels.featuredOnly}
          </label>
          {active && (
            <button
              type="button"
              onClick={() => update(emptyFilters)}
              className="min-h-11 text-sm font-medium text-lagoon-700 underline underline-offset-4"
            >
              {labels.reset}
            </button>
          )}
        </div>
      </form>

      <h2 className="sr-only">{labels.resultsHeading}</h2>
      {/* Announced by screen readers whenever the number of results changes. */}
      <p id={id} role="status" className="mt-8 text-sm text-ink-muted">
        {(new Intl.PluralRules(locale).select(results.length) === "one"
          ? labels.resultsOne
          : labels.results
        ).replace("{count}", String(results.length))}
      </p>

      {results.length > 0 ? (
        <ul aria-describedby={id} className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
          {results.map((place) => (
            <li key={place.slug}>{place.card}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 font-display text-2xl">{labels.noResults}</p>
      )}
    </div>
  );
}

/** Fired after we change the URL ourselves; "popstate" covers back/forward. */
const URL_CHANGE = "places:urlchange";

function subscribeToUrl(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(URL_CHANGE, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(URL_CHANGE, onChange);
  };
}
