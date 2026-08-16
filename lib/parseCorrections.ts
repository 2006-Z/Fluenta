export type Correction = { wrong: string; fix: string; why: string };

export type MessageSegment =
  | { type: "text"; value: string }
  | { type: "correction"; wrong: string; fix: string; why: string }
  | { type: "feedbackBlock"; feedback: string; corrections: Correction[] }
  | { type: "systemNote"; text: string };

const CORRECTION_REGEX = /\[\[wrong:([\s\S]*?)\|\|fix:([\s\S]*?)\|\|why:([\s\S]*?)\]\]/g;
const BLOCK_REGEX = /\{\{(feedback-block|system-note)\}\}([\s\S]*?)\{\{\/\1\}\}/g;

function extractCorrections(text: string): Correction[] {
  const corrections: Correction[] = [];
  for (const match of text.matchAll(CORRECTION_REGEX)) {
    corrections.push({
      wrong: match[1].trim(),
      fix: match[2].trim(),
      why: match[3].trim(),
    });
  }
  return corrections;
}

function parseTextForCorrections(content: string): MessageSegment[] {
  const segments: MessageSegment[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(CORRECTION_REGEX)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      segments.push({ type: "text", value: content.slice(lastIndex, start) });
    }
    segments.push({
      type: "correction",
      wrong: match[1].trim(),
      fix: match[2].trim(),
      why: match[3].trim(),
    });
    lastIndex = start + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({ type: "text", value: content.slice(lastIndex) });
  }

  return segments;
}

export function parseMessageContent(content: string): MessageSegment[] {
  const segments: MessageSegment[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(BLOCK_REGEX)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      segments.push(...parseTextForCorrections(content.slice(lastIndex, start)));
    }

    const blockType = match[1];
    const inner = match[2];

    if (blockType === "feedback-block") {
      const corrections = extractCorrections(inner);
      const feedback = inner.replace(CORRECTION_REGEX, "").trim();
      segments.push({ type: "feedbackBlock", feedback, corrections });
    } else {
      segments.push({ type: "systemNote", text: inner.trim() });
    }

    lastIndex = start + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push(...parseTextForCorrections(content.slice(lastIndex)));
  }

  return segments;
}

/** Plain-text summary for previews (conversation list, notifications) — strips all markers/markdown down to readable prose. */
export function stripMessageMarkers(content: string): string {
  const withoutBlocks = content.replace(BLOCK_REGEX, (_match, _type, inner: string) =>
    inner.replace(CORRECTION_REGEX, "$2").trim()
  );
  return withoutBlocks
    .replace(CORRECTION_REGEX, "$2")
    .replace(/\*\*/g, "")
    .replace(/\s*\n+\s*/g, " ")
    .trim();
}
