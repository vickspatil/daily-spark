export function extractHeadline(md: string): string {
  const m = md.match(/^##\s+(.+)$/m);
  if (m) return m[1].trim();
  const firstLine = md.split("\n").find((l) => l.trim());
  return firstLine?.replace(/^#+\s*/, "").trim() ?? "Daily Brief";
}

export function extractTeaser(md: string): string {
  const lines = md.split("\n").map((l) => l.trim());
  for (const l of lines) {
    if (!l || l.startsWith("#") || l.startsWith("-")) continue;
    const plain = l.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1");
    if (plain.length > 40) return plain.slice(0, 220);
  }
  return "";
}

export function extractKeywords(md: string): string[] {
  const set = new Set<string>();
  const re = /\*\*(.+?)\*\*/g;
  let m;
  while ((m = re.exec(md))) {
    const k = m[1].trim();
    if (k.length > 2 && k.length < 40) set.add(k);
  }
  return Array.from(set).slice(0, 8);
}
