import Link from "next/link";
import { ArrowRight, Search, MessagesSquare, Target, Building2, Briefcase, Users } from "lucide-react";

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
    </div>
  );
}
