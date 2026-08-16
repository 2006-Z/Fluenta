import { Sparkles } from "lucide-react";
import { CorrectionCard } from "@/components/CorrectionCard";
import type { Correction } from "@/lib/parseCorrections";

export function FeedbackBlock({
  feedback,
  corrections,
}: {
  feedback: string;
  corrections: Correction[];
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-accent/30 bg-accent/10 p-3">
      <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-accent">
        <Sparkles size={12} />
        Fluenta
      </span>
      {feedback && (
        <p className="text-sm leading-relaxed text-foreground">{feedback}</p>
      )}
      {corrections.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Just a few corrections
          </p>
          {corrections.map((c, i) => (
            <CorrectionCard key={i} wrong={c.wrong} fix={c.fix} why={c.why} />
          ))}
        </div>
      )}
    </div>
  );
}
