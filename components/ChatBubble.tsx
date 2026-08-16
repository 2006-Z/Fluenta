"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseMessageContent, type MessageSegment } from "@/lib/parseCorrections";
import { CorrectionCard } from "@/components/CorrectionCard";
import { FeedbackBlock } from "@/components/FeedbackBlock";
import { SystemNote } from "@/components/SystemNote";
import { MessageActions } from "@/components/MessageActions";
import { Markdown } from "@/components/Markdown";

function withStartOffsets(segments: MessageSegment[]) {
  return segments.reduce<{ segment: MessageSegment; start: number }[]>(
    (acc, segment) => {
      const prev = acc[acc.length - 1];
      const prevEnd = prev
        ? prev.start + (prev.segment.type === "text" ? prev.segment.value.length : 0)
        : 0;
      return [...acc, { segment, start: prevEnd }];
    },
    []
  );
}

function formatTimestamp(date: Date) {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  if (isToday) return time;
  const day = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return `${day}, ${time}`;
}

export function ChatBubble({
  role,
  content,
  createdAt,
  animate = false,
  interviewerName,
  isOnboarding = false,
  messageId,
}: {
  role: "user" | "assistant";
  content: string;
  createdAt: Date | string;
  animate?: boolean;
  interviewerName?: string | null;
  isOnboarding?: boolean;
  messageId?: string;
}) {
  const isUser = role === "user";
  const segments = parseMessageContent(content);
  const textLength = segments.reduce(
    (sum, s) => sum + (s.type === "text" ? s.value.length : 0),
    0
  );
  const [revealed, setRevealed] = useState(animate ? 0 : Infinity);

  useEffect(() => {
    if (!animate || textLength === 0) return;
    const step = Math.max(1, Math.ceil(textLength / 60));
    const interval = setInterval(() => {
      setRevealed((prev) => {
        const next = prev + step;
        if (next >= textLength) clearInterval(interval);
        return next;
      });
    }, 20);
    return () => clearInterval(interval);
    // Reveal animation should only ever run once, on mount, for a freshly
    // arrived reply — not re-trigger on later re-renders of the same bubble.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const offsetSegments = withStartOffsets(segments);
  const timestamp = formatTimestamp(
    typeof createdAt === "string" ? new Date(createdAt) : createdAt
  );

  // System notes (e.g. "switched your feedback language") are from Fluenta
  // itself, not the in-character recruiter — render them as their own
  // separate bubble, distinct from the roleplay reply.
  const noteEntries = offsetSegments.filter((e) => e.segment.type === "systemNote");
  const bubbleEntries = offsetSegments.filter((e) => e.segment.type !== "systemNote");

  return (
    <div className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start")}>
      {noteEntries.map(({ segment, start }, i) => {
        if (segment.type !== "systemNote" || revealed < start) return null;
        return (
          <motion.div
            key={`note-${i}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-[85%] sm:max-w-[75%]"
          >
            <SystemNote text={segment.text} />
          </motion.div>
        );
      })}

      {bubbleEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className={cn("flex flex-col", isUser ? "items-end" : "items-start")}
        >
          <div
            className={cn(
              "flex max-w-[85%] flex-col items-start gap-2 text-sm leading-relaxed sm:max-w-[75%]",
              isUser
                ? "text-foreground"
                : "rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-2.5 text-foreground"
            )}
          >
            {!isUser &&
              (isOnboarding ? (
                <span className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-medium uppercase tracking-wide text-accent">
                  <Sparkles size={12} className="shrink-0" />
                  Fluenta
                </span>
              ) : (
                <span className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-medium text-muted">
                  <Briefcase size={12} className="shrink-0" />
                  {interviewerName}
                </span>
              ))}
            {bubbleEntries.map(({ segment, start }, i) => {
              if (segment.type === "correction") {
                if (revealed < start) return null;
                return (
                  <CorrectionCard
                    key={i}
                    wrong={segment.wrong}
                    fix={segment.fix}
                    why={segment.why}
                  />
                );
              }
              if (segment.type === "feedbackBlock") {
                if (revealed < start) return null;
                return (
                  <FeedbackBlock
                    key={i}
                    feedback={segment.feedback}
                    corrections={segment.corrections}
                  />
                );
              }
              if (segment.type !== "text") return null;
              const visibleLength = Math.max(
                0,
                Math.min(segment.value.length, revealed - start)
              );
              const visibleText = segment.value.slice(0, visibleLength);
              if (visibleText.trim().length === 0) return null;

              const fullyRevealed = visibleLength >= segment.value.length;
              if (!isUser && fullyRevealed) {
                return (
                  <Markdown
                    key={i}
                    content={segment.value}
                    className="text-foreground [&_p]:text-foreground"
                  />
                );
              }
              return (
                <span key={i} className="whitespace-pre-wrap">
                  {visibleText}
                </span>
              );
            })}
          </div>
          <span className="mt-1 px-1 text-[11px] text-muted">{timestamp}</span>
          {!isUser && messageId && (!animate || revealed >= textLength) && (
            <MessageActions messageId={messageId} />
          )}
        </motion.div>
      )}
    </div>
  );
}
