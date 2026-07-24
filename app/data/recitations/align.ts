import type { RecitationWord } from "./types";

// ---------------------------------------------------------------------------
// Alignment — maps a timing transcript onto authored display words.
//
// The transcript is only a timing source; the displayed text is always the
// authored tafsir. These helpers line the two up tolerantly (case /
// punctuation / diacritics folded away) so a mis-heard, missing, or extra
// transcript word only shifts timing — never what's shown — and never stalls.
// ---------------------------------------------------------------------------

export interface WordTime {
  s: number;
  e: number;
}

/** A block that fell below this share of matched words is treated as NOT
 *  spoken by the transcript — that's how a recitation finds its own extent. */
const MIN_BLOCK_MATCH = 0.5;

/** Fold away case, punctuation and diacritics so a heard word can be matched
 *  to an authored one despite spelling/punctuation drift (Turkish-aware). */
export function normalizeWord(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

/** Normalized, space-joined form of a whole line — for matching an anchor
 *  ("subtitle" / "startsWith") against authored text despite punctuation. */
export function normalizeText(s: string): string {
  return s
    .split(/\s+/)
    .map(normalizeWord)
    .filter(Boolean)
    .join(" ");
}

/**
 * A monotonic copy of the transcript: starts never go backwards and a word
 * never runs past the next one's start. Speech-to-text output sometimes
 * overlaps two neighbouring words, which would otherwise leave the rendered
 * spans out of time order and confuse the read-head lookup.
 */
function monotonic(trans: RecitationWord[]): RecitationWord[] {
  const out: RecitationWord[] = new Array(trans.length);
  let prev = -Infinity;
  for (let i = 0; i < trans.length; i++) {
    const s = Math.max(trans[i].s, prev);
    out[i] = { w: trans[i].w, s, e: Math.max(trans[i].e, s) };
    prev = s;
  }
  for (let i = 0; i < out.length - 1; i++)
    if (out[i].e > out[i + 1].s) out[i].e = out[i + 1].s;
  return out;
}

/** LCS length table (built from the end) for two normalized word lists. */
function lcsTable(a: string[], b: string[]): Uint16Array[] {
  const A = a.length,
    B = b.length;
  const dp: Uint16Array[] = Array.from(
    { length: A + 1 },
    () => new Uint16Array(B + 1),
  );
  for (let i = A - 1; i >= 0; i--)
    for (let j = B - 1; j >= 0; j--)
      dp[i][j] =
        a[i] && a[i] === b[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
  return dp;
}

/** An inclusive run of authored blocks that one recitation speaks. */
export interface RecitedRange {
  start: number;
  end: number;
}

/**
 * Which authored blocks a transcript actually speaks.
 *
 * `blocks` is a candidate run of authored lines (each already tokenized into
 * normalized words), in reading order. We align the transcript across the
 * whole run, then measure per block what share of its words the voice hit:
 * a spoken block lands near 100%, while a block the audio never reaches picks
 * up only incidental matches — and none at all once the transcript is spent.
 * The answer is everything from the FIRST well-matched block through the LAST
 * one, so a recitation finds its own extent in the tafsir and several of them
 * can sit in one entry without swallowing each other's text.
 *
 * Reaching through to the last match (rather than stopping at the first weak
 * line) is deliberate: a line the voice reads in different words — "1. Hz.
 * Muhammet" against a spoken "Birinci Hazreti Muhammed" — scores poorly on its
 * own but is plainly inside the recitation, and cutting there would strand
 * everything after it.
 *
 * With `pinnedStart` the run is taken to begin at block 0 no matter how well
 * it matches (an authored `from:` anchor wins over the measurement).
 *
 * Returns null when nothing matched well enough — the caller decides how to
 * degrade (see SideInfoPanel: it recites the first block only).
 */
export function recitedBlockRange(
  blocks: string[][],
  trans: RecitationWord[],
  opts: { pinnedStart?: boolean; minRatio?: number } = {},
): RecitedRange | null {
  const minRatio = opts.minRatio ?? MIN_BLOCK_MATCH;
  if (blocks.length === 0 || trans.length === 0) return null;

  const flat: string[] = [];
  const owner: number[] = [];
  blocks.forEach((words, bi) =>
    words.forEach((w) => {
      flat.push(w);
      owner.push(bi);
    }),
  );

  const transNorm = monotonic(trans).map((w) => normalizeWord(w.w));
  const dp = lcsTable(flat, transNorm);
  const hits = new Array<number>(blocks.length).fill(0);
  let i = 0,
    j = 0;
  while (i < flat.length && j < transNorm.length) {
    if (flat[i] && flat[i] === transNorm[j]) {
      hits[owner[i]]++;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }

  const spoken = (b: number) =>
    blocks[b].length > 0 && hits[b] / blocks[b].length >= minRatio;

  let start = 0;
  if (!opts.pinnedStart) {
    while (start < blocks.length && !spoken(start)) start++;
    if (start === blocks.length) return null;
  }
  let end = start;
  for (let b = start + 1; b < blocks.length; b++) if (spoken(b)) end = b;
  return { start, end };
}

/** Spread [start, end) evenly across the null slots in [from, to). */
function fillGap(
  times: (WordTime | null)[],
  from: number,
  to: number,
  start: number,
  end: number,
) {
  const n = to - from;
  if (n <= 0) return;
  const step = Math.max(end - start, 0.001) / n;
  for (let k = 0; k < n; k++) {
    const s = start + k * step;
    times[from + k] = { s, e: s + step };
  }
}

/**
 * Assigns a time span to every display word by aligning the transcript onto
 * them. Matched words take the heard word's time; anything unmatched (wrong,
 * dropped, or added) is filled by spreading time evenly between the nearest
 * matched anchors. Always monotonic and covers every word — a bad transcript
 * degrades to an even sweep instead of a stall or crash.
 */
export function alignWordTimes(
  displayNorms: string[],
  rawTrans: RecitationWord[],
  duration: number,
): WordTime[] {
  const D = displayNorms.length;
  if (D === 0) return [];
  const trans = monotonic(rawTrans);
  const T = trans.length;
  const times: (WordTime | null)[] = new Array(D).fill(null);

  if (T > 0) {
    const transNorm = trans.map((w) => normalizeWord(w.w));
    const dp = lcsTable(displayNorms, transNorm);
    let i = 0,
      j = 0;
    while (i < D && j < T) {
      if (displayNorms[i] && displayNorms[i] === transNorm[j]) {
        times[i] = { s: trans[j].s, e: trans[j].e };
        i++;
        j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
      else j++;
    }
  }

  const totalEnd = duration > 0 ? duration : T > 0 ? trans[T - 1].e : D;
  const firstIdx = times.findIndex((t) => t);
  if (firstIdx === -1) {
    const step = totalEnd / D;
    for (let k = 0; k < D; k++) times[k] = { s: k * step, e: (k + 1) * step };
    return times as WordTime[];
  }
  fillGap(times, 0, firstIdx, 0, (times[firstIdx] as WordTime).s);
  let a = firstIdx;
  for (let k = firstIdx + 1; k <= D; k++) {
    if (k === D || times[k]) {
      const start = (times[a] as WordTime).e;
      const end = k < D ? (times[k] as WordTime).s : totalEnd;
      fillGap(times, a + 1, k, start, end);
      a = k;
    }
  }
  // Final monotonic pass. Interpolating between anchors can leave a word
  // ending after the next one starts (or, where two anchors coincide, no
  // duration at all). The renderer lays its per-character spans out in this
  // order and finds the read head by binary search over their start times, so
  // the sequence has to be non-decreasing end to end.
  for (let k = 1; k < D; k++) {
    const prev = times[k - 1] as WordTime;
    const t = times[k] as WordTime;
    if (t.s < prev.s) t.s = prev.s;
  }
  for (let k = 0; k < D; k++) {
    const t = times[k] as WordTime;
    const next = k + 1 < D ? (times[k + 1] as WordTime).s : Infinity;
    if (!(t.e > t.s)) t.e = t.s + 0.04;
    if (t.e > next) t.e = next;
  }
  return times as WordTime[];
}
