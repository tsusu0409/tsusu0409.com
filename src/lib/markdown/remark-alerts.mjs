// GitHub形式の注記 `> [!NOTE]` を <div class="callout callout-note"> へ変換する。
const KINDS = ["NOTE", "TIP", "IMPORTANT", "WARNING", "CAUTION"];
const MARKER = new RegExp(`^\\[!(${KINDS.join("|")})\\][ \\t]*\\r?\\n?`);

function walk(node) {
  for (const child of node.children ?? []) {
    if (child.type === "blockquote") convert(child);
    walk(child);
  }
}

function convert(quote) {
  const first = quote.children[0];
  const head = first?.type === "paragraph" ? first.children[0] : undefined;
  const match = head?.type === "text" ? head.value.match(MARKER) : null;
  if (!match) return;

  const kind = match[1];
  head.value = head.value.slice(match[0].length);
  if (!head.value) first.children.shift();
  if (first.children[0]?.type === "break") first.children.shift();
  if (!first.children.length) quote.children.shift();

  quote.data = { hName: "div", hProperties: { className: ["callout", `callout-${kind.toLowerCase()}`] } };
  quote.children.unshift({
    type: "paragraph",
    data: { hName: "p", hProperties: { className: ["callout-title"] } },
    children: [{ type: "text", value: kind }],
  });
}

export default function remarkAlerts() {
  return (tree) => walk(tree);
}
