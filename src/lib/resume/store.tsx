import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Resume } from "./types";
import { uid } from "./types";
import { createBlankResume, createSampleResume } from "./sample";

const KEY = "resumeforge:v1";

interface Persisted {
  resumes: Resume[];
  activeId: string;
  baselines: Record<string, Resume>;
}

interface Ctx {
  resume: Resume;
  resumes: Resume[];
  baseline: Resume | null;
  saved: boolean;
  update: (fn: (r: Resume) => Resume) => void;
  select: (id: string) => void;
  duplicate: () => void;
  createNew: (sample?: boolean) => void;
  remove: (id: string) => void;
  reset: () => void;
  setBaseline: () => void;
  rename: (name: string) => void;
  importResume: (r: Resume) => void;
}

const ResumeCtx = createContext<Ctx | null>(null);

function initial(): Persisted {
  const r = createSampleResume();
  return { resumes: [r], activeId: r.id, baselines: {} };
}

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(initial);
  const [hydrated, setHydrated] = useState(false);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Persisted;
        if (parsed.resumes?.length) setState(parsed);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setSaved(false);
    const t = setTimeout(() => {
      localStorage.setItem(KEY, JSON.stringify(state));
      setSaved(true);
    }, 400);
    return () => clearTimeout(t);
  }, [state, hydrated]);

  const resume = state.resumes.find((r) => r.id === state.activeId) ?? state.resumes[0];

  const update = useCallback((fn: (r: Resume) => Resume) => {
    setState((s) => ({
      ...s,
      resumes: s.resumes.map((r) => (r.id === s.activeId ? { ...fn(r), updatedAt: Date.now() } : r)),
    }));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      resume,
      resumes: state.resumes,
      baseline: state.baselines[resume.id] ?? null,
      saved,
      update,
      select: (id) => setState((s) => ({ ...s, activeId: id })),
      duplicate: () =>
        setState((s) => {
          const copy: Resume = { ...structuredClone(resume), id: uid(), name: `${resume.name} (copy)`, updatedAt: Date.now() };
          return { ...s, resumes: [...s.resumes, copy], activeId: copy.id };
        }),
      createNew: (sample) =>
        setState((s) => {
          const r = sample ? createSampleResume() : createBlankResume();
          return { ...s, resumes: [...s.resumes, r], activeId: r.id };
        }),
      remove: (id) =>
        setState((s) => {
          const rest = s.resumes.filter((r) => r.id !== id);
          const resumes = rest.length ? rest : [createBlankResume()];
          return { ...s, resumes, activeId: resumes[0].id };
        }),
      reset: () =>
        setState((s) => {
          const blank = { ...createBlankResume(), id: resume.id, name: resume.name };
          const baselines = { ...s.baselines };
          delete baselines[resume.id];
          return { ...s, baselines, resumes: s.resumes.map((r) => (r.id === resume.id ? blank : r)) };
        }),
      rename: (name) =>
        setState((s) => ({ ...s, resumes: s.resumes.map((r) => (r.id === s.activeId ? { ...r, name } : r)) })),
      importResume: (r) =>
        setState((s) => {
          const copy: Resume = { ...structuredClone(r), id: uid(), updatedAt: Date.now() };
          return { ...s, resumes: [...s.resumes, copy], activeId: copy.id };
        }),
      setBaseline: () =>
        setState((s) => ({ ...s, baselines: { ...s.baselines, [resume.id]: structuredClone(resume) } })),
    }),
    [resume, state, saved, update],
  );

  return <ResumeCtx.Provider value={value}>{children}</ResumeCtx.Provider>;
}

export function useResume() {
  const c = useContext(ResumeCtx);
  if (!c) throw new Error("useResume must be used inside ResumeProvider");
  return c;
}
