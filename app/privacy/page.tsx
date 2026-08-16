import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Privacy Policy — Fluenta" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Back home
      </Link>
      <h1 className="mb-2 text-3xl font-semibold text-foreground">Privacy Policy</h1>
      <p className="mb-10 text-sm text-muted">Last updated: August 2026</p>

      <div className="flex flex-col gap-8 text-sm leading-relaxed text-muted [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground">
        <section>
          <h2>What we collect</h2>
          <p>
            Your name, email, and password (stored as a secure hash, never in plain text); the
            conversations, messages, and files (like resumes) you create while using Fluenta;
            and basic usage data needed to run the service.
          </p>
        </section>

        <section>
          <h2>How we use it</h2>
          <p>
            To run your practice sessions (research, roleplay, feedback, reports, and lessons),
            personalize them using anything you&apos;ve shared (resume, job description), send
            account-related emails (verification codes, password resets), and improve the
            product.
          </p>
        </section>

        <section>
          <h2>AI processing</h2>
          <p>
            Your messages and uploaded documents are sent to our AI providers to generate
            replies, research, and feedback. We don&apos;t sell this data.
          </p>
        </section>

        <section>
          <h2>Data retention & deletion</h2>
          <p>
            You can delete individual conversations or your entire account at any time from
            Account settings — this permanently removes your conversations, messages, and
            uploaded files.
          </p>
        </section>

        <section>
          <h2>Security</h2>
          <p>
            Passwords are hashed with bcrypt and never stored in plain text. Data is encrypted
            in transit. Access to production data is restricted to what&apos;s needed to
            operate the service.
          </p>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>
            Fluenta uses a session cookie to keep you logged in. We don&apos;t use third-party
            advertising or tracking cookies.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about this policy? Reach out via the{" "}
            <Link href="/contact" className="text-accent hover:text-accent-hover">
              contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
