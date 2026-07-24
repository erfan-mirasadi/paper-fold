// ---------------------------------------------------------------------------
// RECITATION TRANSCRIPTS — a TIMING OVERLAY for spoken tafsir.
//
// A recitation pairs an audio file with a flat list of time-stamped words
// (from a speech-to-text pass, e.g. Deepgram). It carries NO display text of
// its own: the words shown on screen always come from the tafsir config
// (`SideInfoEntry.paragraphs`), which stays the single source of truth. At
// render time the transcript's words are fuzzily ALIGNED onto that authored
// text to time the karaoke highlight (see SyncedRecitation.tsx).
//
// Why an overlay and not the text itself:
//   • the authored tafsir keeps displaying correctly even if the transcript
//     mis-hears or drops a word — the transcript only affects TIMING, never
//     what's shown;
//   • the tafsir can be re-worded / re-designed without touching the audio;
//   • alignment is tolerant: extra, missing or wrong transcript words are
//     matched where possible and interpolated where not, so it never hangs
//     or crashes on a mismatch.
//
// One surah can have MANY recitations (per section / reciter), so each surah
// keeps a `Record<key, RecitationTranscript>` (see e.g. ./alak.ts). Times are
// in SECONDS.
//
// A single tafsir entry can carry as many recitations as it needs — pass an
// array to `SideInfoEntry.recitation`. They are laid out in array order, each
// one claiming the run of authored lines it actually speaks, and they play as
// a chain: when one finishes the next starts on its own (see
// RecitationChain.tsx). Placement is automatic by default; `from` / `to` below
// pin it by hand when you want a voice somewhere specific.
// ---------------------------------------------------------------------------

/** A single spoken word with its span in the audio timeline (seconds). */
export interface RecitationWord {
  /** The word as heard — used only for alignment matching, never displayed. */
  w: string;
  /** Start time in the audio, in seconds. */
  s: number;
  /** End time in the audio, in seconds. */
  e: number;
}

/**
 * A place in a tafsir entry's reading flow, used to pin where a recitation
 * starts / ends instead of letting it find itself:
 *
 *   "kicker" | "title"        the entry's lead-in line / heading
 *   3                          `paragraphs[3]`
 *   { subtitle: "VAHİY" }      the `{ subtitle }` item with that text
 *   { startsWith: "Bütün v" }  the first paragraph beginning with that text
 *
 * Text forms are matched loosely (case, punctuation and diacritics folded),
 * so they keep working through small copy edits. An anchor that resolves to
 * nothing is ignored and the recitation falls back to automatic placement.
 */
export type RecitationAnchor =
  | "kicker"
  | "title"
  | number
  | { subtitle: string }
  | { startsWith: string };

/**
 * One time-aligned recitation: an audio file plus a flat, in-reading-order
 * list of time-stamped words. Purely a timing source — the displayed copy is
 * the tafsir's own authored text, onto which these words are aligned.
 */
export interface RecitationTranscript {
  /** Path to the audio asset (relative to /public), e.g. "/alak/alak-vahiy.mp3". */
  src: string;
  /** Small label rendered above the player (e.g. reciter / section name). */
  title?: string;
  /** Total audio length in seconds (used before metadata loads). */
  durationS?: number;
  /** Time-stamped words, in reading order. Timing only — see file header. */
  words: RecitationWord[];
  /**
   * Where the spoken run STARTS. Omit for automatic placement: the recitation
   * takes the first authored line its words actually match, searching from
   * wherever the previous recitation of the entry left off.
   */
  from?: RecitationAnchor;
  /**
   * Where the spoken run ENDS (inclusive). Omit for automatic placement: it
   * reaches through the last consecutive line the transcript covers.
   */
  to?: RecitationAnchor;
}
