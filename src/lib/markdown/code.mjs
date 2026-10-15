// コードブロック: Figma「Code blocks」の配色と、ヘッダー（言語・ファイル名・COPY）・行番号・行強調・差分。
// 記法: ```ts title="src/x.ts" {4-5} showLineNumbers / noLineNumbers
import { transformerMetaHighlight } from "@shikijs/transformers";

/** @type {import("shiki").ThemeRegistration} */
export const codeTheme = {
  name: "tsusu-code",
  type: "dark",
  colors: { "editor.background": "#162932", "editor.foreground": "#E9F1F4" },
  tokenColors: [
    { settings: { foreground: "#E9F1F4" } },
    {
      scope: ["keyword", "storage", "storage.type", "storage.modifier", "variable.language", "support.type.primitive", "keyword.operator.new", "keyword.operator.expression"],
      settings: { foreground: "#B5D5FF" },
    },
    { scope: ["string", "markup.inline.raw", "string.regexp"], settings: { foreground: "#B9E0C5" } },
    { scope: ["constant.numeric", "constant.language", "constant.character"], settings: { foreground: "#F3CB85" } },
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#96AEBB" } },
  ],
};

const TERMINAL_LANGS = new Set(["sh", "shell", "bash", "zsh", "console", "shellsession", "powershell", "ps1", "bat", "cmd"]);
const LABELS = { plaintext: "TEXT", text: "TEXT", txt: "TEXT", sh: "SHELL", bash: "SHELL", zsh: "SHELL", shell: "SHELL", ts: "TYPESCRIPT", js: "JAVASCRIPT", md: "MARKDOWN" };

/** `title="..."` と真偽フラグをメタ文字列から取り出す */
export function parseMeta(raw = "") {
  const title = raw.match(/title=(["'])(.*?)\1/)?.[2];
  return {
    title,
    show: /\bshowLineNumbers\b/.test(raw),
    hide: /\bnoLineNumbers\b/.test(raw),
  };
}

const text = (value) => ({ type: "text", value });
const el = (tagName, className, children, extra = {}) => ({
  type: "element",
  tagName,
  properties: { className: className.split(" "), ...extra },
  children,
});
const textOf = (node) => (node.type === "text" ? node.value : (node.children ?? []).map(textOf).join(""));

const blockTransformer = {
  name: "tsusu:code-block",
  line(node) {
    if (this.options.lang !== "diff") return;
    const first = textOf(node)[0];
    if (first === "+") this.addClassToHast(node, "diff-add");
    if (first === "-") this.addClassToHast(node, "diff-remove");
  },
  root(root) {
    const lang = this.options.lang;
    const { title, show, hide } = parseMeta(this.options.meta?.__raw);
    const terminal = TERMINAL_LANGS.has(lang) || title === "Terminal" || lang === "plaintext";
    const lineNumbers = show || (!hide && !terminal);
    const label = LABELS[lang] ?? lang.toUpperCase();
    const footer = lang === "diff" ? "DIFF" : TERMINAL_LANGS.has(lang) || title === "Terminal" ? "TERMINAL" : "UTF-8";

    const header = el("div", "code-header", [
      el("div", "code-meta", [
        el("span", "code-lang", [text(label)]),
        ...(title ? [el("span", "code-title", [text(title)])] : []),
      ]),
      el("button", "code-copy", [text("COPY")], { type: "button", ariaLabel: "コードをコピー" }),
      el("span", "code-status sr-only", [], { ariaLive: "polite" }),
    ]);
    return {
      type: "root",
      children: [
        el("figure", "code-block", [header, ...root.children, el("div", "code-footer", [text(footer)])], {
          dataLineNumbers: lineNumbers ? "" : undefined,
        }),
      ],
    };
  },
};

export const codeTransformers = [transformerMetaHighlight(), blockTransformer];
