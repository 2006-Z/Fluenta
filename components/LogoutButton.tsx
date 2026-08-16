"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => {
        toast.success("Logged out");
        signOut({ callbackUrl: "/" });
      }}
      className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-sm text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <LogOut size={14} />
      Log out
    </button>
  );
}
