import type { Resume } from "./types";
import { buildReport, yearsOfExperience } from "./ats";

/**
 * Deterministic "rewrite" helpers. They only rephrase and reorder what the
 * user already wrote — they never introduce new skills, employers, dates,
 * metrics or achievements.
 */
const VERB_MAP: [RegExp, string][] = [
  [/^responsible for (building|developing)\s+/i, "Built "],
  [/^responsible for (managing|leading)\s+/i, "Led "],
  [/^responsible for\s+/i, "Owned "],
  [/^worked on (the )?/i, "Developed the "],
  [/^helped (to )?write\s+/i, "Wrote "],
  [/^helped (to )?build\s+/i, "Co-built "],
  [/^helped (to )?/i, "Supported "],
  [/^assisted (with|in)\s+/i, "Supported "],
  [/^involved in\s+/i, "Contributed to "],
  [/^tasked with\s+/i, "Delivered "],
];

export function rewriteBullet(b: string): string {
  let t = b.trim().replace(/\.$/, "");
  for (const [re, rep] of VERB_MAP) {
    if (re.test(t)) { t = t.replace(re, rep); break; }
  }
  t = t.replace(/\s+/g, " ").replace(/\b(very|really|successfully|various)\s+/gi, "");
  t = t.replace(/Developed the the /, "Developed the ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function rewriteSummary(r: Resume): string {
  const report = buildReport(r);
  const yrs = yearsOfExperience(r);
  const matched = report.analysis.keywords.filter((k) => k.status === "found").map((k) => k.keyword);
  const skillsOrdered = [
    ...r.skills.filter((s) => matched.includes(s.toLowerCase())),
    ...r.skills.filter((s) => !matched.includes(s.toLowerCase())),
  ].slice(0, 5);
  const title = r.personal.title || r.experience[0]?.role || "Professional";
  const companies = r.experience.slice(0, 2).map((e) => e.company).filter(Boolean);
  const first = `${title} with ${yrs > 0 ? `${yrs}+ years of` : "hands-on"} experience${skillsOrdered.length ? ` in ${listJoin(skillsOrdered)}` : ""}.`;
  const best = r.experience.flatMap((e) => e.bullets).find((b) => /\d/.test(b));
  const second = best ? `Recent impact: ${lowerFirst(rewriteBullet(best))}.` : "";
  const third = companies.length ? `Experience across ${listJoin(companies)}.` : "";
  return [first, second, third].filter(Boolean).join(" ");
}

const listJoin = (a: string[]) => (a.length < 2 ? a.join("") : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export interface RewriteProposal {
  id: string;
  kind: "summary" | "bullet";
  label: string;
  before: string;
  after: string;
  expId?: string;
  index?: number;
}

export function proposals(r: Resume): RewriteProposal[] {
  const out: RewriteProposal[] = [];
  if (r.summary.trim() || r.experience.length) {
    const after = rewriteSummary(r);
    if (after !== r.summary) out.push({ id: "summary", kind: "summary", label: "Professional summary", before: r.summary, after });
  }
  r.experience.forEach((e) =>
    e.bullets.forEach((b, i) => {
      if (!b.trim()) return;
      const after = rewriteBullet(b);
      if (after !== b.trim().replace(/\.$/, ""))
        out.push({ id: `${e.id}-${i}`, kind: "bullet", label: `${e.role} · ${e.company}`, before: b, after, expId: e.id, index: i });
    }),
  );
  return out;
}

export function applyProposal(r: Resume, p: RewriteProposal): Resume {
  if (p.kind === "summary") return { ...r, summary: p.after };
  return {
    ...r,
    experience: r.experience.map((e) =>
      e.id === p.expId ? { ...e, bullets: e.bullets.map((b, i) => (i === p.index ? p.after : b)) } : e,
    ),
  };
}
