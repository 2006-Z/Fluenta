"use client";

import { useRef } from "react";
import { Paperclip } from "lucide-react";
import toast from "react-hot-toast";

export function ResumeUploadButton({
  conversationId,
  disabled,
  onUploadStart,
  onUploadProgress,
  onUploadEnd,
}: {
  conversationId: string;
  disabled?: boolean;
  onUploadStart: () => void;
  onUploadProgress?: (percent: number) => void;
  onUploadEnd: (success: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    onUploadStart();
    onUploadProgress?.(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversationId", conversationId);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/attachments");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onUploadProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let data: { error?: string } = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // ignore parse failure, fall through to status check below
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        toast.success(`"${file.name}" attached — your coach will use it going forward`);
        onUploadEnd(true);
      } else {
        toast.error(data.error ?? "Couldn't upload file");
        onUploadEnd(false);
      }
    };

    xhr.onerror = () => {
      toast.error("Couldn't upload file");
      onUploadEnd(false);
    };

    xhr.send(formData);
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
