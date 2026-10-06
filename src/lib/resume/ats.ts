import type { Resume } from "./types";
import { resumeText } from "./format";

/** Known skill vocabulary, grouped by category so we can judge relevance. */
const VOCAB: Record<string, string[]> = {
  frontend: ["react", "typescript", "javascript", "html", "css", "next.js", "vue", "angular", "svelte", "tailwind", "redux", "storybook", "design system", "design systems", "responsive design", "web performance", "core web vitals", "server-side rendering", "webpack", "vite"],
  backend: ["node.js", "python", "java", "go", "ruby", "c#", ".net", "php", "django", "flask", "spring", "express", "rest apis", "rest", "graphql", "microservices", "sql", "postgresql", "mysql", "mongodb", "redis"],
  devops: ["aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ci/cd", "github actions", "jenkins", "linux", "git"],
  quality: ["testing", "unit tests", "integration tests", "jest", "playwright", "cypress", "vitest", "code review", "tdd"],
  ux: ["accessibility", "wcag", "figma", "user research", "ui", "ux"],
  data: ["machine learning", "data analysis", "pandas", "tableau", "excel", "power bi", "statistics", "etl", "spark"],
  business: ["agile", "scrum", "stakeholder management", "project management", "product management", "roadmap", "jira", "budgeting", "forecasting", "salesforce", "crm", "seo", "marketing"],
  soft: ["leadership", "mentoring", "mentor", "communication", "collaboration", "cross-functional"],
  domain: ["fintech", "payments", "healthcare", "e-commerce", "saas", "b2b"],
};

const ALIASES: Record<string, string[]> = {
  "rest apis": ["rest", "restful", "rest api"],
  "node.js": ["node", "nodejs"],
  "next.js": ["nextjs", "next"],
  "ci/cd": ["ci", "continuous integration", "ci pipelines", "pipelines"],
  accessibility: ["a11y", "wcag"],
  wcag: ["accessibility"],
  testing: ["tests", "jest", "playwright", "cypress"],
  mentoring: ["mentored", "mentor"],
  mentor: ["mentored", "mentoring"],
  "design system": ["design systems", "component library"],
  "design systems": ["design system", "component library"],
  "web performance": ["performance", "page load", "bundle size"],
  "server-side rendering": ["ssr", "next.js"],
  "unit tests": ["jest", "tests"],
  "integration tests": ["playwright", "tests"],
};

const CATEGORY_OF: Record<string, string> = {};
Object.entries(VOCAB).forEach(([cat, words]) => words.forEach((w) => (CATEGORY_OF[w] = cat)));

export type MatchStatus = "found" | "partial" | "missing";
export interface KeywordMatch {
  keyword: string;
  importance: "required" | "preferred";
  status: MatchStatus;
  category: string;
  relevant: boolean; // missing but related to the user's existing background
}

export interface JDAnalysis {
  title: string;
  keywords: KeywordMatch[];
  responsibilities: string[];
  qualifications: string[];
  yearsRequired: number | null;
}

export interface ScorePart {
  label: string;
  score: number;
  max: number;
  detail: string;
}

export interface AtsReport {
  analysis: JDAnalysis;
  score: number;
  breakdown: ScorePart[];
  suggestions: { level: "high" | "medium" | "low"; text: string }[];
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const has = (text: string, term: string) =>
  new RegExp(`(^|[^a-z0-9])${esc(term)}($|[^a-z0-9])`, "i").test(text);

function sectionize(jd: string) {
  const lines = jd.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let mode: "intro" | "resp" | "req" | "pref" = "intro";
  const out = { intro: [] as string[], resp: [] as string[], req: [] as string[], pref: [] as string[] };
  for (const raw of lines) {
    const l = raw.toLowerCase();
    const isHeading = raw.length < 60 && !/^[-•*]/.test(raw);
    if (isHeading && /(nice to have|preferred|bonus|plus|desirable)/.test(l)) { mode = "pref"; continue; }
    if (isHeading && /(requirement|qualification|must have|what you bring|you have|skills)/.test(l)) { mode = "req"; continue; }
    if (isHeading && /(responsibilit|what you.?ll do|the role|duties|you will)/.test(l)) { mode = "resp"; continue; }
    out[mode].push(raw.replace(/^[-•*]\s*/, ""));
  }
  return { lines, ...out };
}

export function analyzeJD(jd: string, resume: Resume): JDAnalysis {
  const s = sectionize(jd);
  const rText = resumeText(resume).toLowerCase();
  const reqText = [...s.req, ...s.resp, ...s.intro].join("\n");
  const prefText = s.pref.join("\n");
  const seen = new Set<string>();
  const keywords: KeywordMatch[] = [];
  const userCats = new Set<string>();

  const allTerms = Object.keys(CATEGORY_OF).sort((a, b) => b.length - a.length);
  for (const t of allTerms) if (has(rText, t)) userCats.add(CATEGORY_OF[t]);

  for (const term of allTerms) {
    const inReq = has(reqText, term);
    const inPref = has(prefText, term);
    if (!inReq && !inPref) continue;
    // skip shorter terms covered by a longer captured one (e.g. "rest" vs "rest apis")
    if ([...seen].some((k) => k.includes(term) && k !== term)) continue;
    seen.add(term);
    let status: MatchStatus = "missing";
    if (has(rText, term)) status = "found";
    else if ((ALIASES[term] ?? []).some((a) => has(rText, a)) || term.split(/\s+/).some((w) => w.length > 3 && has(rText, w)))
      status = "partial";
    const category = CATEGORY_OF[term];
    keywords.push({
      keyword: term,
      importance: inReq ? "required" : "preferred",
      status,
      category,
      relevant: status !== "found" && userCats.has(category),
    });
  }

  const yrs = jd.match(/(\d+)\+?\s*(?:years|yrs)/i);
  return {
    title: s.lines[0]?.slice(0, 80) ?? "",
    keywords,
    responsibilities: s.resp.slice(0, 8),
    qualifications: [...s.req, ...s.pref].slice(0, 10),
    yearsRequired: yrs ? Number(yrs[1]) : null,
  };
}

function monthsBetween(a: string, b: string) {
  const [ay, am] = a.split("-").map(Number);
  const [by, bm] = b.split("-").map(Number);
  return (by - ay) * 12 + (bm - am);
}

export function yearsOfExperience(r: Resume): number {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const m = r.experience.reduce((acc, e) => (e.start ? acc + Math.max(0, monthsBetween(e.start, e.current || !e.end ? today : e.end)) : acc), 0);
  return Math.floor(m / 12);
}

const WEAK = /^(responsible for|worked on|helped|assisted|involved in|tasked with|duties included)/i;

export function buildReport(resume: Resume): AtsReport {
  const analysis = analyzeJD(resume.jobDescription, resume);
  const req = analysis.keywords.filter((k) => k.importance === "required");
  const pref = analysis.keywords.filter((k) => k.importance === "preferred");
  const val = (k: KeywordMatch) => (k.status === "found" ? 1 : k.status === "partial" ? 0.5 : 0);
  const ratio = (arr: KeywordMatch[]) => (arr.length ? arr.reduce((a, k) => a + val(k), 0) / arr.length : 1);

  const bullets = resume.experience.flatMap((e) => e.bullets).filter(Boolean);
  const quantified = bullets.filter((b) => /\d/.test(b)).length;
  const weak = bullets.filter((b) => WEAK.test(b.trim()));
  const p = resume.personal;
  const contact = [p.fullName, p.email, p.phone, p.location].filter(Boolean).length;
  const sections = [resume.summary, resume.experience.length, resume.education.length, resume.skills.length].filter(Boolean).length;
  const words = resumeText(resume).split(/\s+/).length;
  const datesOk = resume.experience.every((e) => e.start && (e.end || e.current));
  const yrs = yearsOfExperience(resume);

  const breakdown: ScorePart[] = [
    { label: "Required keywords", max: 35, score: Math.round(35 * ratio(req)), detail: `${req.filter((k) => k.status === "found").length}/${req.length} matched` },
    { label: "Preferred keywords", max: 15, score: Math.round(15 * ratio(pref)), detail: `${pref.filter((k) => k.status === "found").length}/${pref.length} matched` },
    { label: "Section structure", max: 15, score: Math.round((sections / 4) * 11 + (contact / 4) * 4), detail: `${sections}/4 core sections, ${contact}/4 contact fields` },
    { label: "Impact & action verbs", max: 15, score: bullets.length ? Math.round(10 * (quantified / bullets.length) + 5 * (1 - weak.length / bullets.length)) : 0, detail: `${quantified}/${bullets.length} bullets quantified, ${weak.length} weak openers` },
    { label: "Experience fit", max: 10, score: analysis.yearsRequired ? Math.round(10 * Math.min(1, yrs / analysis.yearsRequired)) : 10, detail: analysis.yearsRequired ? `${yrs} yrs vs ${analysis.yearsRequired}+ requested` : "No requirement detected" },
    { label: "Formatting & length", max: 10, score: (datesOk ? 5 : 2) + (words >= 250 && words <= 900 ? 5 : words > 120 ? 3 : 1), detail: `${words} words, ${datesOk ? "consistent dates" : "missing dates"}, single-column` },
  ];
  const score = resume.jobDescription.trim() ? Math.min(100, breakdown.reduce((a, b) => a + b.score, 0)) : 0;

  const suggestions: AtsReport["suggestions"] = [];
  const relMissing = req.filter((k) => k.status !== "found" && k.relevant);
  if (relMissing.length)
    suggestions.push({ level: "high", text: `If accurate, mention ${relMissing.slice(0, 4).map((k) => `“${k.keyword}”`).join(", ")} using the JD's exact wording — they relate to skills already on your resume.` });
  const partials = analysis.keywords.filter((k) => k.status === "partial");
  if (partials.length)
    suggestions.push({ level: "medium", text: `Use exact phrasing for partial matches: ${partials.slice(0, 4).map((k) => k.keyword).join(", ")}.` });
  if (weak.length) suggestions.push({ level: "high", text: `${weak.length} bullet(s) start with weak phrases like “Responsible for”. Lead with an action verb.` });
  if (bullets.length && quantified / bullets.length < 0.5) suggestions.push({ level: "medium", text: "Add real metrics (%, users, time saved) to more bullets where you have them." });
  if (resume.summary.split(/\s+/).length < 30) suggestions.push({ level: "medium", text: "Expand your summary to 2–3 sentences that mirror the target role title." });
  if (analysis.title && p.title && !has(analysis.title.toLowerCase(), p.title.toLowerCase().split(" ").slice(-1)[0] ?? ""))
    suggestions.push({ level: "low", text: `Consider aligning your headline with the role title: “${analysis.title.split(/[—–-]/)[0].trim()}”.` });
  if (!datesOk) suggestions.push({ level: "medium", text: "Every role needs a start and end date (or Present)." });

  return { analysis, score, breakdown, suggestions };
}
