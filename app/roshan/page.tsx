import type { Metadata } from "next";
import Link from "next/link";
import {
  Mail,
  MapPin,
  GraduationCap,
  Sparkles,
  Terminal as TerminalIcon,
  Camera,
  ArrowUpRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Roshan Kumar",
  description:
    "Roshan Kumar — building small AI-powered tools and apps, one project at a time.",
};

// Inline brand marks: lucide-react 1.x dropped Github/Linkedin, so these are
// drawn by hand instead of pulling in a whole extra icon package for two glyphs.
function GithubMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 5.02 3.26 9.28 7.78 10.78.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.17.69-3.84-1.35-3.84-1.35-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.73 2.65 1.23 3.3.94.1-.73.4-1.23.72-1.51-2.53-.29-5.19-1.27-5.19-5.63 0-1.24.44-2.26 1.17-3.06-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.14 1.17a10.9 10.9 0 0 1 5.72 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.57.23 2.73.11 3.02.73.8 1.17 1.82 1.17 3.06 0 4.37-2.67 5.33-5.21 5.62.41.36.77 1.06.77 2.14 0 1.55-.01 2.79-.01 3.17 0 .3.2.66.79.55A11.26 11.26 0 0 0 23.25 11.75C23.25 5.48 18.27.5 12 .5Z" />
    </svg>
  );
}
function LinkedinMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

const socials = [
  {
    label: "GitHub",
    href: "https://github.com/2006-Z",
    icon: GithubMark,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/mrs-player",
    icon: LinkedinMark,
  },
  {
    label: "Email",
    href: "mailto:iamaroshankumar@gmail.com",
    icon: Mail,
  },
];

const projects = [
  {
    title: "Fluenta AI",
    tagline: "AI-powered, company-specific interview coach",
    description:
      "Tell it a company and role, it researches them live and roleplays that exact interview with you — correcting your English as you answer.",
    stack: ["Next.js", "TypeScript", "Prisma", "NextAuth", "Vercel AI SDK"],
    icon: Sparkles,
    href: "https://www.fluenta.website",
    linkLabel: "Visit live site",
    status: "Live",
  },
  {
    title: "Terminal",
    tagline: "A low-cost, agentic AI coding assistant for the CLI",
    description:
      "Type a task into the terminal and it loops on its own — retrieving context, running shell commands in a popup window, and asking for input — until the job is done. Every AI call's token cost is tracked on a local dashboard.",
    stack: ["Python", "SQLite", "LLM APIs"],
    icon: TerminalIcon,
    href: null,
    linkLabel: "Runs locally · CLI tool",
    status: "In progress",
  },
  {
    title: "PCC Automation",
    tagline: "Bulk police-verification screenshot tool",
    description:
      "Reads an Excel list of applications, drives a real browser through the UP Police PCC portal, and saves a screenshot of each result — turning a manual, one-by-one verification chore into an unattended batch run.",
    stack: ["Node.js", "Express", "Playwright"],
    icon: Camera,
    href: null,
    linkLabel: "Desktop tool",
    status: "Live",
  },
];

export default function PortfolioPage() {
  return (
    <div className="min-h-full bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 pt-8">
        <span className="text-sm font-medium text-muted">roshan.dev</span>
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-16 px-4 pb-24 pt-10">
        {/* Hero */}
        <section className="flex flex-col gap-5">
          <span className="w-fit rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
            Available for internships &amp; entry-level roles
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Roshan Kumar
          </h1>
          <p className="max-w-xl text-lg text-muted">
            I build small, real, end-to-end products — an AI interview coach,
            an agentic CLI tool, and browser automation that replaces a
            manual chore — while finishing my BCA.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <GraduationCap size={15} className="text-accent" />
              BCA (in progress) — IGNOU
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={15} className="text-accent" />
              New Delhi, India
            </span>
          </div>

          <div className="mt-2 flex items-center gap-3">
            {socials.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-hover hover:text-accent"
              >
                <s.icon size={17} />
              </Link>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="flex flex-col gap-5">
          <h2 className="text-xl font-semibold">Projects</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {projects.map((p) => (
              <div
                key={p.title}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <p.icon size={19} />
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      p.status === "Live"
                        ? "bg-success-bg text-success"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground">{p.title}</h3>
                  <p className="text-sm text-muted">{p.tagline}</p>
                </div>

                <p className="text-sm text-foreground/90">{p.description}</p>

                <div className="flex flex-wrap gap-1.5">
                  {p.stack.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {p.href ? (
                  <Link
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"
                  >
                    {p.linkLabel}
                    <ArrowUpRight size={14} />
                  </Link>
                ) : (
                  <span className="mt-1 text-sm font-medium text-muted">
                    {p.linkLabel}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-4xl px-4 pb-10 text-xs text-muted">
        © {new Date().getFullYear()} Roshan Kumar ·{" "}
        <a
          href="mailto:iamaroshankumar@gmail.com"
          className="hover:text-accent"
        >
          iamaroshankumar@gmail.com
        </a>
      </footer>
    </div>
  );
}
