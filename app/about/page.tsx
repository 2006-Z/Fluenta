import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "About — Fluenta" };

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-16">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Back home
      </Link>
      <h1 className="mb-4 text-3xl font-semibold text-foreground">About Fluenta</h1>
      <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted">
        <p>
          Fluenta is an AI-powered, company-specific interview prep coach. Tell it the company
          and role you&apos;re interviewing for, and it researches them, plans a realistic mock
          interview, roleplays it with you, and gives you an honest report — correcting your
          English along the way.
        </p>
        <p>
          It&apos;s built for candidates in India preparing for their next job, especially those
          who want to practice both what they&apos;ll say and how they&apos;ll say it in
          English.
        </p>
      </div>
    </div>
  );
}
