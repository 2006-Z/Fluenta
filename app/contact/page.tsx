import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export const metadata = { title: "Contact — Fluenta" };

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-16">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Back home
      </Link>
      <h1 className="mb-4 text-3xl font-semibold text-foreground">Contact</h1>
      <p className="mb-6 text-sm leading-relaxed text-muted">
        Questions, feedback, or something not working right? Reach out and we&apos;ll get back
        to you.
      </p>
      <a
        href="mailto:hello@fluenta.website"
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
      >
        <Mail size={16} className="text-accent" />
        hello@fluenta.website
      </a>
    </div>
  );
}
