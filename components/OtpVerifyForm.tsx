"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, MailCheck } from "lucide-react";
import toast from "react-hot-toast";

export function OtpVerifyForm({
  email,
  title = "Check your email",
  onSubmit,
  onResend,
  onSwitchToPassword,
}: {
  email: string;
  title?: string;
  onSubmit: (code: string) => Promise<{ ok: boolean; error?: string }>;
  onResend: () => Promise<{ ok: boolean; error?: string }>;
  onSwitchToPassword?: () => void;
}) {
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setVerifying(true);
    try {
      const result = await onSubmit(code);
      if (!result.ok) {
        setError(result.error ?? "Invalid code");
        setShake((n) => n + 1);
        setVerifying(false);
        return;
      }
    } catch {
      setError("Network error — please try again");
      setShake((n) => n + 1);
      setVerifying(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      const result = await onResend();
      if (result.ok) {
        toast.success("New code sent");
      } else {
        toast.error(result.error ?? "Couldn't resend code");
      }
    } catch {
      toast.error("Couldn't resend code");
    } finally {
      setResending(false);
    }
  }

  return (
    <motion.form
      onSubmit={handleVerify}
      animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-border bg-surface p-8 shadow-sm"
    >
      <div className="mb-2 flex flex-col items-center gap-2 text-center">
        <MailCheck size={28} className="text-accent" />
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted">
          Enter the 6-digit code we sent to {email}
        </p>
      </div>

      <input
        required
        autoFocus
        inputMode="numeric"
        pattern="[0-9]{6}"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        className="rounded-lg border border-border bg-background px-3 py-2.5 text-center text-lg font-semibold tracking-[0.5em] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
        placeholder="000000"
      />

      {error && <p className="text-center text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={verifying || code.length !== 6}
        className="flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-accent to-accent-hover text-sm font-medium text-accent-foreground shadow-md shadow-accent/20 transition-all hover:brightness-110 hover:shadow-lg hover:shadow-accent/30 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {verifying && <Loader2 size={16} className="animate-spin" />}
        Verify
      </button>

      <button
        type="button"
        onClick={handleResend}
        disabled={resending}
        className="text-center text-sm font-medium text-accent hover:text-accent-hover disabled:opacity-60"
      >
        {resending ? "Sending…" : "Resend code"}
      </button>

      {onSwitchToPassword && (
        <button
          type="button"
          onClick={onSwitchToPassword}
          className="text-center text-sm font-medium text-muted hover:text-foreground"
        >
          Log in with password instead
        </button>
      )}
    </motion.form>
  );
}
