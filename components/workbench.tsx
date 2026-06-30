"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  BookOpenText,
  CheckCircle2,
  CircleHelp,
  Clock,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileJson,
  Home,
  Image as ImageIcon,
  KeyRound,
  Loader2,
  Monitor,
  MousePointerClick,
  PanelRight,
  Play,
  Radio,
  ScrollText,
  Settings2,
  TerminalSquare,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDuration, summarizeAction } from "@/lib/utils";
import type { TraceReport, TraceStep } from "@/lib/trace-schema";

type Example = {
  id: string;
  label: string;
  description: string;
  url: string;
  actions: Array<Record<string, unknown>>;
  checks: Array<Record<string, unknown>>;
  expectedDiagnosis: string;
};

type ExamplesResponse = {
  examples: Example[];
};

const defaultActions = JSON.stringify(
  [
    { type: "wait", selector: ".product_pod" },
    { type: "click", selector: ".product_pod h3 a" },
    { type: "wait", milliseconds: 500 },
    { type: "click", selector: "[data-testid='export-table']" }
  ],
  null,
  2
);

const defaultChecks = JSON.stringify([{ type: "selector_exists", selector: "[data-testid='export-table']" }], null, 2);

const defaultFirecrawl = {
  waitFor: 500,
  timeout: 15000,
  mobile: false,
  proxy: "auto",
  onlyMainContent: true,
  location: {
    country: ""
  },
  profile: {
    name: ""
  }
};

const firecrawlFlameStart =
  "M603.36 416.33 C581,433 586.63,450.25 583.86,466.55 C583.19,470.47 577.75,469.25 576.54,465.71 C559.5,447 549.55,423.61 559.33,394.37 C577.25,340.75 614.25,311.25 594.16,288.45 C590.97,284.83 591.83,284.26 590.22,288.82 C572.5,339 363,338 427.98,536 C430.85,544.77 430.25,555.25 429.51,565.8 C429.28,568.95 427.08,571.32 424.17,570.12 C401.5,560.75 395.38,525.75 390.42,516.28 C389,513.58 387.5,514.5 385.67,517.95 C381.03,524.07 377.94,532.3 374.2,538.54 C336.92,600.69 343.58,664.33 368.03,714.96 C368.94,716.86 369.89,718.74 370.85,720.6 C371.93,722.68 373.05,724.75 374.19,726.79 C391.8,758.26 416.04,783.76 439.75,799.32 C442.6,801.19 446.26,798.52 445.29,795.24 C437.07,767.62 642.75,744.75 634.67,795.2 C634.12,798.62 637.29,801.28 640.2,799.38 C659.88,786.47 680.25,766.82 695.21,741.99 C696.41,740.01 697.57,737.99 698.7,735.93 C699.47,734.52 700.23,733.09 700.97,731.65 C711.2,711.65 717.8,688.75 718.09,663.65 C718.33,643.75 714.58,622.45 705.52,600.11 C703.78,595.83 700.25,616.5 684.38,613.26 C682.86,612.95 691.25,586.13 692.06,570.64 C692.44,563.26 690.67,544.7 683.23,524.06 C667.77,481.12 615.5,466.25 609.58,417.31 C609.25,414.61 605.53,414.71 603.36,416.33z";

const firecrawlFlameEnd =
  "M565.86 356.45 C565.86,356.45 575.61,343.8 575.61,343.8 C575.61,343.8 580.5,337.25 587.54,330.08 C590.75,325.75 598.25,315.51 601.2,307 C602.5,303.25 603.29,298.23 601.66,294.2 C599.75,289.5 597.81,292.24 596.09,293.82 C584.5,304.5 564.64,310.04 557.6,312.75 C534.25,321.75 520.74,324.12 503.38,333.43 C493,339 472.55,352.75 472.55,352.75 C472.55,352.75 456.17,365.53 456.17,365.53 C456.17,365.53 437.67,384.33 437.67,384.33 C437.67,384.33 422.5,403.75 417.94,425.86 C408.75,473.5 420,492 430.95,528.61 C434.5,547.5 436.13,555.3 430.81,558.78 C425.5,562.25 407.5,546.5 392.02,502.88 C281.5,654.5 410,785 439.75,799.32 C442.82,800.8 445.93,798.6 445.29,795.24 C438,757 639.75,751.5 634.67,795.2 C634.27,798.64 637.45,801.51 640.2,799.38 C677.68,770.21 748,703.5 705.8,598.01 C694,611.5 682.57,610.99 682.57,610.99 C682.57,610.99 691.19,577.81 691.51,565.5 C692.5,528 681.3,506.78 648.86,474.1 C615,440 598.75,433 601.52,410.11 C572.5,424 593,463 580.51,462.38 C574,461.25 570,458.51 566.68,453.64 C562.5,447.5 550.41,431.35 550.98,408.31 C551.25,397.25 556.58,375.81 556.58,375.81 C556.58,375.81 565.86,356.45 565.86,356.45z";

const firecrawlFlameMidA =
  "M582.73 405.08 C570.25,418.13 575,437 577.98,450.42 C578.84,454.3 571.63,453.38 568.42,449.83 C551.38,431.13 536.25,409.75 544.33,377.62 C558.11,322.79 604.5,314.5 595.78,294.58 C595.38,293.75 593.88,294.25 592.72,294.94 C558.5,313 366.25,321.5 431.98,502.5 C435.13,511.17 439.5,528.5 437.26,543.3 C436.78,546.42 434.27,548.22 431.42,546.87 C410.38,536.88 413.8,510.85 400.92,492.41 C399.5,490.38 397.88,491 396.17,494.08 C392.06,499.62 386.24,513.14 382.69,518.61 C332.18,596.46 339.54,665.51 366.08,717.22 C367.08,719.16 368.1,721.07 369.15,722.96 C370.32,725.08 371.53,727.17 372.76,729.22 C391.82,760.97 417.68,785.12 439.75,799.32 C442.62,801.17 446.26,798.52 445.29,795.24 C437.07,767.62 638,739 634.67,795.2 C634.46,798.66 637.29,801.28 640.2,799.38 C659.88,786.47 682.96,764.43 699.8,736.15 C701.14,733.89 702.45,731.59 703.71,729.25 C704.58,727.63 705.43,726 706.26,724.35 C717.69,701.53 724.73,675.29 723.11,646.94 C721.83,624.45 715.09,600.63 700.77,576.11 C698.44,572.12 690.5,601.5 674.63,598.26 C673.11,597.95 679.5,573.5 680.06,556.14 C680.3,548.75 678.25,525.75 670.23,504.81 C653.9,462.19 605.25,449.5 587.2,404.56 C586.19,402.04 584.61,403.12 582.73,405.08z";

const firecrawlFlameMidB =
  "M541.98 380.83 C541.98,380.83 540.36,379.55 540.36,379.55 C540.36,379.55 538.88,376.38 535.67,372.83 C518.63,354.13 509,354 500.45,322.12 C492.48,292.4 511.69,271.91 512.03,269.95 C512.38,268 511,266.38 507.72,267.19 C459.75,283.5 413.75,321.75 453.6,418.88 C463.21,442.29 459.88,472.38 456.76,484.31 C455.96,487.35 451.75,496.63 448.42,495.12 C443.38,491 450.13,480.25 436.79,464.91 C435.17,463.04 433.75,463.88 433.3,468.08 C429.25,501.13 395.63,524.75 385.94,536.86 C343.19,590.3 348.5,618.75 357.7,656.36 C360.72,668.7 375.31,688.53 375.31,688.53 C375.31,688.53 361.75,692 347.77,683.13 C357,742.25 410,785 439.75,799.32 C442.82,800.8 446.26,798.52 445.29,795.24 C437.07,767.62 642,732 634.67,795.2 C634.27,798.64 637.18,801.11 640.2,799.38 C677.06,778.26 706.14,743.68 721.68,703 C722.92,699.75 724.08,696.45 725.14,693.12 C725.88,690.83 726.57,688.52 727.22,686.19 C736.2,653.99 736.84,618.81 726.57,583.92 C718.42,556.26 703.42,528.77 680.27,503.11 C673.25,502.25 661.88,561.5 634.26,559.88 C627,554.5 636.25,519 630.43,494.14 C627.25,479.25 620.4,457.58 606.73,439.81 C579.75,404.75 577.5,410.63 542.58,374.93 C540.68,372.99 541.98,380.83 541.98,380.83z";

const firecrawlFlameMidC =
  "M580.86 347.2 C580.86,347.2 562.86,333.05 562.86,333.05 C562.86,333.05 552.13,327.38 547.79,324.58 C526.75,314.25 516.5,310.25 501.2,304.25 C488.56,299.29 481.75,299 472.41,295.45 C469.52,294.36 468.39,294.74 468.59,297.07 C470.25,315.75 484.75,320.5 498.85,362 C506.99,385.96 497.39,410.64 492.13,422.93 C487.88,432.88 477.3,444 477.3,444 C477.3,444 469.67,452.03 469.67,452.03 C469.67,452.03 460.67,460.83 460.67,460.83 C460.67,460.83 441.75,478.25 421.69,501.11 C393.25,532.75 382.25,556.25 385.45,603.61 C386.75,618.09 393.81,640.53 393.81,640.53 C393.81,640.53 382,650.5 356.02,620.38 C339.5,721 410,785 439.75,799.32 C442.82,800.8 445.62,798.64 445.29,795.24 C441.25,753.5 644.75,739.75 634.67,795.2 C634.05,798.61 637.28,801.27 640.2,799.38 C678.81,774.42 708.74,733.06 718.24,684.31 C719,680.41 719.63,676.47 720.12,672.48 C720.46,669.73 720.73,666.96 720.94,664.17 C723.81,625.57 713.86,583.37 685.86,541.6 C670.1,518.09 669.75,481 672.52,458.11 C633.75,465.5 624,498 614.01,494.88 C608.5,489.5 617.25,483 619.18,461.39 C621.07,440.27 622.34,425.27 616.23,402.81 C610.5,381.75 595.08,362.06 595.08,362.06 C595.08,362.06 580.86,347.2 580.86,347.2z";

const firecrawlFlameFrames = [
  firecrawlFlameStart,
  firecrawlFlameMidA,
  firecrawlFlameEnd,
  firecrawlFlameMidB,
  firecrawlFlameMidC,
  firecrawlFlameStart
].join(";");

export function Workbench() {
  const [examples, setExamples] = useState<Example[]>([]);
  const [selectedExampleId, setSelectedExampleId] = useState<string | null>("selector-missing-books");
  const [url, setUrl] = useState("https://books.toscrape.com/");
  const [actionsJson, setActionsJson] = useState(defaultActions);
  const [checksJson, setChecksJson] = useState(defaultChecks);
  const [firecrawl, setFirecrawl] = useState(defaultFirecrawl);
  const [report, setReport] = useState<TraceReport | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    fetch("/api/examples")
      .then((response) => response.json())
      .then((data: ExamplesResponse) => {
        setExamples(data.examples);
        const first = data.examples[0];
        if (first) loadExample(first, false);
      })
      .catch(() => setError("Could not load examples."));
  }, []);

  useEffect(() => {
    if (!report) return;
    setSelectedStepIndex(report.failedStepIndex ?? 0);
  }, [report]);

  const selectedStep = useMemo(() => {
    if (!report) return null;
    return report.steps.find((step) => step.index === selectedStepIndex) ?? report.steps[0] ?? null;
  }, [report, selectedStepIndex]);

  function loadExample(example: Example, clearReport = true) {
    setSelectedExampleId(example.id);
    setUrl(example.url);
    setActionsJson(JSON.stringify(example.actions, null, 2));
    setChecksJson(JSON.stringify(example.checks, null, 2));
    setError(null);
    if (clearReport) setReport(null);
  }

  function markCustom() {
    setSelectedExampleId(null);
  }

  async function runTrace() {
    setIsRunning(true);
    setError(null);
    setCopyState("idle");
    try {
      const actions = JSON.parse(actionsJson);
      const checks = JSON.parse(checksJson || "[]");
      const payload = {
        mode: "live",
        exampleId: selectedExampleId ?? undefined,
        url,
        actions,
        checks,
        firecrawl: {
          waitFor: Number(firecrawl.waitFor),
          timeout: Number(firecrawl.timeout),
          mobile: Boolean(firecrawl.mobile),
          proxy: firecrawl.proxy,
          onlyMainContent: Boolean(firecrawl.onlyMainContent),
          ...(firecrawl.location.country ? { location: { country: firecrawl.location.country.toUpperCase() } } : {}),
          ...(firecrawl.profile.name ? { profile: { name: firecrawl.profile.name } } : {})
        }
      };

      const response = await fetch("/api/traces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Trace request failed.");
      }
      setReport(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsRunning(false);
    }
  }

  async function copyReport() {
    if (!report) return;
    await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1400);
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="grid min-h-screen grid-cols-[48px_minmax(0,1fr)]">
        <aside className="flex min-h-screen flex-col items-center border-r border-[var(--border)] bg-[#060606]">
          <div className="flex h-[52px] w-full items-center justify-center border-b border-[var(--border)]">
            <FirecrawlMark />
          </div>
          <nav className="flex w-full flex-1 flex-col items-center gap-1 py-2">
            <RailButton active icon={<Home className="h-4 w-4" />} label="Dashboard" />
            <RailButton icon={<Activity className="h-4 w-4" />} label="Traces" />
            <RailButton icon={<TerminalSquare className="h-4 w-4" />} label="Runs" />
            <RailButton icon={<FileJson className="h-4 w-4" />} label="Exports" />
            <RailButton icon={<Settings2 className="h-4 w-4" />} label="Options" />
          </nav>
          <div className="w-full border-t border-[var(--border)] p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[5px] border border-[var(--border)] bg-[#101010] text-[10px] font-semibold text-orange-200">
              JR
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="flex min-h-[52px] flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] bg-[#070707] px-3 py-2">
            <button className="inline-flex h-8 items-center gap-2 rounded-[5px] border border-[var(--border)] bg-[#111] px-3 text-sm font-medium text-[var(--foreground)]">
              <span className="flex h-4 w-4 items-center justify-center rounded-[3px] bg-[var(--accent)] text-[9px] font-bold text-white">
                P
              </span>
              Personal Team
            </button>
            <div className="flex items-center gap-2">
              <TopUtility icon={<Bell className="h-4 w-4" />} label="Notifications" compact />
              <TopUtility icon={<Monitor className="h-4 w-4" />} label="Monitor" compact />
              <TopUtility icon={<CircleHelp className="h-4 w-4" />} label="Help" />
              <TopUtility icon={<BookOpenText className="h-4 w-4" />} label="Docs" />
              <Button size="sm" className="rounded-[5px] px-3">
                <KeyRound className="h-3.5 w-3.5" />
                Upgrade
              </Button>
            </div>
          </header>

          <div className="mx-auto min-h-[calc(100vh-52px)] max-w-[1220px] border-x border-[var(--border)] bg-[#070707]/92">
            <section className="border-b border-[var(--border)] px-4 py-7 sm:px-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-lg font-semibold tracking-normal text-[var(--foreground)]">Action Trace Workbench</h1>
                  <p className="mt-1 text-xs text-[var(--muted)]">Diagnose Firecrawl action failures with live step evidence.</p>
                </div>
                <div className="flex items-center gap-3">
                  <BracketTag tone="orange">Live</BracketTag>
                  {report ? <BracketTag tone={toneForStatus(report.status)}>{formatStatus(report.status)}</BracketTag> : null}
                </div>
              </div>
            </section>

            <MetricStrip report={report} isRunning={isRunning} />
            <OutcomePanel report={report} selectedStep={selectedStep} />

            <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] 2xl:grid-cols-[360px_minmax(320px,0.95fr)_minmax(360px,1.2fr)]">
              <div className={cn("border-b border-[var(--border)] xl:border-r", report ? "order-3 xl:order-1" : "order-1")}>
                <TraceSetup
                  examples={examples}
                  selectedExampleId={selectedExampleId}
                  url={url}
                  actionsJson={actionsJson}
                  checksJson={checksJson}
                  firecrawl={firecrawl}
                  isRunning={isRunning}
                  error={error}
                  onLoadExample={loadExample}
                  onUrlChange={(value) => {
                    markCustom();
                    setUrl(value);
                  }}
                  onActionsChange={(value) => {
                    markCustom();
                    setActionsJson(value);
                  }}
                  onChecksChange={(value) => {
                    markCustom();
                    setChecksJson(value);
                  }}
                  onFirecrawlChange={setFirecrawl}
                  onRun={runTrace}
                />
              </div>

              <div className={cn("border-b border-[var(--border)] 2xl:border-r", report ? "order-1 xl:order-2" : "order-2")}>
                <TimelinePanel report={report} selectedStepIndex={selectedStepIndex} onSelectStep={setSelectedStepIndex} />
              </div>

              <div className={cn("grid grid-cols-1 xl:col-span-2 2xl:col-span-1", report ? "order-2 xl:order-3" : "order-3")}>
                <CheckpointInspector step={selectedStep} report={report} />
                <DiagnosisPanel report={report} />
                <ExportPanel report={report} copyState={copyState} onCopy={copyReport} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function RailButton({ active, icon, label }: { active?: boolean; icon: React.ReactNode; label: string }) {
  return (
    <button
      title={label}
      aria-label={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-[5px] text-[var(--muted)] transition hover:bg-[#121212] hover:text-[var(--foreground)]",
        active && "bg-[var(--accent-soft)] text-[var(--accent)]"
      )}
    >
      {icon}
    </button>
  );
}

function TopUtility({ icon, label, compact }: { icon: React.ReactNode; label: string; compact?: boolean }) {
  return (
    <Button variant="secondary" size={compact ? "icon" : "sm"} className={cn("rounded-[5px]", compact ? "h-8 w-8" : "h-8 px-3")}>
      {icon}
      {compact ? <span className="sr-only">{label}</span> : <span>{label}</span>}
    </Button>
  );
}

function FirecrawlMark() {
  return (
    <svg
      aria-label="Firecrawl"
      className="h-[22px] w-[22px]"
      fill="none"
      height="600"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      viewBox="0 0 600 600"
      width="600"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <g transform=" translate(293.035, 553.013) scale(0.97724, 0.97724) translate(-533.035, -800.013)">
          <path d={firecrawlFlameStart} fill="var(--accent)" fillOpacity="1" fillRule="nonzero">
            <animate
              attributeName="d"
              attributeType="XML"
              begin="0s"
              calcMode="spline"
              dur="1.35s"
              fill="freeze"
              from={firecrawlFlameStart}
              keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1"
              keyTimes="0;0.18;0.38;0.58;0.8;1"
              repeatCount="indefinite"
              to={firecrawlFlameStart}
              values={firecrawlFlameFrames}
            />
          </path>
        </g>
        <g transform=" translate(300, 470.504) scale(0.9650799999999999, 0.9650799999999999) translate(-510.283, -685.815)">
          <path
            d="M410.06 771.87 C412.91,773.74 416.57,771.07 415.6,767.79 C407.38,740.17 411.54,708.64 427.68,684.63 C455.29,643.16 510.65,603.1 501.81,548.71 C501.24,545.26 505.31,542.99 507.87,545.36 C546.86,581 554.59,628.95 548.18,671.96 C547.63,675.7 552.32,677.69 554.68,674.76 C560.64,667.29 567.92,660.74 575.85,655.81 C577.82,654.59 580.46,655.52 581.21,657.72 C594.24,695.64 617.69,725.57 604.98,767.75 C603.97,771.07 607.6,773.83 610.51,771.93 C610.51,771.93 610.51,827.25 610.51,827.25 C610.51,827.25 410.06,827.25 410.06,827.25 C410.06,827.25 410.06,771.87 410.06,771.87z"
            fill="#060606"
            fillOpacity="1"
            fillRule="nonzero"
          />
        </g>
      </g>
    </svg>
  );
}

function MetricStrip({ report, isRunning }: { report: TraceReport | null; isRunning: boolean }) {
  const metrics = [
    {
      label: "Status",
      value: isRunning ? "Running" : report ? formatStatus(report.status) : "Ready",
      icon: isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />
    },
    {
      label: "Failed step",
      value: report?.failedStepIndex == null ? "None" : `#${report.failedStepIndex + 1}`,
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      label: "Duration",
      value: report ? formatDuration(report.durationMs) : "N/A",
      icon: <Clock className="h-4 w-4" />
    },
    {
      label: "API calls",
      value: report ? String(report.summary.firecrawlCalls) : "0",
      icon: <Radio className="h-4 w-4" />
    },
    {
      label: "Screenshots",
      value: report ? String(report.summary.screenshotsCaptured) : "0",
      icon: <ImageIcon className="h-4 w-4" />
    }
  ];

  return (
    <div className="grid grid-cols-2 border-b border-[var(--border)] bg-[#080808] md:grid-cols-5">
      {metrics.map((metric) => (
        <div key={metric.label} className="flex min-h-20 items-center justify-between border-r border-t border-[var(--border)] px-4 py-3 first:border-t-0 md:border-t-0">
          <div>
            <div className="text-[11px] font-medium text-[var(--muted)]">{metric.label}</div>
            <div className="mt-2 text-base font-semibold text-[var(--foreground)]">{metric.value}</div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-[var(--border)] bg-[#101010] text-[var(--accent)]">
            {metric.icon}
          </div>
        </div>
      ))}
    </div>
  );
}

function OutcomePanel({ report, selectedStep }: { report: TraceReport | null; selectedStep: TraceStep | null }) {
  if (!report) return null;

  const failedStep = report.failedStepIndex == null ? null : report.steps.find((step) => step.index === report.failedStepIndex);
  const actionText = failedStep ? summarizeAction(failedStep.action) : selectedStep ? summarizeAction(selectedStep.action) : "No failed action";

  return (
    <section className="border-b border-[var(--border)] bg-[#0d0907]">
      <div className="grid gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.65fr)]">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <BracketTag tone={toneForStatus(report.status)}>{formatStatus(report.status)}</BracketTag>
            <BracketTag tone="orange">Live Firecrawl</BracketTag>
            {report.diagnosis ? <BracketTag tone={toneForDiagnosis(report.diagnosis.code)}>{report.diagnosis.code}</BracketTag> : null}
            {report.liveViewUrl ? (
              <a
                href={report.liveViewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--muted-2)] hover:text-[var(--foreground)]"
              >
                Live view
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
          </div>
          <h2 className="truncate text-lg font-semibold">
            {failedStep ? `Step ${failedStep.index + 1} failed: ${actionText}` : "Trace completed"}
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted-2)]">
            {report.diagnosis?.message ?? "All planned actions and checks completed."}
          </p>
        </div>
        <div className="border border-[var(--border)] bg-[#101010] p-3">
          <div className="text-[11px] font-medium text-[var(--muted)]">Suggested Fix</div>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
            {report.diagnosis?.suggestedFix ?? "No change needed."}
          </p>
        </div>
      </div>
    </section>
  );
}

function TraceSetup(props: {
  examples: Example[];
  selectedExampleId: string | null;
  url: string;
  actionsJson: string;
  checksJson: string;
  firecrawl: typeof defaultFirecrawl;
  isRunning: boolean;
  error: string | null;
  onLoadExample: (example: Example) => void;
  onUrlChange: (value: string) => void;
  onActionsChange: (value: string) => void;
  onChecksChange: (value: string) => void;
  onFirecrawlChange: (value: typeof defaultFirecrawl) => void;
  onRun: () => void;
}) {
  return (
    <section className="h-fit bg-[#080808]">
      <div className="border-b border-[var(--border)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Trace Setup</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">Source page and action trace</p>
          </div>
          <Button data-testid="run-trace" onClick={props.onRun} disabled={props.isRunning} size="sm">
            {props.isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run
          </Button>
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <Label>Example Traces</Label>
          <div className="border border-[var(--border)]">
            {props.examples.map((example) => (
              <button
                key={example.id}
                className={cn(
                  "w-full border-b border-[var(--border)] p-3 text-left transition last:border-b-0",
                  props.selectedExampleId === example.id
                    ? "bg-[var(--accent-soft)]"
                    : "bg-[#0b0b0b] hover:bg-[#111]"
                )}
                onClick={() => props.onLoadExample(example)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{example.label}</span>
                  <BracketTag>{example.expectedDiagnosis}</BracketTag>
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{example.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">URL</Label>
          <Input id="url" value={props.url} onChange={(event) => props.onUrlChange(event.target.value)} />
        </div>

        <details className="border border-[var(--border)] bg-[#101010]">
          <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-[var(--muted-2)]">Request Payload</summary>
          <div className="space-y-3 border-t border-[var(--border)] p-3">
            <div className="space-y-2">
              <Label htmlFor="actions">Actions JSON</Label>
              <Textarea
                id="actions"
                value={props.actionsJson}
                onChange={(event) => props.onActionsChange(event.target.value)}
                spellCheck={false}
                className="h-56 resize-y font-mono text-xs leading-5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checks">Checks JSON</Label>
              <Textarea
                id="checks"
                value={props.checksJson}
                onChange={(event) => props.onChecksChange(event.target.value)}
                spellCheck={false}
                className="h-28 resize-y font-mono text-xs leading-5"
              />
            </div>
          </div>
        </details>

        <details className="border border-[var(--border)] bg-[#101010]">
          <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-[var(--muted-2)]">Firecrawl Options</summary>
          <div className="space-y-3 border-t border-[var(--border)] p-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Wait for">
                <Input
                  type="number"
                  value={props.firecrawl.waitFor}
                  onChange={(event) => props.onFirecrawlChange({ ...props.firecrawl, waitFor: Number(event.target.value) })}
                />
              </Field>
              <Field label="Timeout">
                <Input
                  type="number"
                  value={props.firecrawl.timeout}
                  onChange={(event) => props.onFirecrawlChange({ ...props.firecrawl, timeout: Number(event.target.value) })}
                />
              </Field>
              <Field label="Proxy">
                <select
                  value={props.firecrawl.proxy}
                  onChange={(event) => props.onFirecrawlChange({ ...props.firecrawl, proxy: event.target.value })}
                  className="h-9 w-full rounded-[5px] border border-[var(--border)] bg-[#101010] px-3 text-sm outline-none focus:border-orange-500/70 focus:ring-2 focus:ring-[var(--ring)]"
                >
                  <option value="auto">auto</option>
                  <option value="basic">basic</option>
                  <option value="stealth">stealth</option>
                </select>
              </Field>
              <Field label="Country">
                <Input
                  value={props.firecrawl.location.country}
                  maxLength={2}
                  onChange={(event) =>
                    props.onFirecrawlChange({
                      ...props.firecrawl,
                      location: { country: event.target.value }
                    })
                  }
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 rounded-[5px] border border-[var(--border)] bg-[#101010] px-3 py-2 text-xs text-[var(--muted-2)]">
                <input
                  type="checkbox"
                  checked={props.firecrawl.mobile}
                  onChange={(event) => props.onFirecrawlChange({ ...props.firecrawl, mobile: event.target.checked })}
                  className="accent-[var(--accent)]"
                />
                Mobile
              </label>
              <label className="flex items-center gap-2 rounded-[5px] border border-[var(--border)] bg-[#101010] px-3 py-2 text-xs text-[var(--muted-2)]">
                <input
                  type="checkbox"
                  checked={props.firecrawl.onlyMainContent}
                  onChange={(event) => props.onFirecrawlChange({ ...props.firecrawl, onlyMainContent: event.target.checked })}
                  className="accent-[var(--accent)]"
                />
                Main Content
              </label>
            </div>

            <Field label="Profile">
              <Input
                value={props.firecrawl.profile.name}
                onChange={(event) =>
                  props.onFirecrawlChange({
                    ...props.firecrawl,
                    profile: { name: event.target.value }
                  })
                }
              />
            </Field>
          </div>
        </details>

        {props.error ? (
          <div className="border border-red-500/35 bg-red-500/10 p-3 text-xs leading-5 text-red-200">
            {props.error}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function TimelinePanel({
  report,
  selectedStepIndex,
  onSelectStep
}: {
  report: TraceReport | null;
  selectedStepIndex: number;
  onSelectStep: (index: number) => void;
}) {
  return (
    <section className="min-h-[360px] bg-[#080808]">
      <div className="border-b border-[var(--border)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Action Timeline</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">{report ? `${report.summary.stepsPlanned} planned steps` : "No trace loaded"}</p>
          </div>
          {report?.diagnosis ? <BracketTag tone={toneForDiagnosis(report.diagnosis.code)}>{report.diagnosis.code}</BracketTag> : null}
        </div>
      </div>
      <div className="p-0">
        {report ? (
          <div className="divide-y divide-[var(--border)]">
            {report.steps.map((step) => (
              <button
                key={step.index}
                className={cn(
                  "grid w-full grid-cols-[34px_minmax(0,1fr)_84px] gap-3 px-4 py-3 text-left transition hover:bg-[#111]",
                  selectedStepIndex === step.index && "bg-[#141414]"
                )}
                onClick={() => onSelectStep(step.index)}
              >
                <StepIcon status={step.status} />
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-xs text-[var(--muted)]">#{step.index + 1}</span>
                    <span className="truncate text-sm font-medium">{summarizeAction(step.action)}</span>
                  </div>
                  <div className="mt-1 truncate text-xs text-[var(--muted)]">{step.url ?? step.error ?? "Pending"}</div>
                </div>
                <div className="text-right">
                  <BracketTag tone={toneForStepStatus(step.status)}>{formatStatus(step.status)}</BracketTag>
                  <div className="mt-1 text-xs text-[var(--muted)]">{formatDuration(step.durationMs)}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState icon={<MousePointerClick className="h-5 w-5" />} title="No trace loaded" />
        )}
      </div>
    </section>
  );
}

function StepIcon({ status }: { status: TraceStep["status"] }) {
  const className = "mt-0.5 h-6 w-6";
  if (status === "passed") return <CheckCircle2 className={cn(className, "text-green-400")} />;
  if (status === "failed") return <XCircle className={cn(className, "text-red-400")} />;
  if (status === "skipped") return <AlertTriangle className={cn(className, "text-yellow-400")} />;
  return <Clock className={cn(className, "text-[var(--muted)]")} />;
}

function CheckpointInspector({ step, report }: { step: TraceStep | null; report: TraceReport | null }) {
  return (
    <section className="border-b border-[var(--border)] bg-[#080808]">
      <div className="border-b border-[var(--border)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Checkpoint Inspector</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">{step ? `Step ${step.index + 1} checkpoint` : "No checkpoint selected"}</p>
          </div>
          {report ? <BracketTag tone="orange">Live</BracketTag> : null}
        </div>
      </div>
      <div className="p-4">
        {step ? (
          <Tabs defaultValue="screenshot">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="screenshot">
                <ImageIcon className="mr-1 h-3.5 w-3.5" />
                Shot
              </TabsTrigger>
              <TabsTrigger value="text">
                <ScrollText className="mr-1 h-3.5 w-3.5" />
                Text
              </TabsTrigger>
              <TabsTrigger value="raw">
                <TerminalSquare className="mr-1 h-3.5 w-3.5" />
                Raw
              </TabsTrigger>
              <TabsTrigger value="code">
                <Code2 className="mr-1 h-3.5 w-3.5" />
                Code
              </TabsTrigger>
            </TabsList>
            <TabsContent value="screenshot">
              {step.screenshotBase64 ? (
                <div className="overflow-hidden border border-[var(--border)] bg-[#101010]">
                  <img src={screenshotSrc(step.screenshotBase64)} alt="" className="aspect-[16/10] w-full object-cover" />
                </div>
              ) : (
                <EmptyState icon={<ImageIcon className="h-5 w-5" />} title="No screenshot" />
              )}
            </TabsContent>
            <TabsContent value="text">
              <CodeBlock value={step.textExcerpt || "No text excerpt captured."} />
            </TabsContent>
            <TabsContent value="raw">
              <CodeBlock value={JSON.stringify(step.raw ?? step, null, 2)} />
            </TabsContent>
            <TabsContent value="code">
              <CodeBlock value={step.generatedCode ?? "No generated code captured for this step."} />
            </TabsContent>
          </Tabs>
        ) : (
          <EmptyState icon={<PanelRight className="h-5 w-5" />} title="No trace selected" />
        )}
      </div>
    </section>
  );
}

function DiagnosisPanel({ report }: { report: TraceReport | null }) {
  const diagnosis = report?.diagnosis;
  return (
    <section className="border-b border-[var(--border)] bg-[#080808]">
      <div className="border-b border-[var(--border)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Diagnosis</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">{diagnosis ? diagnosis.message : "No failure diagnosis"}</p>
          </div>
          {diagnosis ? <BracketTag tone={toneForDiagnosis(diagnosis.code)}>{diagnosis.code}</BracketTag> : <BracketTag>Clear</BracketTag>}
        </div>
      </div>
      <div className="space-y-4 p-4">
        {diagnosis ? (
          <>
            <div className="border border-[var(--border)] bg-[#101010] p-3 text-sm leading-6 text-[var(--muted-2)]">
              {diagnosis.suggestedFix}
            </div>
            <div className="space-y-2">
              {diagnosis.evidence.map((item) => (
                <div key={item} className="flex gap-2 text-xs leading-5 text-[var(--muted)]">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            {diagnosis.relatedOptions.length ? (
              <div className="flex flex-wrap gap-2">
                {diagnosis.relatedOptions.map((option) => (
                  <code key={option} className="border border-[var(--border)] bg-[#101010] px-2 py-1 text-[11px] text-[var(--muted-2)]">
                    {option}
                  </code>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <EmptyState icon={<CheckCircle2 className="h-5 w-5" />} title="No failure found" />
        )}
        {report?.warnings.length ? (
          <div className="border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs leading-5 text-yellow-100">
            {report.warnings.join(" ")}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ExportPanel({
  report,
  copyState,
  onCopy
}: {
  report: TraceReport | null;
  copyState: "idle" | "copied";
  onCopy: () => void;
}) {
  return (
    <section className="bg-[#080808]">
      <div className="border-b border-[var(--border)] p-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Export</h2>
        <p className="mt-1 truncate text-xs text-[var(--muted)]">{report ? report.id : "No trace loaded"}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 p-4">
        <Button asChild variant="secondary" size="sm" disabled={!report}>
          <a href={report ? `/api/traces/${report.id}/export?format=json` : "#"}>
            <FileJson className="h-4 w-4" />
            JSON
          </a>
        </Button>
        <Button asChild variant="secondary" size="sm" disabled={!report}>
          <a href={report ? `/api/traces/${report.id}/export?format=markdown` : "#"}>
            <Download className="h-4 w-4" />
            MD
          </a>
        </Button>
        <Button variant="secondary" size="sm" disabled={!report} onClick={onCopy}>
          <Copy className="h-4 w-4" />
          {copyState === "copied" ? "Copied" : "Copy"}
        </Button>
      </div>
    </section>
  );
}

function CodeBlock({ value }: { value: string }) {
  return (
    <pre className="max-h-[360px] overflow-auto border border-[var(--border)] bg-[#080808] p-3 text-xs leading-5 text-[var(--muted-2)]">
      <code>{value}</code>
    </pre>
  );
}

function EmptyState({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center gap-2 border border-dashed border-[var(--border)] bg-[#0b0b0b] p-6 text-center text-sm text-[var(--muted)]">
      <div className="text-[var(--muted-2)]">{icon}</div>
      <div>{title}</div>
    </div>
  );
}

function BracketTag({
  children,
  tone = "muted"
}: {
  children: React.ReactNode;
  tone?: "muted" | "orange" | "green" | "yellow" | "red";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap font-mono text-[10px] font-semibold uppercase tracking-[0.08em]",
        tone === "orange" && "text-[var(--accent)]",
        tone === "green" && "text-green-300",
        tone === "yellow" && "text-yellow-200",
        tone === "red" && "text-red-300",
        tone === "muted" && "text-[var(--muted-2)]"
      )}
    >
      [ {children} ]
    </span>
  );
}

function formatStatus(status: TraceReport["status"] | TraceStep["status"]) {
  if (status === "passed") return "Passed";
  if (status === "failed") return "Failed";
  if (status === "partial") return "Partial";
  if (status === "invalid") return "Invalid";
  if (status === "pending") return "Pending";
  return "Skipped";
}

function toneForStatus(status: TraceReport["status"]) {
  if (status === "passed") return "green";
  if (status === "failed") return "red";
  if (status === "partial") return "yellow";
  return "muted";
}

function toneForStepStatus(status: TraceStep["status"]) {
  if (status === "passed") return "green";
  if (status === "failed") return "red";
  if (status === "skipped") return "yellow";
  return "muted";
}

function toneForDiagnosis(code: string) {
  if (code === "SELECTOR_NOT_FOUND" || code === "WAIT_TIMEOUT" || code === "NAVIGATION_CHANGED") return "red";
  if (code === "POSSIBLE_BLOCK" || code === "FIRECRAWL_ERROR") return "yellow";
  return "muted";
}

function screenshotSrc(base64: string) {
  const trimmed = base64.trim();
  const mime = trimmed.startsWith("PHN2Zy") ? "image/svg+xml" : "image/png";
  return `data:${mime};base64,${trimmed}`;
}
