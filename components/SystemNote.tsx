import { Sparkles } from "lucide-react";

export function SystemNote({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2.5 text-sm text-foreground">
      <Sparkles size={14} className="mt-0.5 shrink-0 text-accent" />
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-accent">
          Fluenta
        </span>
        <span>{text}</span>
      </div>
    </div>
  );
}
