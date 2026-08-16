import Link from "next/link";
import { Sparkles, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AccountMenu } from "@/components/AccountMenu";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link
          href={session ? "/chat" : "/"}
          className="flex items-center gap-2 font-semibold text-foreground"
        >
          <Sparkles size={18} className="text-accent" />
          Fluenta
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {session ? (
            <>
              {session.user.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
                >
                  <ShieldCheck size={14} className="text-accent" />
                  Admin
                </Link>
              )}
              <span className="hidden text-sm text-muted sm:inline">
                {session.user.name}
              </span>
              <AccountMenu preferredLanguage={session.user.preferredLanguage} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-foreground hover:text-accent"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="flex h-9 items-center rounded-full bg-gradient-to-br from-accent to-accent-hover px-4 text-sm font-medium text-accent-foreground shadow-sm shadow-accent/20 transition-all hover:brightness-110"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
