import { AlertTriangle, CheckCircle2, CircleDashed, Lightbulb, XCircle } from "lucide-react";
import { useMemo } from "react";
import { buildReport, type KeywordMatch } from "@/lib/resume/ats";
import { useResume } from "@/lib/resume/store";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./fields";
import { ScoreRing } from "./ScoreRing";

export function KeywordChip({ k }: { k: KeywordMatch }) {
  const Icon = k.status === "found" ? CheckCircle2 : k.status === "partial" ? CircleDashed : XCircle;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-xs",
        k.status === "found" && "border-success/30 bg-success/10 text-success",
        k.status === "partial" && "border-warning/30 bg-warning/10 text-warning",
        k.status === "missing" && (k.relevant ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border text-muted-foreground"),
      )}
      title={k.status === "missing" && k.relevant ? "Missing, but related to your existing skills" : k.status}
    >
      <Icon className="size-3" />
      {k.keyword}
      {k.status === "missing" && k.relevant && <span className="text-[10px] uppercase opacity-80">relevant</span>}
    </span>
  );
}

export function AtsPanel() {
  const { resume } = useResume();
  const report = useMemo(() => buildReport(resume), [resume]);
  const { analysis } = report;

  if (!resume.jobDescription.trim()) {
    return (
      <>
        <SectionHeader title="ATS analysis" description="Add a job description first to see your match score." />
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">No job description yet.</div>
      </>
    );
  }

  const groups: ["required" | "preferred", string][] = [["required", "Required"], ["preferred", "Preferred"]];

  return (
    <>
      <SectionHeader title="ATS analysis" description={analysis.title} />
      <div className="grid gap-6 rounded-lg border bg-surface p-5 sm:grid-cols-[auto_1fr]">
        <ScoreRing score={report.score} />
        <div className="space-y-3">
          {report.breakdown.map((b) => (
            <div key={b.label}>
              <div className="flex justify-between text-xs">
                <span>{b.label}</span>
                <span className="font-mono text-muted-foreground">{b.score}/{b.max}</span>
              </div>
              <div className="mt-1 h-1 rounded-full bg-muted">
                <div className="h-1 rounded-full bg-primary transition-all" style={{ width: `${(b.score / b.max) * 100}%` }} />
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{b.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {groups.map(([imp, label]) => {
          const ks = analysis.keywords.filter((k) => k.importance === imp);
          if (!ks.length) return null;
          return (
            <div key={imp}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label} keywords · {ks.filter((k) => k.status === "found").length}/{ks.length}</p>
              <div className="flex flex-wrap gap-1.5">
                {[...ks].sort((a, b) => order(a) - order(b)).map((k) => <KeywordChip key={k.keyword} k={k} />)}
              </div>
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground">Green: found · Amber: partial / related wording · Red: missing but relevant to your background · Grey: missing, no related experience detected.</p>
      </div>

      <div className="mt-8">
        <p className="mb-3 flex items-center gap-2 text-sm font-medium"><Lightbulb className="size-4 text-primary" /> Suggestions</p>
        <ul className="space-y-2">
          {report.suggestions.map((s, i) => (
            <li key={i} className="flex gap-3 rounded-md border bg-surface p-3 text-sm">
              <AlertTriangle className={cn("mt-0.5 size-4 shrink-0", s.level === "high" ? "text-destructive" : s.level === "medium" ? "text-warning" : "text-muted-foreground")} />
              {s.text}
            </li>
          ))}
          {!report.suggestions.length && <li className="text-sm text-muted-foreground">Looking strong — no major issues.</li>}
        </ul>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <ListBlock title="Responsibilities" items={analysis.responsibilities} />
        <ListBlock title="Qualifications" items={analysis.qualifications} />
      </div>
    </>
  );
}

const order = (k: KeywordMatch) => (k.status === "missing" ? (k.relevant ? 0 : 3) : k.status === "partial" ? 1 : 2);

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        {items.map((x, i) => <li key={i} className="border-l-2 pl-3">{x}</li>)}
        {!items.length && <li>None detected.</li>}
      </ul>
    </div>
  );
}
