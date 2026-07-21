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

/** Fold away case, punctuation and diacritics so a heard word can be matched
 *  to an authored one despite spelling/punctuation drift (Turkish-aware). */
export function normalizeWord(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "");
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

/**
 * The index of the LAST display word that a transcript word actually matches
 * (via LCS), or −1 if none. Used to decide how far the recitation reaches —
 * i.e. which authored blocks are spoken vs. which follow after the audio.
 */
export function lastMatchedWordIndex(
  displayNorms: string[],
  trans: RecitationWord[],
): number {
  const D = displayNorms.length;
  const T = trans.length;
  if (D === 0 || T === 0) return -1;
  const transNorm = trans.map((w) => normalizeWord(w.w));
  const dp = lcsTable(displayNorms, transNorm);
  let i = 0,
    j = 0,
    last = -1;
  while (i < D && j < T) {
    if (displayNorms[i] && displayNorms[i] === transNorm[j]) {
      last = i;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return last;
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
  trans: RecitationWord[],
  duration: number,
): WordTime[] {
  const D = displayNorms.length;
  if (D === 0) return [];
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
  for (let k = 0; k < D; k++) {
    const t = times[k] as WordTime;
    if (!(t.e > t.s)) t.e = t.s + 0.04;
  }
  return times as WordTime[];
}
