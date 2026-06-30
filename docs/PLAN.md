# Action Trace Workbench Plan

## Summary

Build **Action Trace Workbench**: a Firecrawl-styled Next.js app that debugs long Firecrawl `actions` chains by turning one opaque failure into a step-by-step browser trace.

The product is not a general Playwright IDE, not a self-healing agent, and not a replacement for Firecrawl's scrape/interact primitives. It is a focused observability layer for Firecrawl action workflows:

- paste URL + `actions` JSON
- run the workflow step by step
- capture browser state after each step
- identify the first failed step
- show screenshot, markdown/text excerpt, URL, title, duration, and raw error
- classify the likely failure
- export a support-ready debug report

The first target is engineering teams using Firecrawl actions for dashboards, vendor portals, dynamic pages, and other workflows where content only exists after setup.

## What We Are Going To Build

Build a demo-grade Next.js workbench at the app root named **Action Trace Workbench**.

The app will include:

- Firecrawl-like dashboard shell: left nav, top utility bar, dark panels, orange primary actions, compact metric cards, and monospace code surfaces.
- Trace setup panel: URL input, action JSON editor, optional checks editor, Firecrawl option controls, and three built-in live examples.
- Trace timeline: one stable row per action with index, action type, selector/text summary, status, duration, and checkpoint availability.
- Checkpoint inspector: screenshot, text/markdown excerpt, raw event JSON, and generated Interact code for the selected step.
- Diagnosis panel: deterministic failure code, evidence bullets, suggested fix, and related Firecrawl options to try.
- Export controls: JSON and Markdown reports that support engineers or agents can read without rerunning the trace.
- Live mode: Firecrawl-backed execution when `FIRECRAWL_API_KEY` is present.

The exact product surface is **action-step observability for Firecrawl workflows**. It is not a broad browser automation editor. Users paste a Firecrawl-style action chain, run it, and get the first failed step with evidence.

## Dashboard Findings

We inspected the Firecrawl dashboard in Safari on 2026-06-30 and found adjacent features, but not this exact product.

What exists:

- **Interact Playground**: live browser sessions, prompts/code, sessions, profiles, live browser state.
- **Scrape Playground**: URL input, formats, scrape options, recent runs.
- **Activity Logs**: endpoint, URL/query, status, credits, time, CSV export.
- **Usage**: credits, recent usage, endpoint/API-key filters, browser concurrency.
- **Monitoring**: web change detection, monitors, alerts.
- **Public playground run detail**: result tabs for Markdown, HTML, Screenshot, JSON.
- **Debug issue modal**: a run-level modal on completed playground runs that reads logs and drafts a recommendation.

What does **not** exist in inspected surfaces:

- Firecrawl `actions` array input specifically for debugging.
- Step-by-step action timeline.
- First failed action index.
- Screenshot/markdown checkpoint per action.
- Selector/wait/navigation/block diagnostic categories.
- Trace confidence for replay/session mode.
- Exportable action trace report.

Positioning should be precise:

> Firecrawl already has request logs, result inspection, Interact sessions, and run-level debug assistance. The missing layer is action-step observability: a deterministic trace that shows which browser action failed, what the page looked like at that moment, and what to change next.

## Problem

Firecrawl supports browser-style actions: wait, click, write, press, scroll, screenshot, scrape, JavaScript execution, and PDF generation. That power creates a new failure mode: action arrays become long enough that a single final error no longer tells the developer what to fix.

The customer in issue #7 has action arrays up to fourteen steps. When one step fails, the whole scrape comes back as one `SCRAPE_FAILED`. Their current debugging strategy is to re-run the workflow with screenshots inserted manually until they infer where it broke.

That is expensive:

- It burns credits on blind retries.
- It increases support load.
- It slows developer iteration.
- It makes Firecrawl feel opaque on complex workflows.

The product goal:

> When an action chain fails, make the failure obvious enough that the customer knows the next edit to try.

## Product Shape

The demo exposes one working tool and one local API.

### UI

The first viewport is the workbench, not a landing page.

Layout:

- left panel: trace setup form and examples
- center panel: action-step timeline
- right panel: screenshot/markdown/raw inspector
- top metric strip: status, failed step, duration, Firecrawl calls, screenshots captured, mode

Core workflow:

1. User chooses a test example or pastes their own URL + `actions` JSON.
2. User optionally adds checks.
3. App validates the action JSON locally.
4. App starts a Firecrawl browser session.
5. App translates each action into one deterministic Interact code step.
6. App captures state after each step.
7. App stops on the first action failure or failed check.
8. App shows diagnosis and suggested fix.
9. User exports JSON or Markdown report.

### End-To-End Runtime Flow

For every trace, the server does this:

1. Parse and validate the request with local schemas.
2. Require `FIRECRAWL_API_KEY`.
3. For each action, replay the action prefix through `POST /v2/scrape`.
4. Request markdown and screenshot output for every checkpoint.
5. Stop at the first failed action or failed check.
8. Capture screenshot, URL, title, text excerpt, duration, stdout/stderr, and raw result.
9. Run post-step checks such as `selector_exists` or `url_matches`.
10. Stop at the first failed action or failed check.
11. Classify the failure deterministically.
12. Stop the Firecrawl session with `DELETE /v2/scrape/{scrapeId}/interact` in `finally`.
13. Store the report in memory or local JSON.
14. Return the report to the UI.

This flow is why the product is different from the existing dashboard: Firecrawl already exposes request logs, run results, and run-level debug help; our app turns the browser workflow itself into an inspectable timeline.

### API

The app exposes local Next.js routes:

- `POST /api/traces`: create and run a trace
- `GET /api/traces/:id`: retrieve trace report
- `GET /api/traces/:id/export?format=json|markdown`: export report
- `GET /api/examples`: list the three built-in examples

For the demo, traces can be stored in memory or local JSON files.

## Primary User

Developer, support engineer, or automation engineer debugging Firecrawl workflows for pages that need browser setup before extraction.

They need:

- failed step index
- screenshot around the failure
- browser URL/title at each step
- markdown/text excerpt at each step
- action duration
- raw stdout/stderr/error where available
- selector and wait diagnostics
- concrete next fix
- a report they can share with support or teammates

## Non-Goals

- Do not build a generic Playwright IDE.
- Do not build credential vaulting.
- Do not build automatic workflow repair.
- Do not claim to solve protected-site reliability.
- Do not hide evidence behind an opaque LLM answer.
- Do not replace the Firecrawl dashboard.
- Do not say Firecrawl has no debugging; say it lacks action-step traceability.

## Firecrawl APIs We Will Use

Verified against the Firecrawl docs on 2026-06-30.

### API Use By Phase

| Phase               | API                                                                | Why we need it                                                                                              |
| ------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Setup               | `POST https://api.firecrawl.dev/v2/scrape`                         | Load the target URL, create a browser-backed scrape context, get `scrapeId`, and capture baseline markdown. |
| Step execution      | `POST https://api.firecrawl.dev/v2/scrape/{scrapeId}/interact`     | Run one translated action at a time in the same browser session and capture per-step evidence.              |
| Cleanup             | `DELETE https://api.firecrawl.dev/v2/scrape/{scrapeId}/interact`   | Release the live browser session and avoid avoidable credit/session usage.                                  |
| Optional comparison | `POST https://api.firecrawl.dev/v2/scrape` with original `actions` | Reproduce the user's native one-shot action run for side-by-side comparison after the trace exists.         |

### 1. Create The Browser Context

Use `POST https://api.firecrawl.dev/v2/scrape`.

Purpose:

- load the URL
- create a `scrapeId` in `data.metadata.scrapeId`
- optionally attach a persistent profile
- collect baseline markdown

Request shape:

```json
{
  "url": "https://example.com",
  "formats": ["markdown"],
  "onlyMainContent": true,
  "waitFor": 500,
  "timeout": 60000,
  "mobile": false,
  "proxy": "auto",
  "storeInCache": false
}
```

Options we expose in the UI:

- `waitFor`
- `timeout`
- `mobile`
- `proxy`
- `location.country`
- `onlyMainContent`
- optional `profile.name`

### 2. Execute One Action At A Time

Use `POST https://api.firecrawl.dev/v2/scrape/{scrapeId}/interact`.

Purpose:

- run one translated action in the same browser session
- preserve page state between steps
- collect stdout/stderr/exitCode
- collect `liveViewUrl` for optional visual debugging
- return a structured state snapshot after each step

Interact request shape:

```json
{
  "code": "/* generated Playwright code for one action + snapshot */",
  "language": "node",
  "timeout": 30,
  "origin": "action-trace-workbench"
}
```

Each generated code block does three things:

1. executes exactly one action
2. captures browser state
3. returns JSON

Example generated code:

```js
const startedAt = Date.now();
await page.click(".submit");
await page.waitForLoadState("domcontentloaded").catch(() => {});
const screenshot = await page.screenshot({ fullPage: false });
const bodyText = await page.locator("body").innerText({ timeout: 5000 }).catch(() => "");
JSON.stringify({
  ok: true,
  durationMs: Date.now() - startedAt,
  url: page.url(),
  title: await page.title().catch(() => ""),
  textExcerpt: bodyText.slice(0, 1200),
  screenshotBase64: screenshot.toString("base64")
});
```

Supported MVP action translations:

| Firecrawl action           | Interact/Playwright translation                                  |
| -------------------------- | ---------------------------------------------------------------- |
| `wait` with `milliseconds` | `await page.waitForTimeout(milliseconds)`                        |
| `wait` with `selector`     | `await page.waitForSelector(selector, { timeout })`              |
| `click`                    | `await page.click(selector)`                                     |
| `write`                    | `await page.keyboard.type(text)`                                 |
| `press`                    | `await page.keyboard.press(key)`                                 |
| `scroll`                   | `await page.evaluate(...)` or `locator.scrollIntoViewIfNeeded()` |
| `screenshot`               | `await page.screenshot(...)`                                     |
| `executeJavascript`        | `await page.evaluate(...)` when the input is safe to serialize   |

Unsupported MVP actions are rejected before running with `UNSUPPORTED_ACTION`.

### 3. Stop The Session

Use `DELETE https://api.firecrawl.dev/v2/scrape/{scrapeId}/interact`.

Purpose:

- release browser resources
- avoid unnecessary session billing
- save profile changes only if the user explicitly configured a writable profile

The server must call this in `finally` after trace completion or failure.

### 4. Native Actions Reproduction

Optional diagnostic button, not required for first demo:

Use `POST /v2/scrape` with the original `actions` array once.

Purpose:

- compare our step trace against the native one-shot `actions` behavior
- show raw Firecrawl failure if native actions fail differently from Interact code mode

This is useful because Firecrawl docs still support `actions`, but recommend Interact for complex interactions. Our app debugs the user's `actions` array by translating it into an inspectable continuous session.

## Internal Architecture

```text
Next.js UI
  |
  | POST /api/traces
  v
Trace Controller
  |
  +-- validate request
  +-- create live trace record
  +-- create trace record
  v
Trace Runner
  |
  +-- POST /v2/scrape -> scrapeId
  +-- for each action:
  |     +-- translate action to Playwright code
  |     +-- POST /v2/scrape/{scrapeId}/interact
  |     +-- parse returned JSON snapshot
  |     +-- run checks
  |     +-- stop if failed
  +-- DELETE /v2/scrape/{scrapeId}/interact
  v
Trace Analyzer
  |
  +-- classify failure
  +-- generate evidence
  +-- suggest fix
  v
Trace Report
```

### Modules

`lib/trace-schema.ts`

- Zod schemas for trace request, action subset, checks, and report.

`lib/action-translator.ts`

- Converts Firecrawl action objects into Playwright code snippets.
- Escapes selectors/text safely.
- Rejects unsupported action shapes.

`lib/firecrawl-trace-client.ts`

- Thin fetch wrapper around:
  - `POST /v2/scrape`
  - `POST /v2/scrape/{scrapeId}/interact`
  - `DELETE /v2/scrape/{scrapeId}/interact`
- Handles auth, retries, timeouts, and JSON parsing.

`lib/trace-runner.ts`

- Executes the trace.
- Tracks durations, step status, screenshots, text excerpts, raw errors.
- Always stops the Firecrawl interaction session.

`lib/trace-analyzer.ts`

- Classifies failures.
- Produces evidence and suggested fixes.

`lib/examples.ts`

- Three built-in test examples.
- Three built-in live examples.

`app/api/traces/route.ts`

- Creates/runs traces.

`app/api/traces/[id]/route.ts`

- Returns stored trace.

`app/api/traces/[id]/export/route.ts`

- JSON/Markdown export.

## Diagnosis Rules

The MVP uses deterministic rules. No LLM is required for core diagnosis.

| Code                 | Detection                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `SELECTOR_NOT_FOUND` | Playwright/Interact error mentions missing selector, strict mode, timeout waiting for selector, or action has selector that never appears. |
| `WAIT_TIMEOUT`       | wait action or check times out.                                                                                                            |
| `NAVIGATION_CHANGED` | URL changes unexpectedly or `url_matches` check fails after click/press.                                                                   |
| `EMPTY_EXTRACTION`   | actions pass but body text/markdown is empty or below configured threshold.                                                                |
| `POSSIBLE_BLOCK`     | page text/error includes captcha, access denied, forbidden, bot check, login required, blocked, or unusual challenge content.              |
| `JAVASCRIPT_ERROR`   | generated/translated JavaScript throws.                                                                                                    |
| `UNSUPPORTED_ACTION` | local validation rejects action shape before live run.                                                                                     |
| `FIRECRAWL_ERROR`    | upstream failure that cannot be narrowed.                                                                                                  |

Each diagnosis includes:

- message
- evidence bullets
- suggested fix
- related Firecrawl options to try

## UI Design Direction

Mirror the Firecrawl dashboard rather than inventing a separate product brand.

Observed style:

- near-black app shell
- left sidebar
- top team/utility bar
- thin grid-like background lines
- dark bordered panels
- compact cards/tables
- Firecrawl orange primary buttons and active states
- green completed statuses
- muted gray helper text
- monospace snippets for code, selectors, URLs

Implementation direction:

```css
--background: #050505;
--panel: #0b0b0b;
--panel-2: #111111;
--border: #242424;
--muted: #8a8a8a;
--foreground: #f4f4f4;
--accent: #ff4d00;
--accent-soft: rgba(255, 77, 0, 0.12);
--success: #22c55e;
--warning: #f59e0b;
--danger: #ef4444;
```

Required UI components:

- trace form
- examples picker
- status metric strip
- step timeline
- checkpoint inspector tabs:
  - Screenshot
  - Text
  - Raw
  - Code
- diagnosis panel
- export controls
- live mode badge

Do not include marketing hero copy. This should feel like a Firecrawl operator tool.

## API Contract

### Create Trace

`POST /api/traces`

```json
{
  "mode": "live",
  "exampleId": "selector-missing-books",
  "url": "https://books.toscrape.com/",
  "actions": [
    { "type": "wait", "selector": ".product_pod" },
    { "type": "click", "selector": ".product_pod h3 a" },
    { "type": "wait", "milliseconds": 500 },
    { "type": "click", "selector": "[data-testid='export-table']" }
  ],
  "checks": [
    { "type": "selector_exists", "selector": "[data-testid='export-table']" }
  ],
  "firecrawl": {
    "waitFor": 500,
    "timeout": 60000,
    "mobile": false,
    "proxy": "auto",
    "onlyMainContent": true
  }
}
```

Response:

```json
{
  "id": "trace_01JZX8RK6QK9W94H8G4H9NP8QS",
  "status": "failed",
  "mode": "live",
  "failedStepIndex": 3,
  "durationMs": 12420,
  "diagnosis": {
    "code": "SELECTOR_NOT_FOUND",
    "message": "Step 4 tried to click `[data-testid='export-table']`, but that selector never appeared.",
    "suggestedFix": "Update the selector or add a wait for the UI state that creates the export button."
  }
}
```

### Trace Report Shape

```json
{
  "id": "trace_01JZX8RK6QK9W94H8G4H9NP8QS",
  "status": "failed",
  "mode": "live",
  "url": "https://books.toscrape.com/",
  "createdAt": "2026-06-30T00:00:00.000Z",
  "completedAt": "2026-06-30T00:00:12.420Z",
  "durationMs": 12420,
  "scrapeId": "scrape_...",
  "liveViewUrl": "https://liveview.firecrawl.dev/...",
  "failedStepIndex": 3,
  "summary": {
    "stepsPlanned": 4,
    "stepsCompleted": 3,
    "firecrawlCalls": 5,
    "screenshotsCaptured": 4
  },
  "diagnosis": {
    "code": "SELECTOR_NOT_FOUND",
    "message": "Step 4 tried to click `[data-testid='export-table']`, but that selector never appeared.",
    "evidence": [
      "Previous step URL was https://books.toscrape.com/catalogue/...",
      "Text excerpt did not include export controls.",
      "The click action timed out waiting for the selector."
    ],
    "suggestedFix": "Update the selector or add a wait for the UI state that creates the export button."
  },
  "steps": [
    {
      "index": 0,
      "action": { "type": "wait", "selector": ".product_pod" },
      "status": "passed",
      "durationMs": 612,
      "url": "https://books.toscrape.com/",
      "title": "All products | Books to Scrape - Sandbox",
      "textExcerpt": "Books to Scrape We love being scraped...",
      "screenshotBase64": "..."
    }
  ]
}
```

## Three Test Examples

Agents should be able to test all three examples live with `FIRECRAWL_API_KEY` configured.

Agent test instructions:

- `GET /api/examples` returns the available example IDs and payloads.
- `POST /api/traces` uses the selected example payload against Firecrawl.
- Each example should produce a meaningful diagnosis from live Firecrawl evidence.

### 1. Selector Missing After Valid Setup

Purpose:

- proves first failed action index
- proves selector diagnosis
- starts with valid setup steps before failing

```json
{
  "id": "selector-missing-books",
  "label": "Missing selector after product navigation",
  "url": "https://books.toscrape.com/",
  "actions": [
    { "type": "wait", "selector": ".product_pod" },
    { "type": "click", "selector": ".product_pod h3 a" },
    { "type": "wait", "milliseconds": 500 },
    { "type": "click", "selector": "[data-testid='export-table']" }
  ],
  "checks": [
    { "type": "selector_exists", "selector": "[data-testid='export-table']" }
  ],
  "expectedDiagnosis": "SELECTOR_NOT_FOUND"
}
```

Expected UI:

- steps 1-3 pass
- step 4 fails
- screenshot shows product/detail page, not export UI
- diagnosis suggests selector update or missing UI state

### 2. Unexpected Navigation

Purpose:

- proves URL-state checks
- shows a valid click can still break the intended workflow

```json
{
  "id": "navigation-changed-example",
  "label": "Click navigates away from expected page",
  "url": "https://example.com/",
  "actions": [
    { "type": "wait", "milliseconds": 500 },
    { "type": "click", "selector": "a" },
    { "type": "wait", "milliseconds": 500 }
  ],
  "checks": [
    { "type": "url_matches", "pattern": "^https://example\\.com/?$" }
  ],
  "expectedDiagnosis": "NAVIGATION_CHANGED"
}
```

Expected UI:

- click step passes
- post-step URL no longer matches expected pattern
- diagnosis says the click navigated away and suggests adding a URL assertion or changing selector

### 3. Wait Timeout

Purpose:

- proves wait/timeout diagnosis
- simplest reproducible failure

```json
{
  "id": "wait-timeout-example",
  "label": "Waits for a dashboard selector that never appears",
  "url": "https://example.com/",
  "actions": [
    { "type": "wait", "selector": "#dashboard-ready" }
  ],
  "checks": [
    { "type": "selector_exists", "selector": "#dashboard-ready" }
  ],
  "expectedDiagnosis": "WAIT_TIMEOUT"
}
```

Expected UI:

- step 1 fails
- screenshot/text show the normal Example Domain page
- diagnosis says the selector never appeared and suggests a real selector or a different readiness condition

## Failure Handling

Behavior:

- Missing API key:
  - return a clear `FIRECRAWL_ERROR`
  - show that live tracing requires `FIRECRAWL_API_KEY`
  - do not crash the app
- Invalid action JSON:
  - reject before any Firecrawl call
  - show field-level error
- Unsupported action:
  - reject before live run
  - show `UNSUPPORTED_ACTION`
- Firecrawl scrape setup fails:
  - show `FIRECRAWL_ERROR`
  - include raw status/message where safe
- Interact action fails:
  - stop at that step
  - capture raw stderr/result when available
  - classify failure
- Session cleanup fails:
  - warn in report
  - do not hide the primary diagnosis

Status rules:

- `passed`: all actions and checks completed
- `failed`: first failed action or check identified
- `partial`: trace has useful evidence but cleanup or snapshot capture was incomplete
- `invalid`: request failed validation before execution

## Gotchas

- Translating Firecrawl `actions` into Playwright code may not perfectly match the native one-shot action runner. The UI should label live mode as "Interact trace" and optionally provide a native one-shot comparison later.
- Interact sessions cost credits per minute. Always stop the session.
- Screenshots and text excerpts can contain sensitive data. Do not log them server-side beyond the local trace store.
- `write` requires focus. The app should warn when a `write` action is not preceded by a click/focus-like step.
- Some selectors exist but are hidden or covered. Diagnosis should say "likely" and show raw evidence.
- Captchas/login walls can masquerade as empty extraction. Use `POSSIBLE_BLOCK` when evidence is ambiguous.
- Public test pages can change. The app should surface raw evidence when live examples drift.

## Success Metrics

Demo metrics:

- all three built-in examples run live with a Firecrawl key
- failed step index is visible within one second after trace completion
- export includes action array, failed step, evidence, and suggested fix
- UI visually matches Firecrawl dashboard style

Product metrics:

- reduction in `error confusion / debugging help` tickets
- reduction in support resolution time for action-chain failures
- repeat trace usage by accounts with complex workflows
- increase in successful reruns after trace suggestions

## Demo Scope

Build:

- Next.js app with Firecrawl-like dark UI
- local `/api/traces` routes
- live mode with three examples
- live mode using Firecrawl scrape prefix replay
- deterministic action translator
- deterministic trace analyzer
- timeline, screenshot/text/raw inspector
- JSON and Markdown export

Do not build:

- team auth
- durable database
- background queue
- native Firecrawl runner instrumentation
- automatic action repair
- arbitrary Playwright editor

The demo should be judged by whether it turns a failing action workflow into a clear, evidence-backed debug artifact.
