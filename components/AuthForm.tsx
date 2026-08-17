"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Loader2, Lock, Mail, UserRound, KeyRound, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { OtpVerifyForm } from "@/components/OtpVerifyForm";

type SignupStep = "email" | "otp" | "details";
type LoginStep = "email" | "password" | "otp";

const cardClass =
  "flex w-full max-w-md flex-col gap-4 rounded-2xl border border-border bg-surface p-8 shadow-sm";
const inputWrapClass =
  "flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-accent";
const inputClass = "w-full bg-transparent text-sm text-foreground outline-none";
const primaryButtonClass =
  "flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-accent to-accent-hover text-sm font-medium text-accent-foreground shadow-md shadow-accent/20 transition-all hover:brightness-110 hover:shadow-lg hover:shadow-accent/30 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";
const backLinkClass =
  "flex items-center gap-1 self-start text-sm text-muted hover:text-foreground";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignup = mode === "signup";

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);

  const [signupStep, setSignupStep] = useState<SignupStep>("email");
  const [loginStep, setLoginStep] = useState<LoginStep>("email");

  function fail(message: string) {
    setError(message);
    setShake((n) => n + 1);
    toast.error(message);
  }

  async function afterSignIn(welcomeMessage: string, startNewChat = false) {
    // router.refresh() is required here, not optional — Navbar (and the
    // "Admin" link) lives in the root layout, a segment shared with the
    // pre-login page. router.push() alone reuses that shared segment's
    // already-rendered (logged-out) RSC payload instead of re-fetching it,
    // so without refresh() the navbar silently stays stale after login.
    if (startNewChat) {
      try {
        const res = await fetch("/api/conversations", { method: "POST" });
        const data = await res.json();
        if (res.ok) {
          toast.success(welcomeMessage);
          router.push(`/chat/${data.id}`);
          router.refresh();
          return;
        }
      } catch {
        // fall through to history list below
      }
    }

    toast.success(welcomeMessage);
    const callbackUrl = searchParams.get("callbackUrl");
    router.push(callbackUrl || "/chat");
    router.refresh();
  }

  // ---------- Signup ----------

  async function handleSignupEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        fail(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }
      setLoading(false);
      setSignupStep("otp");
    } catch {
      fail("Network error — please try again");
      setLoading(false);
    }
  }

  async function handleSignupOtpSubmit(code: string) {
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "Invalid code" };
    setSignupStep("details");
    return { ok: true };
  }

  async function handleSignupOtpResend() {
    const res = await fetch("/api/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    return res.ok ? { ok: true } : { ok: false, error: data.error };
  }

  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/signup/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        fail(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        toast.success("Account created — please log in");
        router.push("/login");
        return;
      }
      await afterSignIn("Welcome to Fluenta!", true);
    } catch {
      fail("Network error — please try again");
      setLoading(false);
    }
  }

  // ---------- Login ----------

  async function handleLoginEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "login" }),
      });
      const data = await res.json();
      if (!res.ok) {
        fail(data.error ?? "No account found with that email");
        setLoading(false);
        return;
      }
      setLoading(false);
      setLoginStep("password");
    } catch {
      fail("Network error — please try again");
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      fail("Invalid email or password");
      setLoading(false);
      return;
    }
    await afterSignIn("Welcome back!");
  }

  async function handleSendLoginOtp() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        fail(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }
      setLoading(false);
      setLoginStep("otp");
    } catch {
      fail("Network error — please try again");
      setLoading(false);
    }
  }

  async function handleLoginOtpSubmit(code: string) {
    const result = await signIn("credentials", { email, otp: code, redirect: false });
    if (result?.error) {
      return { ok: false, error: "Invalid or expired code" };
    }
    await afterSignIn("Welcome back!");
    return { ok: true };
  }

  async function handleLoginOtpResend() {
    const res = await fetch("/api/login-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    return res.ok ? { ok: true } : { ok: false, error: data.error };
  }

  // ---------- Render: OTP steps (shared component) ----------

  if (isSignup && signupStep === "otp") {
    return (
      <OtpVerifyForm
        email={email}
        onSubmit={handleSignupOtpSubmit}
        onResend={handleSignupOtpResend}
      />
    );
  }

  if (!isSignup && loginStep === "otp") {
    return (
      <OtpVerifyForm
        email={email}
        title="Enter your login code"
        onSubmit={handleLoginOtpSubmit}
        onResend={handleLoginOtpResend}
        onSwitchToPassword={() => setLoginStep("password")}
      />
    );
  }

  // ---------- Render: signup details step ----------

  if (isSignup && signupStep === "details") {
    return (
      <motion.form
        onSubmit={handleDetailsSubmit}
        animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.4 }}
        className={cardClass}
      >
        <div className="mb-2 text-center">
          <h1 className="text-xl font-semibold text-foreground">Almost done</h1>
          <p className="mt-1 text-sm text-muted">Set your name and a password</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Name</span>
          <div className={inputWrapClass}>
            <UserRound size={16} className="text-muted" />
            <input
              required
              autoFocus
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Password</span>
          <div className={inputWrapClass}>
            <Lock size={16} className="text-muted" />
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button type="submit" disabled={loading} className={`mt-2 ${primaryButtonClass}`}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          Create account
        </button>
      </motion.form>
    );
  }

  // ---------- Render: login password step ----------

  if (!isSignup && loginStep === "password") {
    return (
      <motion.form
        onSubmit={handlePasswordSubmit}
        animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.4 }}
        className={cardClass}
      >
        <button
          type="button"
          onClick={() => setLoginStep("email")}
          className={backLinkClass}
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="mb-2 text-center">
          <h1 className="text-xl font-semibold text-foreground">Enter your password</h1>
          <p className="mt-1 text-sm text-muted">{email}</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Password</span>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-accent hover:text-accent-hover"
            >
              Forgot password?
            </Link>
          </div>
          <div className={inputWrapClass}>
            <Lock size={16} className="text-muted" />
            <input
              required
              autoFocus
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          Log in
        </button>

        <button
          type="button"
          onClick={handleSendLoginOtp}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 text-center text-sm font-medium text-accent hover:text-accent-hover disabled:opacity-60"
        >
          <KeyRound size={14} />
          Log in with code instead
        </button>
      </motion.form>
    );
  }

  // ---------- Render: email step (shared entry point) ----------

  return (
    <motion.form
      onSubmit={isSignup ? handleSignupEmailSubmit : handleLoginEmailSubmit}
      animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
      transition={{ duration: 0.4 }}
      className={cardClass}
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

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">Email</span>
        <div className={inputWrapClass}>
          <Mail size={16} className="text-muted" />
          <input
            required
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button type="submit" disabled={loading} className={`mt-2 ${primaryButtonClass}`}>
        {loading && <Loader2 size={16} className="animate-spin" />}
        Continue
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
