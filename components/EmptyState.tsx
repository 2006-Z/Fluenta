import { Briefcase } from "lucide-react";

export function EmptyState({ greeting }: { greeting: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
        <Briefcase size={22} />
      </div>
      <p className="max-w-sm text-sm text-muted">{greeting}</p>
    </div>
  );
}
