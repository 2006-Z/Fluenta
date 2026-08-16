"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Loader2, Lock, AtSign, Mail, UserRound, Languages } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { OtpVerifyForm } from "@/components/OtpVerifyForm";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [awaitingOtp, setAwaitingOtp] = useState(false);

  const isSignup = mode === "signup";

  function fail(message: string) {
    setError(message);
    setShake((n) => n + 1);
    toast.error(message);
  }

  async function completeSignIn(welcomeMessage: string, startNewChat = false) {
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      fail("Invalid username or password");
      setLoading(false);
      return;
    }

    toast.success(welcomeMessage);

    if (startNewChat) {
      try {
        const res = await fetch("/api/conversations", { method: "POST" });
        const data = await res.json();
        if (res.ok) {
          router.push(`/chat/${data.id}`);
          router.refresh();
          return;
        }
      } catch {
        // fall through to history list below
      }
    }

    const callbackUrl = searchParams.get("callbackUrl");
    router.push(callbackUrl || "/chat");
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignup) {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, name, email, preferredLanguage }),
        });
        const data = await res.json();
        if (!res.ok) {
          fail(data.error ?? "Something went wrong");
          setLoading(false);
          return;
        }
        setLoading(false);
        setAwaitingOtp(true);
        return;
      }

      await completeSignIn("Welcome back!");
    } catch {
      fail("Network error — please try again");
      setLoading(false);
    }
  }

  if (awaitingOtp) {
    return (
      <OtpVerifyForm
        email={email}
        onVerified={() => completeSignIn("Welcome to Fluenta!", true)}
      />
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-border bg-surface p-8 shadow-sm"
    >
      <div className="mb-2 text-center">
        <h1 className="text-xl font-semibold text-foreground">
          {isSignup ? "Welcome" : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isSignup
            ? "Start practicing career English today"
            : "Log in to continue your practice"}
        </p>
      </div>

      {isSignup && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Name</span>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-accent">
            <UserRound size={16} className="text-muted" />
            <input
              required
              autoFocus
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none"
              placeholder="Your name"
              autoComplete="name"
            />
          </div>
        </label>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">Username</span>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-accent">
          <AtSign size={16} className="text-muted" />
          <input
            required
            autoFocus={!isSignup}
            minLength={3}
            maxLength={24}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground outline-none"
            placeholder="yourusername"
            autoComplete="username"
          />
        </div>
      </label>

      {isSignup && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Email</span>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-accent">
            <Mail size={16} className="text-muted" />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
        </label>
      )}

      {isSignup && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">
            Feedback language
          </span>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-accent">
            <Languages size={16} className="text-muted" />
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full bg-background text-sm text-foreground outline-none"
            >
              <option value="English" className="bg-background text-foreground">
                English
              </option>
              <option value="Hindi" className="bg-background text-foreground">
                Hindi
              </option>
              <option value="Hinglish" className="bg-background text-foreground">
                Hinglish (Hindi + English mix)
              </option>
            </select>
          </div>
          <span className="text-xs text-muted">
            We&apos;ll explain how to improve your answers in this language —
            your mock interview itself always stays in English.
          </span>
        </label>
      )}

      <label className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Password</span>
          {!isSignup && (
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-accent hover:text-accent-hover"
            >
              Forgot password?
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-accent">
          <Lock size={16} className="text-muted" />
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground outline-none"
            placeholder="••••••••"
            autoComplete={isSignup ? "new-password" : "current-password"}
          />
        </div>
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-accent to-accent-hover text-sm font-medium text-accent-foreground shadow-md shadow-accent/20 transition-all hover:brightness-110 hover:shadow-lg hover:shadow-accent/30 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {isSignup ? "Sign up" : "Log in"}
      </button>

      <p className="text-center text-sm text-muted">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-medium text-accent hover:text-accent-hover"
        >
          {isSignup ? "Log in" : "Sign up"}
        </Link>
      </p>
    </motion.form>
  );
}
