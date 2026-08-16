"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Request failed");
      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-8 text-center shadow-sm"
      >
        <CheckCircle2 size={28} className="text-success" />
        <h1 className="text-lg font-semibold text-foreground">Check your email</h1>
        <p className="text-sm text-muted">
          If an account exists for {email}, a password reset link is on its way.
        </p>
        <Link href="/login" className="mt-2 text-sm font-medium text-accent hover:text-accent-hover">
          Back to log in
        </Link>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-border bg-surface p-8 shadow-sm"
    >
      <div className="mb-2 text-center">
        <h1 className="text-xl font-semibold text-foreground">Forgot password</h1>
        <p className="mt-1 text-sm text-muted">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">Email</span>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-accent">
          <Mail size={16} className="text-muted" />
          <input
            required
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground outline-none"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-accent to-accent-hover text-sm font-medium text-accent-foreground shadow-md shadow-accent/20 transition-all hover:brightness-110 hover:shadow-lg hover:shadow-accent/30 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        Send reset link
      </button>

      <p className="text-center text-sm text-muted">
        <Link href="/login" className="font-medium text-accent hover:text-accent-hover">
          Back to log in
        </Link>
      </p>
    </form>
  );
}
