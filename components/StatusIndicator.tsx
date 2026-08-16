"use client";

import { motion } from "framer-motion";
import { Search, FileText } from "lucide-react";

export function StatusIndicator({
  label,
  icon = "search",
}: {
  label: string;
  icon?: "search" | "file";
}) {
  const Icon = icon === "file" ? FileText : Search;

  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-accent/30 bg-accent/10 px-4 py-2.5">
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="text-accent"
        >
          <Icon size={14} />
        </motion.span>
        <span className="text-sm text-foreground">{label}</span>
      </div>
    </div>
  );
}
