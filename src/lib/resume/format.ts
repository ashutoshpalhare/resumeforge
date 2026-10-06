import { type Resume, SECTION_LABELS } from "./types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function fmtDate(v: string): string {
  if (!v) return "";
  const [y, m] = v.split("-");
  if (!m) return y;
  return `${MONTHS[Number(m) - 1] ?? ""} ${y}`.trim();
}

export function fmtRange(start: string, end: string, current = false): string {
  const s = fmtDate(start);
  const e = current ? "Present" : fmtDate(end);
  if (s && e) return `${s} – ${e}`;
  return s || e;
}

export function contactLine(r: Resume): string[] {
  const p = r.personal;
  return [p.email, p.phone, p.location, p.linkedin, p.website].filter(Boolean);
}

export function visibleSections(r: Resume) {
  return r.sectionOrder.filter((k) => !r.hidden.includes(k));
}

export function resumeText(r: Resume): string {
  const parts: string[] = [r.personal.title, r.summary, r.skills.join(", ")];
  r.experience.forEach((e) => parts.push(e.role, e.company, ...e.bullets));
  r.education.forEach((e) => parts.push(e.degree, e.school, e.details));
  r.projects.forEach((p) => parts.push(p.name, ...p.bullets));
  r.certifications.forEach((c) => parts.push(c.name, c.issuer));
  parts.push(...r.achievements);
  r.custom.forEach((c) => parts.push(c.title, ...c.items));
  return parts.filter(Boolean).join("\n");
}

export function toPlainText(r: Resume): string {
  const out: string[] = [];
  const p = r.personal;
  out.push(p.fullName.toUpperCase());
  if (p.title) out.push(p.title);
  out.push(contactLine(r).join(" | "));
  for (const key of visibleSections(r)) {
    const block: string[] = [];
    if (key === "summary" && r.summary) block.push(r.summary);
    if (key === "experience")
      r.experience.forEach((e) => {
        block.push(`${e.role}, ${e.company}${e.location ? ` — ${e.location}` : ""}`);
        block.push(fmtRange(e.start, e.end, e.current));
        e.bullets.filter(Boolean).forEach((b) => block.push(`- ${b}`));
        block.push("");
      });
    if (key === "education")
      r.education.forEach((e) => {
        block.push(`${e.degree}, ${e.school}${e.location ? ` — ${e.location}` : ""}`);
        block.push(fmtRange(e.start, e.end));
        if (e.details) block.push(e.details);
      });
    if (key === "skills" && r.skills.length) block.push(r.skills.join(", "));
    if (key === "projects")
      r.projects.forEach((pr) => {
        block.push(`${pr.name}${pr.link ? ` (${pr.link})` : ""}`);
        pr.bullets.filter(Boolean).forEach((b) => block.push(`- ${b}`));
      });
    if (key === "certifications")
      r.certifications.forEach((c) =>
        block.push(`${c.name}${c.issuer ? `, ${c.issuer}` : ""}${c.date ? ` (${fmtDate(c.date)})` : ""}`),
      );
    if (key === "achievements") r.achievements.filter(Boolean).forEach((a) => block.push(`- ${a}`));
    if (key === "custom")
      r.custom.forEach((c) => {
        block.push(c.title.toUpperCase());
        c.items.filter(Boolean).forEach((i) => block.push(`- ${i}`));
      });
    if (block.length) {
      out.push("", key === "custom" ? "" : SECTION_LABELS[key].toUpperCase(), ...block);
    }
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export interface CompletionItem {
  key: string;
  label: string;
  done: boolean;
}

export function completion(r: Resume): { pct: number; items: CompletionItem[] } {
  const p = r.personal;
  const items: CompletionItem[] = [
    { key: "personal", label: "Contact details", done: !!(p.fullName && p.email && p.phone && p.location) },
    { key: "summary", label: "Professional summary", done: r.summary.trim().split(/\s+/).length >= 20 },
    { key: "experience", label: "Work experience", done: r.experience.length > 0 && r.experience.every((e) => e.bullets.filter(Boolean).length >= 2) },
    { key: "education", label: "Education", done: r.education.length > 0 },
    { key: "skills", label: "At least 6 skills", done: r.skills.length >= 6 },
    { key: "projects", label: "Projects", done: r.projects.length > 0 },
    { key: "certifications", label: "Certifications", done: r.certifications.length > 0 },
    { key: "jd", label: "Target job description", done: r.jobDescription.trim().length > 80 },
  ];
  const pct = Math.round((items.filter((i) => i.done).length / items.length) * 100);
  return { pct, items };
}
