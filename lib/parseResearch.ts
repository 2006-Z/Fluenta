export type ResearchSection = {
  title: string;
  content: string;
};

export function parseResearch(research: string): ResearchSection[] {
  const lines = research.split("\n");
  const sections: ResearchSection[] = [];
  let current: ResearchSection | null = null;

  for (const line of lines) {
    const headerMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headerMatch) {
      if (current) sections.push(current);
      current = { title: headerMatch[1].trim(), content: "" };
    } else if (current) {
      current.content += (current.content ? "\n" : "") + line;
    } else {
      current = { title: "Overview", content: line };
    }
  }
  if (current) sections.push(current);

  return sections
    .map((s) => ({ title: s.title, content: s.content.trim() }))
    .filter((s) => s.content.length > 0);
}
