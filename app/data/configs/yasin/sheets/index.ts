/**
 * Every generated Yâsîn sheet, keyed by its own `key`.
 *
 * The atlas imports each sheet DIRECTLY (see ../index.ts) — this barrel is for
 * the two consumers that want all of them at once and do not care which:
 * `scripts/emitSheetFrames.ts`, which draws each sheet's frame SVGs, and the
 * "Yâsîn — Sayfalar" route, which pages through them one at a time.
 */

import type { BuiltSheet } from "../kit";

import { SHEET as S_20_27 } from "./20-27";
import { SHEET as S_28_32 } from "./28-32";
import { SHEET as S_33_40 } from "./33-40";
import { SHEET as S_41_47 } from "./41-47";
import { SHEET as S_48_54 } from "./48-54";
import { SHEET as S_55_68 } from "./55-68";
import { SHEET as S_69_82 } from "./69-82";
import { SHEET as S_83 } from "./83";

/** In surah order — the order the "Sayfalar" route pages through them. */
export const YASIN_SHEET_LIST: BuiltSheet[] = [
  S_20_27,
  S_28_32,
  S_33_40,
  S_41_47,
  S_48_54,
  S_55_68,
  S_69_82,
  S_83,
];

export const YASIN_SHEETS: Record<string, BuiltSheet> = Object.fromEntries(
  YASIN_SHEET_LIST.map((s) => [s.config.id, s]),
);
