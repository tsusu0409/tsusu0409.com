// 記事内で同じ外部scriptが繰り返し書かれている埋め込み（X・Instagram）の初期化を1回にまとめる。
// 埋め込みのblockquote・元リンクには触れない。記事のMarkdownは書き換えない。
export default function rehypeDedupeScripts() {
  return (tree) => {
    const seen = new Set();
    const walk = (node) => {
      if (!node.children) return;
      node.children = node.children.filter((child) => {
        if (child.type === "raw") {
          // 生HTMLとして残っている <script src="..."></script> も対象
          child.value = child.value.replace(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>\s*<\/script>/g, (tag, src) => {
            const key = src.replace(/^https?:/, "");
            if (seen.has(key)) return "";
            seen.add(key);
            return tag;
          });
          return true;
        }
        const src = child.type === "element" && child.tagName === "script" ? child.properties?.src : undefined;
        if (typeof src !== "string") return walk(child), true;
        const key = src.replace(/^https?:/, "");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };
    walk(tree);
  };
}
