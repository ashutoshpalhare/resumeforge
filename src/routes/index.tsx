import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText, Gauge, Sparkles, Download, Briefcase, Check, Loader2, Plus, Copy } from "lucide-react";
import { ResumeProvider, useResume } from "@/lib/resume/store";
import { buildReport } from "@/lib/resume/ats";
import { ResumeDocument } from "@/components/resume/ResumeDocument";
import {
  PersonalEditor, SummaryEditor, ExperienceEditor, EducationEditor, SkillsEditor,
  ProjectsEditor, CertificationsEditor, AchievementsEditor, JobEditor,
} from "@/components/studio/editors";
import { AtsPanel } from "@/components/studio/AtsPanel";
import { OptimizePanel } from "@/components/studio/OptimizePanel";
import { ExportPanel } from "@/components/studio/ExportPanel";
import { scoreTone } from "@/components/studio/ScoreRing";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import type { TemplateId } from "@/lib/resume/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResumeForge — ATS resume builder & job matcher" },
      { name: "description", content: "Write an ATS-safe resume, match it against any job description and get an honest score with fixes." },
      { property: "og:title", content: "ResumeForge — ATS resume builder & job matcher" },
      { property: "og:description", content: "Write an ATS-safe resume, match it against any job description and get an honest score with fixes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ResumeProvider>
      <Studio />
      <Toaster />
    </ResumeProvider>
  ),
});

const TABS = [
  { id: "personal", label: "Contact", group: "Resume", el: PersonalEditor },
  { id: "summary", label: "Summary", group: "Resume", el: SummaryEditor },
  { id: "experience", label: "Experience", group: "Resume", el: ExperienceEditor },
  { id: "education", label: "Education", group: "Resume", el: EducationEditor },
  { id: "skills", label: "Skills", group: "Resume", el: SkillsEditor },
  { id: "projects", label: "Projects", group: "Resume", el: ProjectsEditor },
  { id: "certs", label: "Certifications", group: "Resume", el: CertificationsEditor },
  { id: "achievements", label: "Achievements", group: "Resume", el: AchievementsEditor },
  { id: "job", label: "Job description", group: "Target", el: JobEditor, icon: Briefcase },
  { id: "ats", label: "ATS analysis", group: "Target", el: AtsPanel, icon: Gauge },
  { id: "optimize", label: "Optimize", group: "Target", el: OptimizePanel, icon: Sparkles },
  { id: "export", label: "Export", group: "Output", el: ExportPanel, icon: Download },
] as const;

function Studio() {
  const { resume, resumes, select, saved, update, createNew, duplicate, rename } = useResume();
  const [tab, setTab] = useState<string>("personal");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const score = useMemo(() => (resume.jobDescription.trim() ? buildReport(resume).score : null), [resume]);
  const Active = TABS.find((t) => t.id === tab)!.el;
  const groups = ["Resume", "Target", "Output"];

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <a href="#workspace" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">Skip to editor</a>
      <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b bg-surface/60 px-3 py-2 backdrop-blur sm:flex sm:gap-3 sm:px-4 print:hidden">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground"><FileText className="size-4" aria-hidden /></span>
          <span className="hidden font-semibold tracking-tight sm:inline">ResumeForge</span>
          <span className="hidden h-5 w-px bg-border sm:block" aria-hidden />
          <label className="sr-only" htmlFor="resume-switch">Switch resume</label>
          <select id="resume-switch" className="h-8 min-w-0 max-w-[9rem] rounded-md border bg-surface px-2 text-sm sm:max-w-[12rem]" value={resume.id} onChange={(e) => select(e.target.value)}>
            {resumes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <label className="sr-only" htmlFor="resume-name">Resume name</label>
          <input id="resume-name" value={resume.name} onChange={(e) => rename(e.target.value)} onBlur={(e) => !e.target.value.trim() && rename("Untitled resume")} className="hidden h-8 w-40 min-w-0 rounded-md border border-transparent bg-transparent px-2 text-sm hover:border-border focus:border-border md:block" />
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:ml-auto sm:gap-2">
          <Button size="sm" variant="ghost" onClick={() => createNew(false)} aria-label="New blank resume"><Plus className="size-3.5" /><span className="hidden sm:inline">New</span></Button>
          <Button size="sm" variant="ghost" onClick={duplicate} aria-label="Duplicate resume"><Copy className="size-3.5" /><span className="hidden sm:inline">Duplicate</span></Button>
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex" role="status" aria-live="polite">
            {saved ? <Check className="size-3 text-success" aria-hidden /> : <Loader2 className="size-3 animate-spin" aria-hidden />}
            {saved ? "Saved" : "Saving"}
          </span>
          {score !== null && (
            <button onClick={() => { setTab("ats"); setMobileView("edit"); }} aria-label={`ATS score ${score} of 100, open analysis`} className={cn("rounded-md border px-2 py-1 font-mono text-xs", scoreTone(score))}>
              ATS {score}
            </button>
          )}
        </div>
      </header>

      <div className="flex shrink-0 gap-1 border-b p-2 lg:hidden print:hidden" role="tablist" aria-label="Workspace view">
        {(["edit", "preview"] as const).map((v) => (
          <button key={v} role="tab" aria-selected={mobileView === v} onClick={() => setMobileView(v)} className={cn("flex-1 rounded-md py-1.5 text-sm capitalize transition-colors", mobileView === v ? "bg-surface-2 text-foreground" : "text-muted-foreground")}>
            {v}
          </button>
        ))}
      </div>

      <div id="workspace" className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)_minmax(0,1.05fr)]">
        <nav aria-label="Resume sections" className="hidden overflow-y-auto border-r p-3 lg:block print:hidden">
          {groups.map((g) => (
            <div key={g} className="mb-5">
              <p className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{g}</p>
              {TABS.filter((t) => t.group === g).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  aria-current={tab === t.id ? "page" : undefined}
                  className={cn("relative w-full rounded-md px-2.5 py-1.5 text-left text-sm transition-colors", tab === t.id ? "bg-surface-2 font-medium text-foreground before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-primary" : "text-muted-foreground hover:bg-surface hover:text-foreground")}
                >
                  {t.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <main className={cn("overflow-y-auto print:hidden", mobileView === "preview" && "hidden lg:block")}>
          <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
            <label className="sr-only" htmlFor="section-picker">Section</label>
            <select id="section-picker" className="mb-5 h-10 w-full rounded-md border bg-surface px-3 text-sm lg:hidden" value={tab} onChange={(e) => setTab(e.target.value)}>
              {groups.map((g) => (
                <optgroup key={g} label={g}>
                  {TABS.filter((t) => t.group === g).map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </optgroup>
              ))}
            </select>
            <Active />
          </div>
        </main>

        <aside aria-label="Resume preview" className={cn("overflow-y-auto border-l bg-surface-2 p-4 sm:p-6 lg:block print:block print:border-0 print:bg-transparent print:p-0", mobileView === "edit" ? "hidden" : "block")}>
          <div className="mx-auto mb-4 flex max-w-[8.5in] items-center justify-between gap-2 print:hidden">
            <span className="text-xs text-muted-foreground">Live preview · US Letter</span>
            <div className="flex gap-1 rounded-md border bg-surface p-0.5" role="radiogroup" aria-label="Template">
              {(["classic", "modern", "compact"] as TemplateId[]).map((t) => (
                <button
                  key={t}
                  role="radio"
                  aria-checked={resume.template === t}
                  onClick={() => update((r) => ({ ...r, template: t }))}
                  className={cn("rounded px-2.5 py-1 text-xs capitalize transition-colors", resume.template === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div id="resume-print" className="mx-auto w-full max-w-[8.5in] rounded-sm shadow-2xl ring-1 ring-border print:w-auto print:shadow-none print:ring-0">
              <ResumeDocument resume={resume} className="min-h-[11in] p-[6%] print:p-[0.6in]" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
