# Firecrawl Feature Map Against README Feedback

Last verified against https://www.firecrawl.dev and docs.firecrawl.dev on 2026-06-30.

## Live Firecrawl Feature Inventory

| Area | Existing feature | Notes relevant to the brief |
| --- | --- | --- |
| Search | `/v2/search` | Web search with `limit`, `sources` (`web`, `images`, `news`), optional result scraping, title/description-only defaults, query operators, domain filters, geo filters, time filters, and categories (`github`, `research`, `pdf`). |
| Research Index | `/v2/search/research/*` | Specialized AI/ML research index: search papers, read passages, find related papers, and search GitHub history. This is narrower than general web coverage. |
| Deep Research | deprecated alpha endpoint | Still documented as deprecated in favor of the Search API and no longer maintained after 2025-06-30. Do not rebuild this as the take-home target. |
| Scrape | `/v2/scrape` | Single-page extraction to markdown, summary, HTML, raw HTML, links, images, screenshot, JSON, change tracking, branding, product, menu, audio, video, question, and highlights. |
| Scrape cleanup | `onlyMainContent`, `onlyCleanContent`, include/exclude tags | Helpful for boilerplate and duplicated page chrome, but not a dedicated paragraph-level `dedupe: true` option. |
| Scrape controls | `waitFor`, `mobile`, `timeout`, headers, parsers, location, ad blocking | Covers many reliability and latency tuning cases already mentioned in the feedback. |
| Proxy controls | `proxy: basic/enhanced/auto` | `auto` retries with enhanced proxies after a basic proxy failure and bills enhanced only if that retry succeeds. BYO residential proxies are not exposed. |
| Cache controls | `maxAge`, `minAge`, `storeInCache`, `lockdown` | Existing way to trade freshness for speed, or force cache-only behavior for some workflows. |
| Actions | scrape `actions` | Supports waits, screenshots, clicks, text entry, keypresses, scrolling, scraping, JavaScript execution, and PDF generation before extraction. |
| Interact / Browser | `/v2/scrape/{scrapeId}/interact`, `/v2/interact` | Prompt or code-driven browser interaction, Playwright execution, live view, CDP URL, interactive live view, and persistent profiles. |
| Persistent profiles | `profile` on scrape/interact sessions | Saves cookies, localStorage, and session state across sessions sharing the same profile name. |
| Agent | `/v2/agent` | Autonomous web data gathering / extraction with a prompt, optional URLs, schema, max credit cap, URL constraints, and Spark model choice. |
| Crawl | `/v2/crawl` | Bulk site extraction with include/exclude paths, discovery depth, sitemap use, limits, subdomain/external-link settings, concurrency, delay, scrape options, status, and errors. |
| Map | `/v2/map` | Fast URL discovery for a domain, with sitemap use, subdomains, query-parameter handling, relevance search, and high limits. |
| Batch scrape | `/v2/batch/scrape` | Async multi-URL scraping with concurrency, status, pagination, invalid URL handling, and error retrieval. |
| Parse / documents | `/v2/parse`, document parsers | Upload or scrape documents and convert PDF, Word, Excel, and similar files into LLM-ready formats. |
| Monitoring | `/v2/monitor` | Scheduled scrape/crawl monitors, markdown diffs, JSON field change tracking, retention, webhook and email notifications. |
| Debugging support | `/v2/support/ask`, `/v2/support/docs-search` | AI support agent for job/account/API diagnosis plus docs-grounded answers with citations. Helps debugging, but does not replace product-level traceability. |
| Webhooks | crawl, batch scrape, monitor events | Existing event delivery for long-running jobs and recurring monitors. |
| Account / ops | activity, credit usage, token usage, queue status | Useful for usage visibility, credit analysis, and diagnosing slow or queued workloads. |
| Agent tooling | CLI, MCP, SDKs, skills, workflows | Firecrawl can be installed as an agent tool for search, scrape, interact, crawl, map, extract, and agent jobs. |
| Use-case packaging | deep research, AI chats, agent tools, onboarding, lead enrichment, competitive intelligence, price monitoring, RAG | Mostly examples/workflows built from the core primitives above. |

## README Feedback Mapping

| # | Customer ask | Existing Firecrawl feature that applies | Already exists? | Gap / product read |
| --- | --- | --- | --- | --- |
| 1 | Coverage-first search that finds trade pubs, regional press, niche forums, and non-obvious sources; slower is fine. | Search API, query operators, `limit`, `sources`, `categories` (`pdf`, `research`, `github`), geo/time/domain filters, batchable calls, deprecated Deep Research. | Partial | The primitives exist, but there is no general "thorough coverage" mode, source-lane coverage report, or completeness-oriented ranking. Strong build target. |
| 2 | BYO residential proxies for protected retail domain failures. | `proxy: basic/enhanced/auto`, `location`, `waitFor`, `mobile`, timeouts, headers. | Mostly existing for the reliability need; BYO proxy itself does not exist. | The customer pinned `basic`; `auto` or `enhanced` is the existing answer to try first. BYO proxy plumbing is a separate enterprise/control feature. |
| 3 | `dedupe: true` for repeated markdown blocks. | `onlyMainContent` default, `onlyCleanContent` beta, include/exclude tags. | Partial | Cleanup exists, exact paragraph/block dedupe does not. This is a small native scrape-format improvement, but lower revenue signal. |
| 4 | Fast search mode: 3 results, snippets only, no full page content. | Search defaults to URL/title/description when `scrapeOptions` is omitted; `limit` can be set to 3; news results include snippets. | Yes | This is already shipped. The customer likely needs to omit `scrapeOptions` and set `limit: 3`. Do not build this as a new product. |
| 5 | Intent-aware search reranking for news, buying research, credibility, comparison intent. | Search filters/operators/categories, `sources`, `tbs`, geo/domain filters; Research Index has research-specific ranking surfaces. | Partial | General web search does not expose an intent/rerank parameter. Can be composed client-side, but a native search ranking mode remains a gap. |
| 6 | "Understand any website" assistant with answers and sources. | Search, scrape, crawl, map, agent, interact, parse, workflow skills, AI-chat / RAG / knowledge-base use cases. | Partial / broad existing primitives | Firecrawl has the ingestion and web-data primitives. A full enterprise assistant, especially with intranet/auth/permissions, is not one shipped feature. |
| 7 | Action-step debugging: tell which step failed and show the page. | Scrape `actions`, action screenshots if requested, Interact live view, Playwright stdout/stderr/error, support `/ask`, batch/crawl error endpoints. | Partial | Debugging helpers exist, but not automatic per-action trace, failed step index, and failure screenshot for long scrape action arrays. Strong support-load target. |
| 8 | Faster tail latency or upfront slow-page prediction. | `timeout`, `maxAge` caching, `minAge` cache-only, batch async status, queue status, webhooks. | Partial | Controls and workarounds exist, but not p99 improvement or slow-page prediction. Mostly infrastructure/product reliability work. |
| 9 | Managed extractors / self-healing collectors for 40+ extraction jobs. | JSON extraction formats, Agent, Monitoring, JSON-mode change tracking, scheduled checks, webhook/email alerts. | Partial | Monitoring/change detection exists and directly addresses stale-data detection. Self-healing extractor maintenance does not. |
| 10 | LinkedIn profiles/company pages/headcount/job changes as structured JSON at scale. | Lead-enrichment use case, scrape/search/agent primitives, proxy modes. | No exact feature | Generic web extraction exists, but LinkedIn-at-scale is not an existing Firecrawl feature and is operationally/compliance risky. |
| 11 | Authenticated vendor portal automation with session persistence, credential handling, and mid-run login failure behavior. | Interact sessions, Playwright/code execution, live view, persistent profiles, headers/cookies, scrape actions, support `/ask`. | Partial | Session persistence and browser automation already exist. Secure credential vaulting and first-class login failure semantics are still gaps. |

## Support Ticket Category Mapping

| Ticket category | 90d count | Related feedback | Existing features that apply | What remains unsolved |
| --- | ---: | --- | --- | --- |
| error confusion / debugging help | 214 | #7, #8, #11 | `/support/ask`, docs search, live view, Playwright stderr/error, crawl/batch error endpoints, action screenshots when requested. | Automatic step-level action traces, failure screenshots, clearer selector/wait diagnostics. |
| scrape failures on protected sites | 96 | #2, #10, #11 | `proxy: auto/enhanced`, location proxies, headers/cookies, mobile, waitFor, timeout, Interact. | BYO proxies, protected-site-specific reliability, LinkedIn-scale access, captcha/session recovery. |
| latency complaints | 41 | #4, #8 | Search metadata-only default, `limit`, cache controls, timeouts, async batch jobs, webhooks, queue status. | Tail-latency reduction and slow-page prediction. |
| search relevance / result count | 38 | #1, #5, #4 | Search `limit`, operators, categories, geo/time/domain filters, optional scraping, Research Index. | Coverage-first source discovery and intent-aware general-web reranking. |
| monitoring / change detection | 33 | #9 | Monitoring, markdown diffs, JSON-mode change tracking, scheduled scrape/crawl, webhooks/email. | Self-healing managed extractors and drift repair. |
| pdf parsing issues | 27 | #1, #9 | Search `pdf` category, scrape/parse PDF parsers, document parsing. | PDF-specific quality issues depending on source docs. |
| sdk bugs | 22 | General | Official SDKs, CLI, MCP. | SDK quality work, not directly one README item. |
| billing / credits | 19 | #2, #4, #8 | credit usage endpoints, proxy billing behavior, metadata-only search, cache controls. | Better cost explainability for enhanced proxy retries and long-running workflows. |
| docs gaps | 14 | General | Docs search, support ask, agent onboarding docs. | Better task-specific examples and migration guidance. |

## Existing-Feature Calls That Matter Most

1. Feedback #4 is already solved by Search: set `limit: 3` and omit `scrapeOptions` to get title/description URLs instead of full page content.
2. Feedback #2 should first use `proxy: "auto"` or `proxy: "enhanced"`; BYO residential proxy support is not the current product path.
3. Feedback #11 already has the core browser/session primitive via Interact plus persistent profiles, though secure credential handling remains unsolved.
4. Feedback #9 already has monitoring and JSON change tracking for detecting drift, but not self-healing extractor ownership.
5. Feedback #1 and #5 are not solved by one existing feature; they are best treated as a workflow layer on top of Search/Scrape rather than as a rebuild of deprecated Deep Research.

## Sources

- Firecrawl homepage: https://www.firecrawl.dev
- Firecrawl Search API: https://docs.firecrawl.dev/api-reference/endpoint/search
- Firecrawl Scrape API: https://docs.firecrawl.dev/api-reference/endpoint/scrape
- Firecrawl Interact guide: https://docs.firecrawl.dev/features/interact
- Firecrawl Interact session API: https://docs.firecrawl.dev/api-reference/endpoint/browser-create
- Firecrawl Agent API: https://docs.firecrawl.dev/api-reference/endpoint/agent
- Firecrawl Crawl API: https://docs.firecrawl.dev/api-reference/endpoint/crawl-post
- Firecrawl Map API: https://docs.firecrawl.dev/api-reference/endpoint/map
- Firecrawl Parse API: https://docs.firecrawl.dev/api-reference/endpoint/parse
- Firecrawl Monitoring guide: https://docs.firecrawl.dev/features/monitoring
- Firecrawl Research Index: https://docs.firecrawl.dev/features/research
- Firecrawl Deep Research alpha/deprecation note: https://docs.firecrawl.dev/features/alpha/deep-research
- Firecrawl Support Ask API: https://docs.firecrawl.dev/api-reference/endpoint/ask
