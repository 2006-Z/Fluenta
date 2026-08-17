import { Paperclip, ExternalLink } from "lucide-react";

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
  if (attachments.length === 0) return null;

  return (
    <div className="border-b border-border px-4 py-2.5">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <Paperclip size={13} />
          Attached:
        </span>
        {attachments.map((a) => (
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
        ))}
      </div>
    </div>
  );
}
