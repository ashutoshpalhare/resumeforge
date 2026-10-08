import { Copy, FileDown, FileJson, FileText, Files, RotateCcw, Trash2, Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toPlainText } from "@/lib/resume/format";
import { useResume } from "@/lib/resume/store";
import { SectionHeader } from "./fields";

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportPanel() {
  const { resume, duplicate, reset, remove, resumes, importResume } = useResume();
  const fileRef = useRef<HTMLInputElement>(null);
  const onFile = async (f?: File) => {
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!data || typeof data !== "object" || !data.personal || !Array.isArray(data.experience)) throw new Error();
      importResume(data);
      toast.success("Resume imported");
    } catch {
      toast.error("That file isn't a valid ResumeForge backup.");
    }
    if (fileRef.current) fileRef.current.value = "";
  };
  const base = (resume.personal.fullName || "resume").replace(/\s+/g, "_");

  const actions = [
    { icon: FileDown, title: "Download PDF", desc: "Selectable text, ATS-safe. Choose “Save as PDF” in the print dialog.", run: () => window.print() },
    { icon: Copy, title: "Copy plain text", desc: "Paste into application forms that ask for raw text.", run: async () => { try { await navigator.clipboard.writeText(toPlainText(resume)); toast.success("Resume copied as plain text"); } catch { toast.error("Couldn't access the clipboard. Use Download .txt instead."); } } },
    { icon: FileText, title: "Download .txt", desc: "Universal plain-text version.", run: () => download(`${base}.txt`, toPlainText(resume), "text/plain") },
    { icon: FileJson, title: "Download data (.json)", desc: "Back up or move your resume to another browser.", run: () => download(`${base}.json`, JSON.stringify(resume, null, 2), "application/json") },
    { icon: Upload, title: "Import data (.json)", desc: "Restore a resume you previously backed up.", run: () => fileRef.current?.click() },
    { icon: Files, title: "Duplicate resume", desc: "Fork this version to tailor for another job.", run: () => { duplicate(); toast.success("Duplicated — you're now editing the copy"); } },
  ];

  return (
    <>
      <SectionHeader title="Export" description="Your resume is saved automatically in this browser." />
      <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" aria-label="Import resume JSON" onChange={(e) => onFile(e.target.files?.[0])} />
      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((a) => (
          <button key={a.title} onClick={a.run} className="group flex gap-3 rounded-lg border bg-surface p-4 text-left transition-colors hover:border-primary/40 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <a.icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <span>
              <span className="block text-sm font-medium">{a.title}</span>
              <span className="block text-xs text-muted-foreground">{a.desc}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-10 rounded-lg border border-destructive/30 p-4">
        <p className="text-sm font-medium">Danger zone</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Confirm title="Reset this resume?" desc="All content in this resume will be cleared. This can't be undone." onConfirm={reset}>
            <Button size="sm" variant="outline"><RotateCcw className="size-3.5" /> Reset content</Button>
          </Confirm>
          <Confirm title="Delete this resume?" desc={resumes.length > 1 ? "It will be removed from this browser." : "This is your only resume; a blank one will replace it."} onConfirm={() => remove(resume.id)}>
            <Button size="sm" variant="outline" className="text-destructive"><Trash2 className="size-3.5" /> Delete resume</Button>
          </Confirm>
        </div>
      </div>
    </>
  );
}

function Confirm({ title, desc, onConfirm, children }: { title: string; desc: string; onConfirm: () => void; children: React.ReactNode }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{desc}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
