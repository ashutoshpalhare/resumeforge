import { Award, Briefcase, FolderGit2, GraduationCap, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useResume } from "@/lib/resume/store";
import { uid, type Resume } from "@/lib/resume/types";
import { fmtRange } from "@/lib/resume/format";
import { SAMPLE_JD } from "@/lib/resume/sample";
import { BulletList, EmptyState, EntryCard, Field, SectionHeader, TagInput, TextField, move } from "./fields";

type ListKey = "experience" | "education" | "projects" | "certifications" | "custom";

function useList<K extends ListKey>(key: K) {
  const { resume, update } = useResume();
  const items = resume[key] as Resume[K];
  type Item = Resume[K][number];
  return {
    items,
    set: (id: string, patch: Partial<Item>) =>
      update((r) => ({ ...r, [key]: (r[key] as Item[]).map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
    add: (item: Item) => update((r) => ({ ...r, [key]: [...(r[key] as Item[]), item] })),
    remove: (id: string) => update((r) => ({ ...r, [key]: (r[key] as Item[]).filter((x) => x.id !== id) })),
    shift: (i: number, d: number) => update((r) => ({ ...r, [key]: move(r[key] as Item[], i, d) })),
  };
}

const AddBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <Button size="sm" variant="secondary" onClick={onClick}><Plus className="size-3.5" /> {label}</Button>
);

export function PersonalEditor() {
  const { resume, update } = useResume();
  const p = resume.personal;
  const set = (k: keyof typeof p) => (v: string) => update((r) => ({ ...r, personal: { ...r.personal, [k]: v } }));
  return (
    <>
      <SectionHeader title="Personal details" description="Plain contact text at the top — ATS parsers read this first." />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" value={p.fullName} onChange={set("fullName")} placeholder="Jane Doe" />
        <TextField label="Headline" value={p.title} onChange={set("title")} placeholder="Product Designer" />
        <TextField label="Email" type="email" value={p.email} onChange={set("email")} />
        <TextField label="Phone" value={p.phone} onChange={set("phone")} />
        <TextField label="Location" value={p.location} onChange={set("location")} placeholder="City, State" />
        <TextField label="LinkedIn" value={p.linkedin} onChange={set("linkedin")} />
        <TextField label="Website / portfolio" value={p.website} onChange={set("website")} />
      </div>
    </>
  );
}

export function SummaryEditor() {
  const { resume, update } = useResume();
  const words = resume.summary.trim() ? resume.summary.trim().split(/\s+/).length : 0;
  return (
    <>
      <SectionHeader title="Summary" description="2–3 sentences. Mirror the target role title and your strongest relevant skills." />
      <Field label="Professional summary" hint={`${words} words · aim for 30–60`}>
        <Textarea rows={6} value={resume.summary} className="bg-surface-2 leading-relaxed" onChange={(e) => update((r) => ({ ...r, summary: e.target.value }))} />
      </Field>
    </>
  );
}

export function ExperienceEditor() {
  const l = useList("experience");
  return (
    <>
      <SectionHeader title="Experience" description="Most recent first. Start bullets with action verbs and include real metrics." action={<AddBtn label="Add role" onClick={() => l.add({ id: uid(), role: "", company: "", location: "", start: "", end: "", current: false, bullets: [""] })} />} />
      <div className="space-y-4">
        {!l.items.length && <EmptyState icon={Briefcase} title="No roles yet" description="Add your work history, most recent first." action={<AddBtn label="Add role" onClick={() => l.add({ id: uid(), role: "", company: "", location: "", start: "", end: "", current: false, bullets: [""] })} />} />}
        {l.items.map((e, i) => (
          <EntryCard key={e.id} title={e.role || "New role"} subtitle={[e.company, fmtRange(e.start, e.end, e.current)].filter(Boolean).join(" · ")} onUp={i > 0 ? () => l.shift(i, -1) : undefined} onDown={i < l.items.length - 1 ? () => l.shift(i, 1) : undefined} onDelete={() => l.remove(e.id)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Job title" value={e.role} onChange={(v) => l.set(e.id, { role: v })} />
              <TextField label="Company" value={e.company} onChange={(v) => l.set(e.id, { company: v })} />
              <TextField label="Location" value={e.location} onChange={(v) => l.set(e.id, { location: v })} />
              <div className="grid grid-cols-2 gap-2">
                <TextField label="Start" type="month" value={e.start} onChange={(v) => l.set(e.id, { start: v })} />
                {e.current ? (
                  <Field label="End"><Input disabled value="Present" className="h-10 bg-surface-2" /></Field>
                ) : (
                  <TextField label="End" type="month" value={e.end} onChange={(v) => l.set(e.id, { end: v })} />
                )}
              </div>
            </div>
            <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <Switch checked={e.current} onCheckedChange={(c) => l.set(e.id, { current: c })} /> I currently work here
            </label>
            <BulletList label="Achievements & responsibilities" items={e.bullets} onChange={(b) => l.set(e.id, { bullets: b })} placeholder="Led … resulting in …" />
          </EntryCard>
        ))}
      </div>
    </>
  );
}

export function EducationEditor() {
  const l = useList("education");
  return (
    <>
      <SectionHeader title="Education" description="Degree, institution and dates." action={<AddBtn label="Add education" onClick={() => l.add({ id: uid(), degree: "", school: "", location: "", start: "", end: "", details: "" })} />} />
      <div className="space-y-4">
        {!l.items.length && <EmptyState icon={GraduationCap} title="No education yet" description="Add a degree, bootcamp or relevant program." action={<AddBtn label="Add education" onClick={() => l.add({ id: uid(), degree: "", school: "", location: "", start: "", end: "", details: "" })} />} />}
        {l.items.map((e, i) => (
          <EntryCard key={e.id} title={e.degree || "New education"} subtitle={e.school} onUp={i > 0 ? () => l.shift(i, -1) : undefined} onDown={i < l.items.length - 1 ? () => l.shift(i, 1) : undefined} onDelete={() => l.remove(e.id)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Degree" value={e.degree} onChange={(v) => l.set(e.id, { degree: v })} />
              <TextField label="School" value={e.school} onChange={(v) => l.set(e.id, { school: v })} />
              <TextField label="Location" value={e.location} onChange={(v) => l.set(e.id, { location: v })} />
              <div className="grid grid-cols-2 gap-2">
                <TextField label="Start" type="month" value={e.start} onChange={(v) => l.set(e.id, { start: v })} />
                <TextField label="End" type="month" value={e.end} onChange={(v) => l.set(e.id, { end: v })} />
              </div>
            </div>
            <TextField label="Details (optional)" value={e.details} onChange={(v) => l.set(e.id, { details: v })} placeholder="GPA, honors, coursework" />
          </EntryCard>
        ))}
      </div>
    </>
  );
}

export function SkillsEditor() {
  const { resume, update } = useResume();
  return (
    <>
      <SectionHeader title="Skills" description="List concrete tools and competencies. Put the most relevant first." />
      <TagInput items={resume.skills} onChange={(s) => update((r) => ({ ...r, skills: s }))} />
    </>
  );
}

export function ProjectsEditor() {
  const l = useList("projects");
  return (
    <>
      <SectionHeader title="Projects" description="Side projects, open source or notable work samples." action={<AddBtn label="Add project" onClick={() => l.add({ id: uid(), name: "", link: "", bullets: [""] })} />} />
      <div className="space-y-4">
        {!l.items.length && <EmptyState icon={FolderGit2} title="No projects yet" description="Projects are optional but help when experience is light." action={<AddBtn label="Add project" onClick={() => l.add({ id: uid(), name: "", link: "", bullets: [""] })} />} />}
        {l.items.map((p, i) => (
          <EntryCard key={p.id} title={p.name || "New project"} subtitle={p.link} onUp={i > 0 ? () => l.shift(i, -1) : undefined} onDown={i < l.items.length - 1 ? () => l.shift(i, 1) : undefined} onDelete={() => l.remove(p.id)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Name" value={p.name} onChange={(v) => l.set(p.id, { name: v })} />
              <TextField label="Link" value={p.link} onChange={(v) => l.set(p.id, { link: v })} />
            </div>
            <BulletList label="Description" items={p.bullets} onChange={(b) => l.set(p.id, { bullets: b })} />
          </EntryCard>
        ))}
      </div>
    </>
  );
}

export function CertificationsEditor() {
  const l = useList("certifications");
  return (
    <>
      <SectionHeader title="Certifications" description="Name, issuing body and date earned." action={<AddBtn label="Add certification" onClick={() => l.add({ id: uid(), name: "", issuer: "", date: "" })} />} />
      <div className="space-y-4">
        {!l.items.length && <EmptyState icon={Award} title="No certifications yet" description="Optional — only list credentials you actually hold." action={<AddBtn label="Add certification" onClick={() => l.add({ id: uid(), name: "", issuer: "", date: "" })} />} />}
        {l.items.map((c, i) => (
          <EntryCard key={c.id} title={c.name || "New certification"} subtitle={c.issuer} onUp={i > 0 ? () => l.shift(i, -1) : undefined} onDown={i < l.items.length - 1 ? () => l.shift(i, 1) : undefined} onDelete={() => l.remove(c.id)}>
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField label="Name" value={c.name} onChange={(v) => l.set(c.id, { name: v })} />
              <TextField label="Issuer" value={c.issuer} onChange={(v) => l.set(c.id, { issuer: v })} />
              <TextField label="Date" type="month" value={c.date} onChange={(v) => l.set(c.id, { date: v })} />
            </div>
          </EntryCard>
        ))}
      </div>
    </>
  );
}

export function AchievementsEditor() {
  const { resume, update } = useResume();
  const l = useList("custom");
  return (
    <>
      <SectionHeader title="Achievements & custom sections" description="Awards, talks, publications, volunteering — anything with a standard heading." />
      <BulletList label="Achievements" items={resume.achievements} onChange={(a) => update((r) => ({ ...r, achievements: a }))} />
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Custom sections</p>
          <AddBtn label="Add section" onClick={() => l.add({ id: uid(), title: "Volunteering", items: [""] })} />
        </div>
        {l.items.map((c, i) => (
          <EntryCard key={c.id} title={c.title || "Untitled section"} onUp={i > 0 ? () => l.shift(i, -1) : undefined} onDown={i < l.items.length - 1 ? () => l.shift(i, 1) : undefined} onDelete={() => l.remove(c.id)}>
            <TextField label="Heading" value={c.title} onChange={(v) => l.set(c.id, { title: v })} hint="Use a standard heading, e.g. Publications, Volunteering, Languages." />
            <BulletList label="Items" items={c.items} onChange={(it) => l.set(c.id, { items: it })} />
          </EntryCard>
        ))}
      </div>
    </>
  );
}

export function JobEditor() {
  const { resume, update } = useResume();
  const onFile = async (f: File | undefined) => {
    if (!f) return;
    if (f.size > 200_000) { toast.error("That file is too large — paste the posting text instead."); return; }
    try {
      const text = await f.text();
      if (!text.trim()) { toast.error("The file is empty."); return; }
      update((r) => ({ ...r, jobDescription: text }));
      toast.success(`Imported ${f.name}`);
    } catch {
      toast.error("Couldn't read that file. Try a plain .txt file.");
    }
  };
  return (
    <>
      <SectionHeader title="Target job description" description="Paste the full posting. Everything is analyzed locally in your browser." />
      <Textarea aria-label="Job description" rows={18} value={resume.jobDescription} onChange={(e) => update((r) => ({ ...r, jobDescription: e.target.value }))} placeholder="Paste the job description here…" className="bg-surface-2 font-mono text-xs leading-relaxed" />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" asChild>
          <label className="cursor-pointer">Import .txt<input type="file" accept=".txt,.md,text/plain" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} /></label>
        </Button>
        <Button size="sm" variant="ghost" onClick={() => update((r) => ({ ...r, jobDescription: SAMPLE_JD }))}>Load sample JD</Button>
        <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => update((r) => ({ ...r, jobDescription: "" }))}>Clear</Button>
      </div>
    </>
  );
}
