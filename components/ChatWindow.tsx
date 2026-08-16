"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, AlertCircle, Crown } from "lucide-react";
import toast from "react-hot-toast";
import { ChatBubble } from "@/components/ChatBubble";
import { StatusIndicator } from "@/components/StatusIndicator";
import { EmptyState } from "@/components/EmptyState";
import { ResumeUploadButton } from "@/components/ResumeUploadButton";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  isOnboarding?: boolean;
};

const SUMMARY_TRIGGER = 25;

export function ChatWindow({
  conversationId,
  greeting,
  initialMessages,
  isReady,
  interviewerName,
  initialSummarizedUpToCount = 0,
}: {
  conversationId: string;
  greeting: string;
  initialMessages: ChatMessage[];
  isReady: boolean;
  interviewerName?: string | null;
  initialSummarizedUpToCount?: number;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [profileReady, setProfileReady] = useState(isReady);
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [failed, setFailed] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [input, setInput] = useState("");
  const [justArrivedId, setJustArrivedId] = useState<string | null>(null);
  const [summarizedUpToCount, setSummarizedUpToCount] = useState(
    initialSummarizedUpToCount
  );
  const [willSummarize, setWillSummarize] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending, uploadingFile]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setFailed(false);
    setWillSummarize(messages.length - summarizedUpToCount >= SUMMARY_TRIGGER);
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      },
    ]);
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: text }),
      });

      if (res.status === 402) {
        setLimitReached(true);
        return;
      }
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();

      if (typeof data.profileReady === "boolean") {
        if (data.profileReady && !profileReady) {
          // The research/company panel and page title live in the server
          // component shell — refresh it now that research just finished,
          // so it appears without the user needing to reload the page.
          router.refresh();
        }
        setProfileReady(data.profileReady);
      }

      if (typeof data.summarizedUpToCount === "number") {
        setSummarizedUpToCount(data.summarizedUpToCount);
      }

      const replyId =
        typeof data.messageId === "string" ? data.messageId : `reply-${Date.now()}`;
      setJustArrivedId(replyId);
      setMessages((prev) => [
        ...prev,
        {
          id: replyId,
          role: "assistant",
          content: data.reply,
          createdAt: new Date().toISOString(),
          isOnboarding: data.profileReady === false,
        },
      ]);
    } catch {
      setFailed(true);
      toast.error("Couldn't reach your AI coach");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState greeting={greeting} />
        ) : (
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-6">
            {messages.map((m) => (
              <ChatBubble
                key={m.id}
                role={m.role}
                content={m.content}
                createdAt={m.createdAt}
                animate={m.id === justArrivedId}
                interviewerName={interviewerName}
                isOnboarding={m.isOnboarding}
                messageId={m.role === "assistant" ? m.id : undefined}
              />
            ))}
            {sending && !profileReady && (
              <StatusIndicator label="Researching your target…" icon="search" />
            )}
            {sending && profileReady && (
              <StatusIndicator
                label={willSummarize ? "Summarizing conversation…" : "Thinking…"}
                icon="search"
              />
            )}
            {uploadingFile && (
              <StatusIndicator label="Reading your file…" icon="file" />
            )}
            {failed && (
              <div className="flex items-center gap-1.5 text-xs text-danger">
                <AlertCircle size={13} />
                Something went wrong. Please try sending your message again.
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        )}
      </div>

      {limitReached ? (
        <div className="border-t border-border bg-background/95 px-4 py-4 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-4 text-center">
            <Crown size={20} className="text-accent" />
            <p className="text-sm font-medium text-foreground">
              You&apos;ve reached the free message limit for this session
            </p>
            <p className="text-xs text-muted">
              Upgrade for unlimited interview practice and full company research.
            </p>
          </div>
        </div>
      ) : (
        <div className="sticky bottom-0 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex w-full max-w-5xl items-end gap-2">
            <ResumeUploadButton
              conversationId={conversationId}
              disabled={uploadingFile}
              onUploadStart={() => setUploadingFile(true)}
              onUploadEnd={(success) => {
                setUploadingFile(false);
                if (success) router.refresh();
              }}
            />
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                profileReady
                  ? "Type your reply…"
                  : "Tell me the company and role you're preparing for…"
              }
              className="max-h-32 flex-1 resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-hover text-accent-foreground shadow-sm shadow-accent/20 transition-all hover:brightness-110 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Send message"
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
