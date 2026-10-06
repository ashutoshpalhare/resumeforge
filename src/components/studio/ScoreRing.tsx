import { cn } from "@/lib/utils";

export function scoreTone(s: number) {
  return s >= 75 ? "text-success" : s >= 50 ? "text-warning" : "text-destructive";
}

export function ScoreRing({ score, size = 120, className }: { score: number; size?: number; className?: string }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className={cn("relative grid place-items-center", className)} style={{ width: size, height: size }} role="img" aria-label={`ATS score ${score} out of 100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="6" className="stroke-muted" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} className={cn("stroke-current transition-all duration-700", scoreTone(score))} />
      </svg>
      <div className="absolute text-center">
        <p className={cn("font-mono text-3xl font-medium tabular-nums", scoreTone(score))}>{score}</p>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">ATS score</p>
      </div>
    </div>
  );
}
