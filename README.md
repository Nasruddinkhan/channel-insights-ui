# Channel Insights

Responsive internal workforce analytics frontend built with React, TypeScript, Vite, Material UI, Apache ECharts and React Router. No backend, database, remote assets or external fonts.

## Setup

Requires Node.js 22.12+ (22.x) or Node.js 24+ (supported LTS recommended). The checked-in `.npmrc` avoids an npm 10 optional-peer resolver bug.

```sh
npm install
npm run dev
npm run typecheck
npm run format:check
npm run build
```

Vite prints the local development URL. Deploy `dist/` to a static host with SPA fallback to `index.html` for `/leave` and `/remote-work`.

## Structure

- `src/types.ts`: event, filter and table contracts
- `public/assets/feature-details.json`: deterministic 150-day demo dataset, fetched over HTTP
- `scripts/generate-mock-data.mjs`: reproducible JSON asset generator
- `src/data/events.ts`: snapshot date and department filter metadata
- `src/services/analyticsService.ts`: typed asynchronous service boundary with cancellation
- `src/utils/analytics.ts`: filtering, distinct counts, percentages, comparison periods and daily series
- `src/utils/chartOptions.ts`: chart configuration, kept separate from page rendering
- `src/components/`: reusable layout, filters, metric cards, chart panels and sortable/paginated CSV table
- `src/pages/AnalyticsPage.tsx`: shared overview and feature analytics orchestration

## Metrics and filtering

Requests count distinct `eventId`; active employees count distinct `employeeId` across both channels and all selected features. Web and Mobile cards count requests, not people. Mobile share is Mobile requests divided by total requests times 100, or zero for no requests. Unique counts across feature/department rows must not be added to infer the overall unique count.

All date boundaries and event display use Asia/Riyadh. Date ranges include both endpoints. Comparisons use the immediately preceding range with the same number of calendar days. When the previous count is zero, cards display “No prior activity” or “No change” rather than a percentage. Trends include zero activity days.

Filters are staged until Apply; Reset applies the default last 30 days. Quick selections are anchored to the fixed demo snapshot rather than the machine date, making results reproducible. Charts, cards and exports use the applied selection. Feature pages additionally restrict events to their feature. CSV exports every filtered table row in the current sort order, independent of pagination. Zero-activity table rows are omitted, and empty selections show an explicit message.

## Replacing demo services

Implement `AnalyticsService.getEvents(signal)` with `fetch('/api/usage-events', {signal})`, check `response.ok`, validate the response shape, and return `UsageEvent[]`. Preserve unique event IDs and ISO timestamps with offsets. The existing loader handles rejection, cancellation and Retry. Configure the API base URL through a Vite environment variable when needed. If aggregation moves to Spring Boot, preserve the distinct-count, inclusive Riyadh date and previous-period semantics in API contracts. No client secrets should be stored in Vite environment variables.

To inspect the error and Retry flow, open `/?demoError=1` in a fresh browser session. Retry recovers the mock service for that session. Clear `sessionStorage.retried` to reproduce. Loading follows the actual HTTP request; use browser network throttling to inspect it. An out-of-range date selection demonstrates empty states.

## Validation

`npm run build` includes strict TypeScript checks. Charts use ResizeObserver and dispose on unmount. Tables scroll horizontally on narrow screens; navigation, filters and sorting support keyboard use. Chart text alternatives summarize request totals.

## Feature Summary

`/feature-summary` is available in the sidebar. Cards render the service response with `featureCode` keys, display its `featureName`, and calculate total requests as `webCount + mobileCount`. Unknown feature codes use a generic icon and require no UI changes. The mock service groups the existing events dynamically, using optional event `featureName` metadata or a readable code-derived name. No feature list or separate counts are maintained for this page.

`FeatureSummaryService.getSummaries(filters, signal)` applies inclusive Riyadh dates, department and channel filters before aggregating distinct event IDs. Replace its implementation with a Spring Boot request, for example `GET /api/feature-summaries?start=2026-10-04&end=2026-11-02&department=ALL&channel=ALL`, forwarding the abort signal and checking `response.ok`. Return `FeatureSummary[]` using the fields `featureCode`, `featureName`, `webCount`, `mobileCount`; the page remains unchanged. The error demonstration described above also applies here. Loading, Retry and no-activity states are provided.

Feature Summary cards are keyboard-accessible links to `/feature-summary/:featureCode`. One analytics page handles every returned feature code and carries the applied filters and service-supplied name from the clicked card. Direct navigation falls back to the default filters and dataset/code-derived name. The Feature Summary return link preserves the applied detail filters. Feature analytics are reached from the summary, rather than separate sidebar items. `/leave` and `/remote-work` redirect to their dynamic detail routes for existing bookmarks.

## Code formatting

Run `npm run format` to format the entire project, or `npm run format:check` to verify formatting without edits. Prettier uses the checked-in `.prettierrc.json`; generated builds, dependencies, the lockfile and preview images are excluded.

## JSON dummy API

The app performs `GET /assets/feature-details.json` with native `fetch`. The JSON lives at `public/assets/feature-details.json`; Vite serves it directly during development and includes it in production builds. Open the URL or inspect it in the browser Network panel. No backend or request interception is involved.

Overview and feature detail pages use the details HTTP data service. Feature Summary uses its own summary HTTP service. Static JSON cannot process query parameters: the typed summary service applies date, department and channel filters after loading the response. To add a feature, update the generator with its events and run `npm run mock:generate` so both JSON assets stay consistent. When editing JSON manually, add matching events to both the details asset and the corresponding summary entry. Summary cards, overview breakdowns and dynamic detail routes support new feature codes automatically.

Run `npm run mock:generate` to regenerate the original deterministic event asset (this replaces manual JSON edits), then `npm run format`. The app validates the response and reports HTTP/network errors through the existing Retry UI. Retry issues a fresh request. To connect Spring Boot, replace the asset URL in `analyticsService.getEvents`, or replace `FeatureSummaryService.getSummaries` with a server-filtered aggregate endpoint.

## Two mock API endpoints

- `GET /assets/feature-summary.json?start=...&end=...&department=...&channel=...`: used only by Feature Summary. Returns an array of feature objects with `featureCode`, `featureName`, `webCount`, `mobileCount`, and underlying `events` for filtering the static demo response.
- `GET /assets/feature-details.json?featureCode=LEAVE`: shared by all feature detail pages. Returns event data; the service selects the requested feature. Overview uses this same endpoint without a feature code.

Both assets are generated together from the same deterministic event dataset with `npm run mock:generate`. Only these two JSON assets are used. Static hosting ignores query parameters; the services apply them locally. A future Spring Boot summary endpoint can return filtered counts without the extra demo `events` field.

## Reusable HTTP hook

`src/hooks/useHttp.ts` runs a typed asynchronous service request and returns `{ data, loading, error, retry }`. Wrap the request callback in `useCallback` with its filter/feature dependencies. Changing the callback or calling `retry()` starts a fresh request; obsolete requests and unmounted components are cancelled with `AbortController`, and stale results are ignored even if a service ignores cancellation. Transport and response validation remain in the services; analytics calculations stay outside the hook. Both Feature Summary and analytics pages use this hook.

```tsx
const request = useCallback(
  (signal: AbortSignal) => featureSummaryService.getSummaries(filters, signal),
  [filters],
);
const { data, loading, error, retry } = useHttp(request);
```

## Docker

A multi-stage `Dockerfile` builds with Node.js 22 and serves `dist/` with Nginx. The runtime image contains only the compiled frontend and Nginx. Both JSON mock APIs are bundled. Deep links work through the Nginx SPA fallback; missing JSON assets return 404 rather than HTML.

With Docker running:

```sh
docker compose up --build -d
```

Open [the dashboard](http://localhost:8080). The Compose service listens on the local machine at port 8080. Check health and stop it with:

```sh
docker compose ps
curl http://localhost:8080/health
docker compose down
```

To build and run the image without Compose:

```sh
docker build -t channel-insights-ui:local .
docker run --rm -p 127.0.0.1:8080:80 channel-insights-ui:local
```

Nginx configuration is in `docker/nginx.conf`. After changing source code or JSON assets, rebuild the image. `.dockerignore` excludes local dependencies and build output from the build context.
