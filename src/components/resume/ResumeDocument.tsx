import type { Resume, SectionKey } from "@/lib/resume/types";
import { SECTION_LABELS } from "@/lib/resume/types";
import { contactLine, fmtDate, fmtRange, visibleSections } from "@/lib/resume/format";
import { cn } from "@/lib/utils";

/**
 * ATS-safe resume: single column, real text, standard headings,
 * no tables, icons, images or graphics.
 */
export function ResumeDocument({ resume, className }: { resume: Resume; className?: string }) {
  const t = resume.template;
  const styles = {
    classic: { root: "font-resume-serif text-[10.5pt] leading-[1.4]", name: "text-[22pt] text-center", head: "text-center", h2: "uppercase tracking-[0.12em] text-[10pt] font-bold border-b border-paper-rule pb-0.5 mt-4 mb-1.5", gap: "space-y-2.5" },
    modern: { root: "font-resume-sans text-[10pt] leading-[1.45]", name: "text-[24pt] tracking-tight", head: "", h2: "text-[11pt] font-bold text-paper-accent mt-4 mb-1.5", gap: "space-y-3" },
    compact: { root: "font-resume-sans text-[9.5pt] leading-[1.35]", name: "text-[18pt]", head: "", h2: "uppercase text-[9pt] font-bold tracking-wide border-b border-paper-rule mt-3 mb-1", gap: "space-y-1.5" },
  }[t];

  const p = resume.personal;
  const render = (key: SectionKey) => {
    const H = (label: string) => <h2 className={styles.h2}>{label}</h2>;
    switch (key) {
      case "summary":
        return resume.summary ? <section key={key}>{H("Summary")}<p>{resume.summary}</p></section> : null;
      case "experience":
        return resume.experience.length ? (
          <section key={key}>
            {H("Experience")}
            <div className={styles.gap}>
              {resume.experience.map((e) => (
                <div key={e.id}>
                  <div className="flex justify-between gap-4">
                    <p><strong>{e.role}</strong>{e.company && <>, {e.company}</>}{e.location && <span>, {e.location}</span>}</p>
                    <p className="shrink-0">{fmtRange(e.start, e.end, e.current)}</p>
                  </div>
                  <ul className="list-disc pl-5 mt-0.5">
                    {e.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ) : null;
      case "education":
        return resume.education.length ? (
          <section key={key}>
            {H("Education")}
            <div className={styles.gap}>
              {resume.education.map((e) => (
                <div key={e.id}>
                  <div className="flex justify-between gap-4">
                    <p><strong>{e.degree}</strong>{e.school && <>, {e.school}</>}{e.location && <>, {e.location}</>}</p>
                    <p className="shrink-0">{fmtRange(e.start, e.end)}</p>
                  </div>
                  {e.details && <p>{e.details}</p>}
                </div>
              ))}
            </div>
          </section>
        ) : null;
      case "skills":
        return resume.skills.length ? <section key={key}>{H("Skills")}<p>{resume.skills.join(", ")}</p></section> : null;
      case "projects":
        return resume.projects.length ? (
          <section key={key}>
            {H("Projects")}
            <div className={styles.gap}>
              {resume.projects.map((pr) => (
                <div key={pr.id}>
                  <p><strong>{pr.name}</strong>{pr.link && <> — {pr.link}</>}</p>
                  <ul className="list-disc pl-5">{pr.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}</ul>
                </div>
              ))}
            </div>
          </section>
        ) : null;
      case "certifications":
        return resume.certifications.length ? (
          <section key={key}>
            {H("Certifications")}
            <ul className="list-disc pl-5">
              {resume.certifications.map((c) => (
                <li key={c.id}>{c.name}{c.issuer && <>, {c.issuer}</>}{c.date && <> ({fmtDate(c.date)})</>}</li>
              ))}
            </ul>
          </section>
        ) : null;
      case "achievements":
        return resume.achievements.filter(Boolean).length ? (
          <section key={key}>{H("Achievements")}<ul className="list-disc pl-5">{resume.achievements.filter(Boolean).map((a, i) => <li key={i}>{a}</li>)}</ul></section>
        ) : null;
      case "custom":
        return resume.custom.map((c) => (
          <section key={c.id}>{H(c.title || SECTION_LABELS.custom)}<ul className="list-disc pl-5">{c.items.filter(Boolean).map((a, i) => <li key={i}>{a}</li>)}</ul></section>
        ));
    }
  };

  return (
    <article className={cn("bg-paper text-paper-foreground", styles.root, className)}>
      <header className={styles.head}>
        <h1 className={cn("font-bold leading-tight", styles.name)}>{p.fullName || "Your Name"}</h1>
        {p.title && <p className="text-[11pt] mt-0.5">{p.title}</p>}
        <p className="mt-1">{contactLine(resume).join("  |  ")}</p>
      </header>
      {visibleSections(resume).map(render)}
    </article>
  );
}
