import { ArrowDown, ArrowUp, Plus, Trash2, X, type LucideIcon } from "lucide-react";
import { cloneElement, isValidElement, useId, useState, type ReactElement, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/** Label + control + hint, with the label programmatically linked to the control. */
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, { id, "aria-describedby": hintId })
    : children;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">{label}</Label>
      {control}
      {hint && <p id={hintId} className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextField({ label, value, onChange, placeholder, type = "text", hint }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; hint?: string }) {
  return (
    <Field label={label} hint={hint}>
      <Input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="h-10 bg-surface-2" />
    </Field>
  );
}

export function SectionHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b pb-5">
      <div className="min-w-0">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed bg-surface/50 px-6 py-12 text-center">
      <div className="grid size-10 place-items-center rounded-full bg-surface-2 text-muted-foreground">
        <Icon className="size-5" aria-hidden />
      </div>
      <p className="mt-4 text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function EntryCard({ title, subtitle, onUp, onDown, onDelete, children }: { title: string; subtitle?: string; onUp?: () => void; onDown?: () => void; onDelete: () => void; children: ReactNode }) {
  return (
    <section aria-label={title} className="rounded-xl border bg-surface p-5 transition-colors focus-within:border-primary/30">
      <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{title}</p>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 gap-0.5">
          <Button size="icon" variant="ghost" className="size-8" onClick={onUp} disabled={!onUp} aria-label={`Move ${title} up`}><ArrowUp className="size-4" /></Button>
          <Button size="icon" variant="ghost" className="size-8" onClick={onDown} disabled={!onDown} aria-label={`Move ${title} down`}><ArrowDown className="size-4" /></Button>
          <Button size="icon" variant="ghost" className="size-8 text-muted-foreground hover:text-destructive" onClick={onDelete} aria-label={`Delete ${title}`}><Trash2 className="size-4" /></Button>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function BulletList({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</legend>
      {items.map((b, i) => (
        <div key={i} className="flex gap-2">
          <Textarea
            rows={2}
            value={b}
            placeholder={placeholder}
            aria-label={`${label} ${i + 1}`}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
            className="min-h-0 resize-y bg-surface-2 text-sm leading-relaxed"
          />
          <div className="flex flex-col gap-0.5">
            <Button size="icon" variant="ghost" className="size-7" disabled={i === 0} onClick={() => onChange(move(items, i, -1))} aria-label={`Move item ${i + 1} up`}><ArrowUp className="size-3.5" /></Button>
            <Button size="icon" variant="ghost" className="size-7 hover:text-destructive" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={`Remove item ${i + 1}`}><X className="size-3.5" /></Button>
          </div>
        </div>
      ))}
      <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => onChange([...items, ""])}><Plus className="size-3.5" /> Add item</Button>
    </fieldset>
  );
}

export function TagInput({ items, onChange }: { items: string[]; onChange: (v: string[]) => void }) {
  const [v, setV] = useState("");
  const add = () => {
    const lower = items.map((s) => s.toLowerCase());
    const parts = v.split(",").map((s) => s.trim()).filter((s, i, a) => s && !lower.includes(s.toLowerCase()) && a.indexOf(s) === i);
    if (parts.length) onChange([...items, ...parts]);
    setV("");
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input aria-label="Add a skill" value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder="Type a skill and press Enter — comma-separate several" className="h-10 bg-surface-2" />
        <Button variant="secondary" className="h-10" onClick={add} disabled={!v.trim()}>Add</Button>
      </div>
      {items.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Skills">
          {items.map((s, i) => (
            <li key={s} className="inline-flex items-center gap-0.5 rounded-md border bg-surface-2 py-1 pl-2.5 pr-1 text-sm">
              {s}
              <button className="ml-1 rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={i === 0} onClick={() => onChange(move(items, i, -1))} aria-label={`Move ${s} earlier`}><ArrowUp className="size-3" /></button>
              <button className="rounded p-1 text-muted-foreground hover:text-destructive" onClick={() => onChange(items.filter((x) => x !== s))} aria-label={`Remove ${s}`}><X className="size-3" /></button>
            </li>
          ))}
        </ul>
      )}
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
