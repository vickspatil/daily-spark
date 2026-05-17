interface Props {
  topicColor: string;
}

/** Render generated AI markdown with the project's restricted spec. */
export function BriefContent({
  content,
  topicColor,
}: {
  content: string;
  topicColor: string;
}) {
  const blocks = parseBlocks(content);
  return (
    <div className="font-serif text-[1rem] leading-[1.75] text-[#e8e8f0]">
      {blocks.map((b, i) => {
        if (b.type === "h2") {
          return (
            <h2
              key={i}
              className="mt-6 mb-3 font-serif text-[1.5rem] leading-[2rem] text-[#e8e8f0]"
            >
              {renderInline(b.text, topicColor)}
            </h2>
          );
        }
        if (b.type === "h3") {
          return (
            <h3
              key={i}
              className="mt-5 mb-2 font-serif text-[1.25rem] text-[#e8e8f0]"
            >
              {renderInline(b.text, topicColor)}
            </h3>
          );
        }
        if (b.type === "ul") {
          return (
            <ul key={i} className="my-3 space-y-2">
              {b.items.map((it, j) => (
                <li key={j} className="flex gap-3 pl-1">
                  <span
                    className="mt-[0.7em] inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: topicColor }}
                  />
                  <span className="flex-1">
                    {renderInline(it, topicColor)}
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="my-3">
            {renderInline(b.text, topicColor)}
          </p>
        );
      })}
    </div>
  );
}

type Block =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: Block[] = [];
  let para: string[] = [];
  let list: string[] | null = null;

  const flushPara = () => {
    const t = para.join(" ").trim();
    if (t) out.push({ type: "p", text: t });
    para = [];
  };
  const flushList = () => {
    if (list && list.length) out.push({ type: "ul", items: list });
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    if (line.startsWith("## ")) {
      flushPara();
      flushList();
      out.push({ type: "h2", text: line.slice(3).trim() });
      continue;
    }
    if (line.startsWith("### ")) {
      flushPara();
      flushList();
      out.push({ type: "h3", text: line.slice(4).trim() });
      continue;
    }
    if (line.startsWith("# ")) {
      flushPara();
      flushList();
      out.push({ type: "h2", text: line.slice(2).trim() });
      continue;
    }
    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      flushPara();
      if (!list) list = [];
      list.push(bullet[1]);
      continue;
    }
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();
  return out;
}

function renderInline(text: string, accent: string): React.ReactNode[] {
  // tokens: **bold**, *italic*, _italic_
  const nodes: React.ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(_([^_]+)_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1]) {
      nodes.push(
        <strong
          key={key++}
          style={{ color: accent, fontWeight: 600 }}
          className="font-serif"
        >
          {m[2]}
        </strong>,
      );
    } else if (m[3]) {
      nodes.push(
        <em key={key++} className="text-[#888899]">
          {m[4]}
        </em>,
      );
    } else if (m[5]) {
      nodes.push(
        <em key={key++} className="text-[#888899]">
          {m[6]}
        </em>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

void ({} as Props);
