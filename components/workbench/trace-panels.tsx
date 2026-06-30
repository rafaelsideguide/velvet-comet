import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  Clock,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileJson,
  Image as ImageIcon,
  Loader2,
  MousePointerClick,
  PanelRight,
  Radio,
  ScrollText,
  TerminalSquare,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BracketTag,
  CodeBlock,
  EmptyState,
  formatStatus,
  screenshotSrc,
  toneForDiagnosis,
  toneForStatus,
  toneForStepStatus,
} from "@/components/workbench/primitives";
import { cn, formatDuration, summarizeAction } from "@/lib/utils";
import type { TraceReport, TraceStep } from "@/lib/trace-schema";

export function MetricStrip({
  report,
  isRunning,
}: {
  report: TraceReport | null;
  isRunning: boolean;
}) {
  const metrics = [
    {
      label: "Status",
      value: isRunning
        ? "Running"
        : report
          ? formatStatus(report.status)
          : "Ready",
      icon: isRunning ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Activity className="h-4 w-4" />
      ),
    },
    {
      label: "Failed step",
      value:
        report?.failedStepIndex == null
          ? "None"
          : `#${report.failedStepIndex + 1}`,
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    {
      label: "Duration",
      value: report ? formatDuration(report.durationMs) : "N/A",
      icon: <Clock className="h-4 w-4" />,
    },
    {
      label: "API calls",
      value: report ? String(report.summary.firecrawlCalls) : "0",
      icon: <Radio className="h-4 w-4" />,
    },
    {
      label: "Screenshots",
      value: report ? String(report.summary.screenshotsCaptured) : "0",
      icon: <ImageIcon className="h-4 w-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 border-b border-[var(--border)] bg-[#080808] md:grid-cols-5">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="flex min-h-20 items-center justify-between border-r border-t border-[var(--border)] px-4 py-3 first:border-t-0 md:border-t-0"
        >
          <div>
            <div className="text-[11px] font-medium text-[var(--muted)]">
              {metric.label}
            </div>
            <div className="mt-2 text-base font-semibold text-[var(--foreground)]">
              {metric.value}
            </div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-[var(--border)] bg-[#101010] text-[var(--accent)]">
            {metric.icon}
          </div>
        </div>
      ))}
    </div>
  );
}

export function OutcomePanel({
  report,
  selectedStep,
}: {
  report: TraceReport | null;
  selectedStep: TraceStep | null;
}) {
  if (!report) return null;

  const failedStep =
    report.failedStepIndex == null
      ? null
      : report.steps.find((step) => step.index === report.failedStepIndex);
  const actionText = failedStep
    ? summarizeAction(failedStep.action)
    : selectedStep
      ? summarizeAction(selectedStep.action)
      : "No failed action";

  return (
    <section className="border-b border-[var(--border)] bg-[#0d0907]">
      <div className="grid gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.65fr)]">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <BracketTag tone={toneForStatus(report.status)}>
              {formatStatus(report.status)}
            </BracketTag>
            <BracketTag tone="orange">
              {report.mode === "recorded" ? "Recorded Trace" : "Live Firecrawl"}
            </BracketTag>
            {report.diagnosis ? (
              <BracketTag tone={toneForDiagnosis(report.diagnosis.code)}>
                {report.diagnosis.code}
              </BracketTag>
            ) : null}
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
            {failedStep
              ? `Step ${failedStep.index + 1} failed: ${actionText}`
              : "Trace completed"}
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted-2)]">
            {report.diagnosis?.message ??
              "All planned actions and checks completed."}
          </p>
        </div>
        <div className="border border-[var(--border)] bg-[#101010] p-3">
          <div className="text-[11px] font-medium text-[var(--muted)]">
            Suggested Fix
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
            {report.diagnosis?.suggestedFix ?? "No change needed."}
          </p>
        </div>
      </div>
    </section>
  );
}

export function BeforeAfterPanel({ report }: { report: TraceReport | null }) {
  if (!report) return null;
  const failedStep =
    report.failedStepIndex == null
      ? null
      : report.steps.find((step) => step.index === report.failedStepIndex);
  const failedStepLabel = failedStep
    ? `Step ${failedStep.index + 1}`
    : "No failed step";
  const diagnosis = report.diagnosis?.code ?? "CLEAR";

  return (
    <section className="grid border-b border-[var(--border)] bg-[#080808] lg:grid-cols-2">
      <div className="border-b border-[var(--border)] p-4 lg:border-b-0 lg:border-r">
        <div className="mb-2 flex items-center gap-2">
          <BracketTag tone="yellow">Before</BracketTag>
          <span className="text-xs text-[var(--muted)]">
            Native failure surface
          </span>
        </div>
        <div className="text-sm font-semibold text-[var(--foreground)]">
          SCRAPE_FAILED
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
          One run-level error after {report.actions.length} actions, with no
          built-in checkpoint trail.
        </p>
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <BracketTag tone={report.status === "failed" ? "red" : "green"}>
            After
          </BracketTag>
          <span className="text-xs text-[var(--muted)]">
            Action Trace evidence
          </span>
        </div>
        <div className="text-sm font-semibold text-[var(--foreground)]">
          {failedStepLabel}: {diagnosis}
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
          Timeline, screenshot, parsed selector counts, raw response, and
          support-ready export are attached to the failure.
        </p>
      </div>
    </section>
  );
}

export function TraceFidelityPanel({ report }: { report: TraceReport | null }) {
  if (!report) return null;
  const costText =
    report.mode === "recorded"
      ? "Recorded fixture. Live run uses the same prefix-replay plan."
      : `${report.summary.firecrawlCalls} Firecrawl scrape calls for ${report.summary.stepsPlanned} planned actions.`;

  return (
    <section className="grid border-b border-[var(--border)] bg-[#0a0a0a] md:grid-cols-3">
      <TraceNote label="Trace Cost" value={costText} />
      <TraceNote
        label="Fidelity"
        value="Prototype uses prefix replay; production should instrument Firecrawl's runner-native step events."
      />
      <TraceNote
        label="Sharing"
        value="Redacted export removes screenshots, raw payloads, live URLs, and likely secrets before support handoff."
      />
    </section>
  );
}

export function TimelinePanel({
  report,
  selectedStepIndex,
  onSelectStep,
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
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Action Timeline
            </h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {report
                ? `${report.summary.stepsPlanned} planned steps`
                : "No trace loaded"}
            </p>
          </div>
          {report?.diagnosis ? (
            <BracketTag tone={toneForDiagnosis(report.diagnosis.code)}>
              {report.diagnosis.code}
            </BracketTag>
          ) : null}
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
                  selectedStepIndex === step.index && "bg-[#141414]",
                )}
                onClick={() => onSelectStep(step.index)}
              >
                <StepIcon status={step.status} />
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-xs text-[var(--muted)]">
                      #{step.index + 1}
                    </span>
                    <span className="truncate text-sm font-medium">
                      {summarizeAction(step.action)}
                    </span>
                  </div>
                  <div className="mt-1 truncate text-xs text-[var(--muted)]">
                    {step.url ?? step.error ?? "Pending"}
                  </div>
                </div>
                <div className="text-right">
                  <BracketTag tone={toneForStepStatus(step.status)}>
                    {formatStatus(step.status)}
                  </BracketTag>
                  <div className="mt-1 text-xs text-[var(--muted)]">
                    {formatDuration(step.durationMs)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<MousePointerClick className="h-5 w-5" />}
            title="No trace loaded"
          />
        )}
      </div>
    </section>
  );
}

export function CheckpointInspector({
  step,
  report,
}: {
  step: TraceStep | null;
  report: TraceReport | null;
}) {
  return (
    <section className="border-b border-[var(--border)] bg-[#080808]">
      <div className="border-b border-[var(--border)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Checkpoint Inspector
            </h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {step
                ? `Step ${step.index + 1} checkpoint`
                : "No checkpoint selected"}
            </p>
          </div>
          {report ? (
            <BracketTag tone="orange">
              {report.mode === "recorded" ? "Recorded" : "Live"}
            </BracketTag>
          ) : null}
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
                  <img
                    src={screenshotSrc(step.screenshotBase64)}
                    alt=""
                    className="aspect-[16/10] w-full object-cover"
                  />
                </div>
              ) : (
                <EmptyState
                  icon={<ImageIcon className="h-5 w-5" />}
                  title="No screenshot"
                />
              )}
            </TabsContent>
            <TabsContent value="text">
              <CodeBlock
                value={step.textExcerpt || "No text excerpt captured."}
              />
            </TabsContent>
            <TabsContent value="raw">
              <CodeBlock value={JSON.stringify(step.raw ?? step, null, 2)} />
            </TabsContent>
            <TabsContent value="code">
              <CodeBlock
                value={
                  step.generatedCode ??
                  "No generated code captured for this step."
                }
              />
            </TabsContent>
          </Tabs>
        ) : (
          <EmptyState
            icon={<PanelRight className="h-5 w-5" />}
            title="No trace selected"
          />
        )}
      </div>
    </section>
  );
}

export function DiagnosisPanel({ report }: { report: TraceReport | null }) {
  const diagnosis = report?.diagnosis;
  return (
    <section className="border-b border-[var(--border)] bg-[#080808]">
      <div className="border-b border-[var(--border)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Diagnosis
            </h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {diagnosis ? diagnosis.message : "No failure diagnosis"}
            </p>
          </div>
          {diagnosis ? (
            <BracketTag tone={toneForDiagnosis(diagnosis.code)}>
              {diagnosis.code}
            </BracketTag>
          ) : (
            <BracketTag>Clear</BracketTag>
          )}
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
                <div
                  key={item}
                  className="flex gap-2 text-xs leading-5 text-[var(--muted)]"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            {diagnosis.relatedOptions.length ? (
              <div className="flex flex-wrap gap-2">
                {diagnosis.relatedOptions.map((option) => (
                  <code
                    key={option}
                    className="border border-[var(--border)] bg-[#101010] px-2 py-1 text-[11px] text-[var(--muted-2)]"
                  >
                    {option}
                  </code>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <EmptyState
            icon={<CheckCircle2 className="h-5 w-5" />}
            title="No failure found"
          />
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

export function ExportPanel({
  report,
  copyState,
  redacted,
  onRedactedChange,
  onCopy,
}: {
  report: TraceReport | null;
  copyState: "idle" | "copied";
  redacted: boolean;
  onRedactedChange: (value: boolean) => void;
  onCopy: () => void;
}) {
  const redactedParam = redacted ? "&redacted=true" : "";

  return (
    <section className="bg-[#080808]">
      <div className="border-b border-[var(--border)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Export
            </h2>
            <p className="mt-1 truncate text-xs text-[var(--muted)]">
              {report ? report.id : "No trace loaded"}
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs text-[var(--muted-2)]">
            <input
              type="checkbox"
              checked={redacted}
              onChange={(event) => onRedactedChange(event.target.checked)}
              className="accent-[var(--accent)]"
            />
            Redacted
          </label>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
        <Button asChild variant="secondary" size="sm" disabled={!report}>
          <a
            href={
              report
                ? `/api/traces/${report.id}/export?format=json${redactedParam}`
                : "#"
            }
          >
            <FileJson className="h-4 w-4" />
            JSON
          </a>
        </Button>
        <Button asChild variant="secondary" size="sm" disabled={!report}>
          <a
            href={
              report
                ? `/api/traces/${report.id}/export?format=markdown${redactedParam}`
                : "#"
            }
          >
            <Download className="h-4 w-4" />
            MD
          </a>
        </Button>
        <Button asChild variant="secondary" size="sm" disabled={!report}>
          <a
            href={
              report
                ? `/api/traces/${report.id}/export?format=support${redactedParam}`
                : "#"
            }
          >
            <CircleHelp className="h-4 w-4" />
            Support
          </a>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!report}
          onClick={onCopy}
        >
          <Copy className="h-4 w-4" />
          {copyState === "copied" ? "Copied" : "Copy"}
        </Button>
      </div>
    </section>
  );
}

function TraceNote({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-r border-[var(--border)] p-4 last:border-r-0 md:border-b-0">
      <div className="text-[11px] font-medium text-[var(--muted)]">{label}</div>
      <p className="mt-2 text-xs leading-5 text-[var(--muted-2)]">{value}</p>
    </div>
  );
}

function StepIcon({ status }: { status: TraceStep["status"] }) {
  const className = "mt-0.5 h-6 w-6";
  if (status === "passed")
    return <CheckCircle2 className={cn(className, "text-green-400")} />;
  if (status === "failed")
    return <XCircle className={cn(className, "text-red-400")} />;
  if (status === "skipped")
    return <AlertTriangle className={cn(className, "text-yellow-400")} />;
  return <Clock className={cn(className, "text-[var(--muted)]")} />;
}
