import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextField({ label, value, onChange, placeholder, type = "text", hint }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; hint?: string }) {
  return (
    <Field label={label} hint={hint}>
      <Input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="bg-surface-2" />
    </Field>
  );
}

export function SectionHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function EntryCard({ title, subtitle, onUp, onDown, onDelete, children }: { title: string; subtitle?: string; onUp?: () => void; onDown?: () => void; onDelete: () => void; children: ReactNode }) {
  return (
    <div className="rounded-lg border bg-surface p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{title}</p>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 gap-1">
          <Button size="icon" variant="ghost" className="size-7" onClick={onUp} disabled={!onUp} aria-label="Move up"><ArrowUp className="size-3.5" /></Button>
          <Button size="icon" variant="ghost" className="size-7" onClick={onDown} disabled={!onDown} aria-label="Move down"><ArrowDown className="size-3.5" /></Button>
          <Button size="icon" variant="ghost" className="size-7 text-muted-foreground hover:text-destructive" onClick={onDelete} aria-label="Delete"><Trash2 className="size-3.5" /></Button>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function BulletList({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  return (
    <Field label={label}>
      <div className="space-y-2">
        {items.map((b, i) => (
          <div key={i} className="flex gap-2">
            <Textarea rows={2} value={b} placeholder={placeholder} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} className="min-h-0 resize-none bg-surface-2 text-sm" />
            <div className="flex flex-col gap-0.5">
              <Button size="icon" variant="ghost" className="size-6" disabled={i === 0} onClick={() => onChange(move(items, i, -1))} aria-label="Move bullet up"><ArrowUp className="size-3" /></Button>
              <Button size="icon" variant="ghost" className="size-6" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove bullet"><X className="size-3" /></Button>
            </div>
          </div>
        ))}
        <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => onChange([...items, ""])}><Plus className="size-3.5" /> Add bullet</Button>
      </div>
    </Field>
  );
}

export function TagInput({ items, onChange }: { items: string[]; onChange: (v: string[]) => void }) {
  const [v, setV] = useState("");
  const add = () => {
    const parts = v.split(",").map((s) => s.trim()).filter((s) => s && !items.includes(s));
    if (parts.length) onChange([...items, ...parts]);
    setV("");
  };
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder="Type a skill and press Enter (comma-separate many)" className="bg-surface-2" />
        <Button variant="secondary" onClick={add}>Add</Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((s, i) => (
          <span key={s} className="inline-flex items-center gap-1 rounded-md border bg-surface-2 py-1 pl-2.5 pr-1 text-sm">
            {s}
            <button className="rounded p-0.5 text-muted-foreground hover:text-foreground" onClick={() => onChange(move(items, i, -1))} aria-label={`Move ${s} earlier`}><ArrowUp className="size-3" /></button>
            <button className="rounded p-0.5 text-muted-foreground hover:text-destructive" onClick={() => onChange(items.filter((x) => x !== s))} aria-label={`Remove ${s}`}><X className="size-3" /></button>
          </span>
        ))}
      </div>
    </div>
  );
}

export function move<T>(arr: T[], i: number, d: number): T[] {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const c = [...arr];
  [c[i], c[j]] = [c[j], c[i]];
  return c;
}
