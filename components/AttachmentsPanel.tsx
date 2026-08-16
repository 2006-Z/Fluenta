"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Paperclip, X, ExternalLink } from "lucide-react";

type AttachmentSummary = {
  id: string;
  fileName: string;
  fileType: string;
};

export function AttachmentsPanel({
  attachments,
}: {
  attachments: AttachmentSummary[];
}) {
  const [preview, setPreview] = useState<AttachmentSummary | null>(null);

  if (attachments.length === 0) return null;

  const isPreviewable = (fileType: string) =>
    fileType === "application/pdf" || fileType.startsWith("image/");

  return (
    <>
      <div className="border-b border-border px-4 py-2.5">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <Paperclip size={13} />
            Attached:
          </span>
          {attachments.map((a) =>
            isPreviewable(a.fileType) ? (
              <button
                key={a.id}
                type="button"
                onClick={() => setPreview(a)}
                className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-foreground transition-colors hover:bg-surface-hover"
              >
                {a.fileName}
              </button>
            ) : (
              <a
                key={a.id}
                href={`/api/attachments/${a.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-foreground transition-colors hover:bg-surface-hover"
              >
                {a.fileName}
                <ExternalLink size={11} className="text-muted" />
              </a>
            )
          )}
        </div>
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {preview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex flex-col bg-black/60 p-4 sm:p-8"
                onClick={() => setPreview(null)}
              >
                <div
                  className="mx-auto flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-surface"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <span className="truncate text-sm font-medium text-foreground">
                      {preview.fileName}
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={`/api/attachments/${preview.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-hover hover:text-foreground"
                        aria-label="Open in new tab"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <button
                        type="button"
                        onClick={() => setPreview(null)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-hover hover:text-foreground"
                        aria-label="Close"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto bg-background">
                    {preview.fileType === "application/pdf" ? (
                      <iframe
                        src={`/api/attachments/${preview.id}`}
                        title={preview.fileName}
                        className="h-full w-full"
                      />
                    ) : (
                      <img
                        src={`/api/attachments/${preview.id}`}
                        alt={preview.fileName}
                        className="mx-auto max-h-full max-w-full object-contain"
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
