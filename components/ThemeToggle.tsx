"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

function applyStoredTheme(): boolean {
  const stored = window.localStorage.getItem("theme");
  const isDark = stored
    ? stored === "dark"
    : window.matchMedia("(prefers-color-scheme: dark)").matches;

  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.classList.toggle("light", !isDark);
  return isDark;
}

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Reading the real theme (localStorage/system) must happen post-mount to
    // avoid an SSR/client mismatch, so this one-time sync can't be lazy state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(applyStoredTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.classList.toggle("light", !next);
    window.localStorage.setItem("theme", next ? "dark" : "light");
  }

  const showDark = mounted && isDark;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <motion.span
        key={showDark ? "moon" : "sun"}
        initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="flex items-center justify-center"
      >
        {showDark ? <Moon size={16} /> : <Sun size={16} />}
      </motion.span>
    </button>
  );
}
