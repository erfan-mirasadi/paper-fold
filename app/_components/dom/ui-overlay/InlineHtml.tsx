"use client";

import { Fragment, createElement } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { InkRenderer } from "@/app/_components/dom/ui-overlay/SyncedRecitation";

// ---------------------------------------------------------------------------
// Authored HTML, recited.
//
// A `{ html }` flow item is written as markup so a phrase can carry its own
// colour or frame. Handing that string to dangerouslySetInnerHTML leaves the
// karaoke nothing to hold — it needs a span per character — so instead we read
// the markup into a small tree, keep every tag and attribute exactly as
// authored, and swap each run of text for that run's live spans.
//
// Deliberately small: it understands nested tags, quoted/bare attributes and
// void elements, which is all these configs use. Anything else — comments,
// script/style, unbalanced tags — makes it give up and return null, and the
// caller falls back to rendering the HTML as-is (still timed, just not lit).
// ---------------------------------------------------------------------------

const VOID_TAGS = new Set(["br", "hr", "img", "input", "wbr", "source"]);

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

const decodeEntities = (s: string) =>
  s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (whole, body: string) => {
    if (body[0] !== "#") return ENTITIES[body] ?? whole;
    const hex = body[1] === "x" || body[1] === "X";
    const code = parseInt(hex ? body.slice(2) : body.slice(1), hex ? 16 : 10);
    return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
  });

/** "color: #A30000; font-weight: bold" → a React style object. */
function parseStyle(css: string): CSSProperties {
  const out: Record<string, string> = {};
  for (const decl of css.split(";")) {
    const colon = decl.indexOf(":");
    if (colon < 0) continue;
    const prop = decl.slice(0, colon).trim();
    const value = decl.slice(colon + 1).trim();
    if (!prop || !value) continue;
    out[
      prop.startsWith("--")
        ? prop
        : prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    ] = value;
  }
  return out as CSSProperties;
}

const ATTR_RE = /([^\s/>=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

function parseAttrs(raw: string): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  ATTR_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = ATTR_RE.exec(raw))) {
    const name = m[1].toLowerCase();
    const value = m[2] ?? m[3] ?? m[4];
    if (value === undefined) {
      props[name] = true;
    } else if (name === "style") {
      props.style = parseStyle(decodeEntities(value));
    } else if (name === "class") {
      props.className = decodeEntities(value);
    } else if (name === "for") {
      props.htmlFor = decodeEntities(value);
    } else {
      props[name] = decodeEntities(value);
    }
  }
  return props;
}

interface TextPiece {
  kind: "text";
  /** Whitespace kept outside the spans, so words never run together. */
  lead: string;
  trail: string;
  /** Index into `units`, or −1 for a whitespace-only run. */
  unit: number;
}
interface ElementPiece {
  kind: "element";
  tag: string;
  props: Record<string, unknown>;
  children: Piece[];
}
type Piece = TextPiece | ElementPiece;

const TAG_RE =
  /<(\/?)([a-zA-Z][\w-]*)((?:\s+[^\s/>=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*(\/?)>/g;

export interface ParsedInlineHtml {
  /** The text runs, in reading order — the recitation's units for this block. */
  units: string[];
  /** The markup rebuilt, with `ink(i)` standing in for text run i. */
  render: (ink: InkRenderer) => ReactNode;
}

/** Read authored markup into units + a renderer, or null if it's beyond us. */
export function parseInlineHtml(html: string): ParsedInlineHtml | null {
  if (/<\s*(script|style)\b/i.test(html) || html.includes("<!--")) return null;

  const units: string[] = [];
  const root: ElementPiece = {
    kind: "element",
    tag: "",
    props: {},
    children: [],
  };
  const stack: ElementPiece[] = [root];

  const pushText = (raw: string) => {
    if (!raw) return;
    const text = decodeEntities(raw);
    const [, lead, core, trail] = /^(\s*)([\s\S]*?)(\s*)$/.exec(text)!;
    const parent = stack[stack.length - 1];
    if (!core) {
      parent.children.push({ kind: "text", lead: text, trail: "", unit: -1 });
      return;
    }
    parent.children.push({ kind: "text", lead, trail, unit: units.length });
    units.push(core);
  };

  let cursor = 0;
  let m: RegExpExecArray | null;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(html))) {
    pushText(html.slice(cursor, m.index));
    cursor = TAG_RE.lastIndex;
    const [, closing, rawTag, rawAttrs, selfClosing] = m;
    const tag = rawTag.toLowerCase();

    if (closing) {
      let at = -1;
      for (let i = stack.length - 1; i > 0; i--)
        if (stack[i].tag === tag) {
          at = i;
          break;
        }
      if (at < 0) return null; // stray close tag — hand it back
      stack.length = at;
      continue;
    }

    const el: ElementPiece = {
      kind: "element",
      tag,
      props: parseAttrs(rawAttrs),
      children: [],
    };
    stack[stack.length - 1].children.push(el);
    if (!selfClosing && !VOID_TAGS.has(tag)) stack.push(el);
  }
  pushText(html.slice(cursor));

  if (stack.length !== 1) return null; // something was left open
  if (units.length === 0) return null; // no text to recite

  const renderPieces = (
    pieces: Piece[],
    ink: InkRenderer,
    key: string,
  ): ReactNode[] =>
    pieces.map((piece, i): ReactNode => {
      const k = `${key}.${i}`;
      if (piece.kind === "text")
        return piece.unit < 0 ? (
          <Fragment key={k}>{piece.lead}</Fragment>
        ) : (
          <Fragment key={k}>
            {piece.lead}
            {ink(piece.unit)}
            {piece.trail}
          </Fragment>
        );
      return createElement(
        piece.tag,
        { key: k, ...piece.props },
        VOID_TAGS.has(piece.tag)
          ? undefined
          : renderPieces(piece.children, ink, k),
      );
    });

  return {
    units,
    render: (ink) => renderPieces(root.children, ink, "h"),
  };
}
