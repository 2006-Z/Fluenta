"use client";

import { motion } from "framer-motion";
import { Search, FileText } from "lucide-react";

export function StatusIndicator({
  label,
  icon = "search",
  progress,
}: {
  label: string;
  icon?: "search" | "file";
  /** 0-100. When provided, shows a determinate progress bar instead of the spin animation. */
  progress?: number;
}) {
  const Icon = icon === "file" ? FileText : Search;
  const isDeterminate = typeof progress === "number";

  return (
    <div className="flex justify-start">
      <div className="flex min-w-[180px] items-center gap-2 rounded-2xl rounded-bl-sm border border-accent/30 bg-accent/10 px-4 py-2.5">
        {isDeterminate ? (
          <Icon size={14} className="shrink-0 text-accent" />
        ) : (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="shrink-0 text-accent"
          >
            <Icon size={14} />
          </motion.span>
        )}
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-sm text-foreground">
            {label}
            {isDeterminate ? ` ${progress}%` : ""}
          </span>
          {isDeterminate && (
            <div className="h-1 w-full overflow-hidden rounded-full bg-accent/15">
              <motion.div
                className="h-full rounded-full bg-accent"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.15 }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
