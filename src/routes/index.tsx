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
  const { resume, resumes, select, saved, update, createNew, duplicate } = useResume();
  const [tab, setTab] = useState<string>("personal");
  const score = useMemo(() => (resume.jobDescription.trim() ? buildReport(resume).score : null), [resume]);
  const Active = TABS.find((t) => t.id === tab)!.el;
  const groups = ["Resume", "Target", "Output"];

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b px-4 print:hidden">
        <FileText className="size-4 text-primary" />
        <span className="font-semibold tracking-tight">ResumeForge</span>
        <select
          className="ml-4 h-8 rounded-md border bg-surface px-2 text-sm"
          value={resume.id}
          onChange={(e) => select(e.target.value)}
        >
          {resumes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <Button size="sm" variant="ghost" onClick={() => createNew(false)}><Plus className="size-3.5" /> New</Button>
        <Button size="sm" variant="ghost" onClick={duplicate}><Copy className="size-3.5" /> Duplicate</Button>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          {saved ? <Check className="size-3" /> : <Loader2 className="size-3 animate-spin" />}
          {saved ? "Saved" : "Saving"}
        </span>
        {score !== null && (
          <button onClick={() => setTab("ats")} className={cn("rounded-md border px-2 py-1 font-mono text-xs", scoreTone(score))}>
            ATS {score}
          </button>
        )}
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)]">
        <nav className="hidden overflow-y-auto border-r p-3 lg:block print:hidden">
          {groups.map((g) => (
            <div key={g} className="mb-4">
              <p className="mb-1 px-2 text-[10px] uppercase tracking-widest text-muted-foreground">{g}</p>
              {TABS.filter((t) => t.group === g).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn("w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors", tab === t.id ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  {t.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <main className="overflow-y-auto p-6 print:hidden">
          <select className="mb-4 h-9 w-full rounded-md border bg-surface px-2 text-sm lg:hidden" value={tab} onChange={(e) => setTab(e.target.value)}>
            {TABS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <Active />
        </main>

        <aside className="hidden overflow-y-auto border-l bg-surface-2 p-6 lg:block print:block print:border-0 print:bg-transparent print:p-0">
          <div className="mb-3 flex gap-1 print:hidden">
            {(["classic", "modern", "compact"] as TemplateId[]).map((t) => (
              <button
                key={t}
                onClick={() => update((r) => ({ ...r, template: t }))}
                className={cn("rounded-md px-2.5 py-1 text-xs capitalize", resume.template === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                {t}
              </button>
            ))}
          </div>
          <div id="resume-print" className="mx-auto max-w-[8.5in] shadow-lg print:shadow-none">
            <ResumeDocument resume={resume} className="min-h-[11in] p-[0.6in]" />
          </div>
        </aside>
      </div>
    </div>
  );
}
