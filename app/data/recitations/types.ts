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
 * One time-aligned recitation: an audio file plus a flat, in-reading-order
 * list of time-stamped words. Purely a timing source — the displayed copy is
 * the tafsir's own authored text, onto which these words are aligned.
 */
export interface RecitationTranscript {
  /** Path to the audio asset (relative to /public), e.g. "/test-speech.wav". */
  src: string;
  /** Small label rendered above the player (e.g. reciter / section name). */
  title?: string;
  /** Total audio length in seconds (used before metadata loads). */
  durationS?: number;
  /** Time-stamped words, in reading order. Timing only — see file header. */
  words: RecitationWord[];
}
