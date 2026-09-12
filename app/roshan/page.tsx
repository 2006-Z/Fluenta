import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Outfit, Fraunces } from "next/font/google";
import { ThemeToggle } from "@/components/ThemeToggle";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"] });

export const metadata: Metadata = {
  title: "Roshan Kumar",
  description: "Roshan Kumar",
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
function ArrowGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const contacts = [
  { label: "Email", href: "mailto:iamaroshankumar@gmail.com", icon: null },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/mrs-player", icon: LinkedinMark },
  { label: "GitHub", href: "https://github.com/2006-Z", icon: GithubMark },
];

const repos = [
  { name: "PCC-Automation", href: "https://github.com/2006-Z/PCC-Automation" },
  { name: "Terminal", href: "https://github.com/2006-Z/Terminal" },
  { name: "Cute", href: "https://github.com/2006-Z/Cute" },
];

const sites = [
  { name: "Fluenta AI", href: "/fluenta" },
  { name: "PCC Automation", href: "/pcc" },
];

function LinkRow({ name, href }: { name: string; href: string }) {
  const isExternal = href.startsWith("http");
  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group flex items-center justify-between border-b border-border py-4 text-foreground transition-colors last:border-0 hover:text-accent"
    >
      <span className="text-[15px] font-medium">{name}</span>
      <ArrowGlyph className="h-4 w-4 text-muted transition-colors group-hover:text-accent" />
    </Link>
  );
}

export default function PortfolioPage() {
  return (
    <div className={`min-h-full bg-background text-foreground ${outfit.className}`}>
      <div className="flex justify-end px-6 pt-6">
        <ThemeToggle />
      </div>

      <main className="mx-auto flex w-full max-w-md flex-col px-6 pb-24 pt-6">
        <Image
          src="/roshan-avatar.png"
          alt="Roshan Kumar"
          width={84}
          height={84}
          className="h-[84px] w-[84px] rounded-full object-cover"
          priority
        />

        <h1 className={`${fraunces.className} mt-6 text-[34px] leading-tight text-foreground`}>
          Roshan Kumar
        </h1>

        <div className="mt-5 flex items-center gap-5">
          {contacts.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
              aria-label={c.label}
              className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
            >
              {c.icon ? <c.icon className="h-4 w-4" /> : null}
              {c.label}
            </Link>
          ))}
        </div>

        <section className="mt-14">
          <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            GitHub Repositories
          </h2>
          <div className="mt-2">
            {repos.map((r) => (
              <LinkRow key={r.name} name={r.name} href={r.href} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            Websites
          </h2>
          <div className="mt-2">
            {sites.map((s) => (
              <LinkRow key={s.name} name={s.name} href={s.href} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
