// ---------------------------------------------------------------------------
// BACKGROUND MUSIC — the quiet piano bed that plays UNDER the spoken tafsir.
//
// A static manifest, not a directory listing: the paths are known at build
// time, so nothing here costs a request until the engine actually reaches for
// a track. The engine streams exactly ONE of these at a time (plus, for the
// last few seconds of a track, the one it is about to cross into) — the number
// of recitations on a page has no bearing on what gets fetched.
//
// `durationS` lets the engine schedule the pre-load and the crossfade before
// the file's own metadata has arrived; once it has, the real duration wins.
// ---------------------------------------------------------------------------

export interface BackgroundTrack {
  /** Path under /public. */
  src: string;
  /** Length in seconds — a hint, superseded by the file's own metadata. */
  durationS: number;
  artist: string;
  title: string;
}

/**
 * The bed, in album order. The engine shuffles a copy of this per session, so
 * a reader who returns doesn't always meet the same opening piece.
 */
export const BACKGROUND_MUSIC: readonly BackgroundTrack[] = [
  {
    src: "/bg-music/01-elia-lo-monaco-tenderness.mp3",
    durationS: 175,
    artist: "Elia Lo Monaco",
    title: "tenderness",
  },
  {
    src: "/bg-music/02-jonas-hain-etincelle.mp3",
    durationS: 149,
    artist: "Jonas Hain",
    title: "étincelle",
  },
  {
    src: "/bg-music/03-luis-berra-minor-fable.mp3",
    durationS: 121,
    artist: "Luis Berra",
    title: "minor fable",
  },
  {
    src: "/bg-music/04-jonas-hain-intra.mp3",
    durationS: 92,
    artist: "Jonas Hain",
    title: "intra",
  },
  {
    src: "/bg-music/05-jonas-kolberg-late-night-train.mp3",
    durationS: 145,
    artist: "Jonas Kolberg",
    title: "late night train",
  },
  {
    src: "/bg-music/06-yana-couto-yan-springett-darklight.mp3",
    durationS: 132,
    artist: "Yana Couto, Yan Springett",
    title: "darklight",
  },
  {
    src: "/bg-music/07-jonas-hain-nocturne.mp3",
    durationS: 146,
    artist: "Jonas Hain",
    title: "nocturne",
  },
  {
    src: "/bg-music/08-adrien-de-la-salle-prelude-dune-nuit-dautomne.mp3",
    durationS: 161,
    artist: "Adrien de la Salle",
    title: "prélude d'une nuit d'automne",
  },
  {
    src: "/bg-music/09-ophelia-wilde-at-twilight.mp3",
    durationS: 98,
    artist: "Ophelia Wilde",
    title: "at twilight",
  },
  {
    src: "/bg-music/10-martin-biesecke-consolation.mp3",
    durationS: 124,
    artist: "Martin Biesecke",
    title: "consolation",
  },
  {
    src: "/bg-music/11-yannick-lowack-tristesse.mp3",
    durationS: 196,
    artist: "Yannick Lowack",
    title: "tristesse",
  },
  {
    src: "/bg-music/12-elias-kiefer-danach-variation-1.mp3",
    durationS: 107,
    artist: "Elias Kiefer",
    title: "'danach' variation 1",
  },
  {
    src: "/bg-music/13-jonas-hain-au-vent.mp3",
    durationS: 110,
    artist: "Jonas Hain",
    title: "au vent",
  },
  {
    src: "/bg-music/14-klaf-caracol.mp3",
    durationS: 130,
    artist: "klaf.",
    title: "caracol",
  },
  {
    src: "/bg-music/15-michael-janzen-it-came-upon-a-midnight-clear.mp3",
    durationS: 181,
    artist: "Michael Janzen",
    title: "it came upon a midnight clear",
  },
  {
    src: "/bg-music/16-nicholas-bamberger-peace-and-quiet.mp3",
    durationS: 159,
    artist: "Nicholas Bamberger",
    title: "peace & quiet",
  },
  {
    src: "/bg-music/17-sid-acharya-the-life-equation.mp3",
    durationS: 213,
    artist: "Sid Acharya",
    title: "the life equation",
  },
];
