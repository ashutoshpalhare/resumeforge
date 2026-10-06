import { ArrowRight, Check, ShieldCheck, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { buildReport } from "@/lib/resume/ats";
import { applyProposal, proposals } from "@/lib/resume/rewrite";
import { useResume } from "@/lib/resume/store";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./fields";
import { scoreTone } from "./ScoreRing";

export function OptimizePanel() {
  const { resume, update, baseline, setBaseline } = useResume();
  const items = useMemo(() => proposals(resume), [resume]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const visible = items.filter((p) => !dismissed.includes(p.id + p.after));
  const now = useMemo(() => buildReport(resume).score, [resume]);
  const before = useMemo(() => (baseline ? buildReport({ ...baseline, jobDescription: resume.jobDescription }).score : null), [baseline, resume.jobDescription]);

  const applyAll = () => {
    if (!baseline) setBaseline();
    update((r) => visible.reduce((acc, p) => applyProposal(acc, p), r));
  };

  return (
    <>
      <SectionHeader title="Optimization" description="Rewrites only rephrase what you wrote. Nothing new is invented — no skills, employers, dates or metrics." />

      <div className="mb-6 flex flex-wrap items-center gap-6 rounded-lg border bg-surface p-5">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Before</p>
          <p className={cn("font-mono text-3xl tabular-nums", before !== null ? scoreTone(before) : "text-muted-foreground")}>{before ?? "—"}</p>
        </div>
        <ArrowRight className="size-5 text-muted-foreground" />
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Now</p>
          <p className={cn("font-mono text-3xl tabular-nums", scoreTone(now))}>{now}</p>
        </div>
        {before !== null && (
          <span className={cn("rounded-md px-2 py-1 font-mono text-xs", now - before >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
            {now - before >= 0 ? "+" : ""}{now - before}
          </span>
        )}
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="ghost" onClick={setBaseline}>{baseline ? "Reset baseline" : "Save baseline"}</Button>
          <Button size="sm" onClick={applyAll} disabled={!visible.length}><Sparkles className="size-3.5" /> Apply all ({visible.length})</Button>
        </div>
      </div>

      <p className="mb-4 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-3.5 text-primary" /> Review each change. Add missing keywords yourself only where they truthfully describe your experience.</p>

      <div className="space-y-3">
        {visible.map((p) => (
          <div key={p.id} className="rounded-lg border bg-surface p-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground">{p.label}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-md bg-destructive/5 p-3 text-sm text-muted-foreground line-through decoration-destructive/40">{p.before || <em>empty</em>}</div>
              <div className="rounded-md bg-success/5 p-3 text-sm">{p.after}</div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setDismissed((d) => [...d, p.id + p.after])}>Dismiss</Button>
              <Button size="sm" variant="secondary" onClick={() => { if (!baseline) setBaseline(); update((r) => applyProposal(r, p)); }}><Check className="size-3.5" /> Apply</Button>
            </div>
          </div>
        ))}
        {!visible.length && <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">No rewrites pending. Your bullets already lead with strong verbs.</div>}
      </div>

      {baseline && <BaselineDiff />}
    </>
  );
}

function BaselineDiff() {
  const { resume, baseline } = useResume();
  if (!baseline) return null;
  const changed: { label: string; a: string; b: string }[] = [];
  if (baseline.summary !== resume.summary) changed.push({ label: "Summary", a: baseline.summary, b: resume.summary });
  resume.experience.forEach((e) => {
    const old = baseline.experience.find((x) => x.id === e.id);
    e.bullets.forEach((b, i) => {
      const o = old?.bullets[i];
      if (o !== undefined && o !== b) changed.push({ label: `${e.role} · bullet ${i + 1}`, a: o, b });
    });
  });
  if (!changed.length) return null;
  return (
    <div className="mt-10">
      <p className="mb-3 text-sm font-medium">Before / after comparison ({changed.length} changes)</p>
      <div className="divide-y rounded-lg border">
        {changed.map((c, i) => (
          <div key={i} className="grid gap-3 p-4 text-sm md:grid-cols-[140px_1fr_1fr]">
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="text-muted-foreground">{c.a}</p>
            <p>{c.b}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
