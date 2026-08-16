"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { Settings, KeyRound, LogOut, Trash2, Languages, X } from "lucide-react";
import toast from "react-hot-toast";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { DeleteAccountForm } from "@/components/DeleteAccountForm";
import { ChangeLanguageForm } from "@/components/ChangeLanguageForm";

type ModalType = "password" | "delete" | "language" | null;

export function AccountMenu({ preferredLanguage }: { preferredLanguage: string }) {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Account settings"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <Settings size={15} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-xl border border-border bg-surface py-1.5 shadow-lg"
            >
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setModal("password");
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-surface-hover"
              >
                <KeyRound size={15} className="text-muted" />
                Change password
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setModal("language");
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-surface-hover"
              >
                <Languages size={15} className="text-muted" />
                Feedback language
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  toast.success("Logged out");
                  signOut({ callbackUrl: "/" });
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-surface-hover"
              >
                <LogOut size={15} className="text-muted" />
                Log out
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setModal("delete");
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-danger transition-colors hover:bg-danger-bg"
              >
                <Trash2 size={15} />
                Delete account
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {modal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-10"
                onClick={() => setModal(null)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative my-auto w-full max-w-sm"
                >
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    aria-label="Close"
                    className="absolute -right-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-sm transition-colors hover:bg-surface-hover hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                  {modal === "password" && (
                    <ChangePasswordForm onSaved={() => setModal(null)} />
                  )}
                  {modal === "delete" && <DeleteAccountForm />}
                  {modal === "language" && (
                    <ChangeLanguageForm
                      currentLanguage={preferredLanguage}
                      onSaved={() => setModal(null)}
                    />
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
