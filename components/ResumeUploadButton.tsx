"use client";

import { useRef } from "react";
import { Paperclip } from "lucide-react";
import toast from "react-hot-toast";

export function ResumeUploadButton({
  conversationId,
  disabled,
  onUploadStart,
  onUploadEnd,
}: {
  conversationId: string;
  disabled?: boolean;
  onUploadStart: () => void;
  onUploadEnd: (success: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    onUploadStart();
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conversationId", conversationId);
      const res = await fetch("/api/attachments", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      toast.success(`"${file.name}" attached — your coach will use it going forward`);
      onUploadEnd(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't upload file");
      onUploadEnd(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.pdf,.png,.jpg,.jpeg,.webp"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-hover hover:text-foreground disabled:opacity-50"
        aria-label="Attach a file"
        title="Attach a file — resume, job description, etc. (.txt, .pdf, image)"
      >
        <Paperclip size={18} />
      </button>
    </>
  );
}
