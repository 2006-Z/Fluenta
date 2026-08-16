import Link from "next/link";
import {
  ArrowRight,
  Search,
  MessagesSquare,
  Target,
  Building2,
  Briefcase,
  Users,
  Sparkles,
  Zap,
  BookOpen,
} from "lucide-react";
import { FAQAccordion } from "@/components/FAQAccordion";

const steps = [
  {
    icon: Target,
    title: "Tell us your target",
    description:
      "Tell your coach the company and role you're interviewing for, right in the chat.",
  },
  {
    icon: Search,
    title: "We research it",
    description:
      "Your AI coach researches the company, the role, and realistic interview questions before you even start.",
  },
  {
    icon: MessagesSquare,
    title: "Practice the real thing",
    description:
      "Roleplay the actual interview with an AI interviewer for that company, with every English mistake corrected live.",
  },
];

const stats = [
  { icon: Building2, value: "500+", label: "Companies researched" },
  { icon: Briefcase, value: "1,200+", label: "Roles covered" },
  { icon: Users, value: "10,000+", label: "Interviews practiced" },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="relative flex w-full flex-1 flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, color-mix(in srgb, var(--accent) 18%, transparent), transparent)",
          }}
        />
        <span className="mb-4 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
          AI-powered, company-specific interview prep
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Prep for{" "}
          <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
            your exact interview
          </span>{" "}
          — not a generic one
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted">
          Tell Fluenta the company and role you&apos;re interviewing for. It
          researches them, then roleplays that real interview with you —
          correcting your English along the way.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-accent to-accent-hover px-6 text-sm font-medium text-accent-foreground shadow-md shadow-accent/20 transition-all hover:brightness-110 hover:shadow-lg hover:shadow-accent/30"
          >
            Start practicing free
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="flex h-11 items-center justify-center rounded-full border border-border bg-surface px-6 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
          >
            Log in
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <step.icon size={20} />
                </div>
                <span className="text-xs font-medium text-muted">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-24">
        <div className="rounded-2xl border border-border bg-surface p-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <stat.icon size={20} />
                </div>
                <p className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-2xl font-semibold text-transparent">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-muted">
            Sample figures — live stats coming soon
          </p>
        </div>
      </section>

      {/* Feature highlight */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-24">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
              See your mistakes, live, mid-conversation
            </h2>
            <p className="text-muted">
              Fluenta doesn&apos;t just quiz you — it roleplays the actual interview, and
              corrects your English right where you made the mistake, without breaking the
              flow of the conversation.
            </p>
            <ul className="flex flex-col gap-3 text-sm text-foreground">
              <li className="flex items-start gap-2.5">
                <Zap size={16} className="mt-0.5 shrink-0 text-accent" />
                Inline corrections with a tap-to-reveal &ldquo;why&rdquo;
              </li>
              <li className="flex items-start gap-2.5">
                <Sparkles size={16} className="mt-0.5 shrink-0 text-accent" />
                Honest feedback on whether you actually answered the question
              </li>
              <li className="flex items-start gap-2.5">
                <BookOpen size={16} className="mt-0.5 shrink-0 text-accent" />
                A personalized lesson if your mock interview needs work
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted">
              <Briefcase size={13} />
              Amit — Interviewer at Zoho
            </div>
            <div className="flex flex-col gap-3">
              <div className="ml-auto flex max-w-[85%] flex-col items-start gap-2 rounded-2xl rounded-br-sm border border-accent/20 bg-accent/15 px-4 py-2.5 text-sm text-foreground">
                I have worked on backend since 2 year and I very intrested for this job
              </div>
              <div className="flex max-w-[90%] flex-col gap-2 rounded-2xl rounded-bl-sm border border-border bg-background px-4 py-2.5 text-sm">
                <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs">
                  <span className="text-danger line-through">very intrested</span>{" "}
                  <span className="text-muted">→</span>{" "}
                  <span className="font-medium text-success">very interested</span>
                </div>
                <p className="text-foreground">
                  Good to hear! Can you walk me through a specific backend project you&apos;re
                  proud of?
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-3xl px-4 pb-24">
        <h2 className="mb-8 text-center text-2xl font-semibold text-foreground sm:text-3xl">
          Frequently asked questions
        </h2>
        <FAQAccordion />
      </section>

      {/* Pricing */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-24">
        <h2 className="mb-8 text-center text-2xl font-semibold text-foreground sm:text-3xl">
          Pricing
        </h2>
        <div className="mx-auto max-w-sm rounded-2xl border border-accent/30 bg-surface p-8 text-center shadow-sm">
          <span className="mb-3 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            Free while in beta
          </span>
          <p className="mb-1 text-4xl font-semibold text-foreground">₹0</p>
          <p className="mb-6 text-sm text-muted">All features, no card required</p>
          <ul className="mb-6 flex flex-col gap-2.5 text-left text-sm text-foreground">
            <li className="flex items-center gap-2">
              <Zap size={14} className="text-accent" /> Company-specific research
            </li>
            <li className="flex items-center gap-2">
              <Zap size={14} className="text-accent" /> Live English corrections
            </li>
            <li className="flex items-center gap-2">
              <Zap size={14} className="text-accent" /> Interview report &amp; lessons
            </li>
          </ul>
          <Link
            href="/signup"
            className="flex h-11 w-full items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-hover text-sm font-medium text-accent-foreground shadow-md shadow-accent/20 transition-all hover:brightness-110"
          >
            Start practicing free
          </Link>
        </div>
      </section>

      {/* Final CTA band */}
      <section className="w-full border-y border-border bg-surface px-4 py-16 text-center">
        <h2 className="mb-3 text-2xl font-semibold text-foreground sm:text-3xl">
          Ready for your next interview?
        </h2>
        <p className="mx-auto mb-6 max-w-md text-muted">
          Tell Fluenta the company and role — it takes care of the rest.
        </p>
        <Link
          href="/signup"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-accent to-accent-hover px-6 text-sm font-medium text-accent-foreground shadow-md shadow-accent/20 transition-all hover:brightness-110 hover:shadow-lg hover:shadow-accent/30"
        >
          Start practicing free
          <ArrowRight size={16} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="w-full px-4 py-12">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles size={16} className="text-accent" />
              Fluenta
            </span>
            <p className="max-w-xs text-center text-xs text-muted sm:text-left">
              AI-powered, company-specific interview prep.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-center text-xs text-muted">
          © 2026 Fluenta. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
