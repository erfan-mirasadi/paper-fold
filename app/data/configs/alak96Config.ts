import { type SurahSideInfoConfig } from "../schema";
import type { SurahDataShape } from "../SurahConfig";
import type { SurahLanguage } from "../../hooks/useSurahLanguageStore";
import {
  ORANGE_THEME,
  MAROON_THEME,
  GREEN_THEME,
  CAPSULE_BG_6_19,
  CAPSULE_BG_7_8_17_18,
  CAPSULE_BG_9_10_15_16,
  CAPSULE_BG_12_14,
} from "../theme";


/**
 * Imported as a VALUE, not merely re-exported, because the bottom of this file
 * still reaches into it to attach the English side-info panel once that panel
 * has been defined. Re-exported too, so existing importers of this module keep
 * working unchanged.
 *
 * The layout itself now lives in `alak96Layout.ts` — see the note there for why
 * the two must stay in separate modules.
 */
import { ALAK_LAYOUT_CONFIG } from "./alak96Layout";
export { ALAK_LAYOUT_CONFIG };
// ---------------------------------------------------------------------------
// TEXT DATA
// ---------------------------------------------------------------------------

// Arabic data (default language)
export const ALAK_TEXT_AR: SurahDataShape = {
  bismillah: "بِسْـــــــــــــــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",

  section1: {
    label: "Beş ayetlik Ana Böl.",
    gridVerses: [
      { number: 2, text: "خَلَقَ الْإِنْسَانَ مِنْ عَلَقٍ" },
      { number: 1, text: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ" },
      { number: 4, text: "الَّذِي عَلَّمَ بِالْقَلَمِ" },
      { number: 3, text: "اقْرَأْ وَرَبُّكَ الْأَكْرَمُ" },
    ],
    anaAyet: { number: 5, text: "عَلَّمَ الْإِنْسَانَ مَا لَمْ يَعْلَمْ" },
  },

  section2: {
    topLabel: "Beş ayetlik 1. Açıklama Böl.",
    introVerse: { number: 6, text: "كَلَّا إِنَّ الْإِنْسَانَ لَيَطْغَىٰ" },
    colorGroups: [
      {
        // Group 1 — Upper maroon block (verses 7–10)
        verses: [
          { number: 8, text: "إِنَّ إِلَىٰ رَبِّكَ الرُّجْعَىٰ" },
          { number: 7, text: "أَنْ رَآهُ اسْتَغْنَىٰ" },
          { number: 10, text: "عَبْدًا إِذَا صَلَّىٰ" },
          { number: 9, text: "أَرَأَيْتَ الَّذِي يَنْهَىٰ" },
        ],
      },
      {
        // Group 2 — Center green block (verses 11–14), indented/pushed in
        verses: [
          { number: 12, text: "أَوْ أَمَرَ بِالتَّقْوَىٰ" },
          { number: 11, text: "أَرَأَيْتَ إِنْ كَانَ عَلَى الْهُدَىٰ" },
          { number: 14, text: "أَلَمْ يَعْلَمْ بِأَنَّ اللَّهَ يَرَىٰ" },
          { number: 13, text: "أَرَأَيْتَ إِنْ كَذَّبَ وَتَوَلَّىٰ" },
        ],
      },
      {
        // Group 3 — Lower maroon block (verses 15–18)
        verses: [
          { number: 16, text: "نَاصِيَةٍ كَاذِبَةٍ خَاطِئَةٍ" },
          {
            number: 15,
            text: "كَلَّا لئِنْ لَمْ يَنْتَهِ لَنَسْفَعًا بِالنَّاصِيَةِ",
          },
          { number: 18, text: "سَنَدْعُ الزَّبَانِيَةَ" },
          { number: 17, text: "فَلْيَدْعُ نَادِيَهُ" },
        ],
      },
    ],
    outroVerse: {
      number: 19,
      text: "كَلَّا لَا تُطِعْهُ وَاسْجُدْ وَاقْتَرِبْ",
    },
    bottomLabel: "Beş ayetlik 2. Açıklama Böl.",
  },
};

// Turkish data exactly as it appears in the provided image
export const ALAK_TEXT_TR: SurahDataShape = {
  bismillah: "بِسْـــــــــــــــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",

  section1: {
    label: "Beş ayetlik Ana Bölüm",
    gridVerses: [
      {
        number: 1,
        text: "Ya Muhammed, Sana nazil olan şu ayetleri Rabbin namına insanlara oku: (insanı) O yarattı.",
      },
      {
        number: 2,
        text: "Evet Rabbin insanı, alak'tan, yani bir hücrecikten yarattı.",
      },
      {
        number: 3,
        text: "Yine bu ayetleri Rabbin adına oku ki O çok lütufkardır",
      },
      {
        number: 4,
        text: "İnsanlara (Tevrat ve İncildeki bilgileri) kalemle öğretti.",
      },
    ],
    anaAyet: {
      number: 5,
      text: "Allah şimdi ümmi bir insana yani Muhammed Aleyhisselama vahyederek daha önce bilmediği şeyleri öğretti yani Onu kendisine Elçi yaptı.",
    },
  },

  section2: {
    topLabel: "Beş ayetlik 1. Açıklama Böl.",
    introVerse: {
      number: 6,
      text: "Bak şimdi başka bir insan (Ebu Cehil), güneş gibi apaçık olan Risalet-i Muhammediyeyi inkâr ve taşkınlık ediyor:",
    },
    colorGroups: [
      {
        // Group 1 — Upper maroon block (verses 7–10)
        verses: [
          {
            number: 7,
            text: "(Çevresine güvenerek) kendisini Allaha karşı müstağni görüyor.",
          },
          {
            number: 8,
            text: "Halbuki sonunda yine yaratan Rabbine dönülecek",
          },
          {
            number: 9,
            text: "Gördün mü şu aşırı giderek namaza) engel olanı.",
          },
          {
            number: 10,
            text: "Bir kulu (peygamberi) namaz kılarken engelliyor.",
          },
        ],
      },
      {
        // Group 2 — Center green block (verses 11–14), indented/pushed in
        verses: [
          { number: 11, text: "Ya O Kul doğru yoldaysa ?" },
          { number: 12, text: "Allah'a itaat edin diyorsa ?" },
          {
            number: 13,
            text: "Ya öbürü, dini yalanlıyor ve ibadetten yüz çeviriyorsa?",
          },
          {
            number: 14,
            text: "Allah'ın her şeyi gördüğünü bilmiyor mu yoksa?.",
          },
        ],
      },
      {
        // Group 3 — Lower maroon block (verses 15–18)
        verses: [
          {
            number: 15,
            text: "Hayır! Eğer vazgeçmezse biz onu alnından tutar sürükleriz.",
          },
          {
            number: 16,
            text: "O yalancı, o secdesiz alnından tutar cehenneme atarız.",
          },
          {
            number: 17,
            text: "Çağırsın o zaman o\n(çok güvendiği) çevresini,",
          },
          {
            number: 18,
            text: "O zaman elbette biz de, çağıracağız zebanileri.",
          },
        ],
      },
    ],
    outroVerse: {
      number: 19,
      text: "Hayır! Sakın onun mahkumu olma! (Allaha) secde et ve Ona yaklaş.",
    },
    bottomLabel: "Beş ayetlik 2. Açıklama Böl.",
  },
};

// English translated data — the verse capsules and the section labels exactly
// as the English edition of the tafsir prints them (Al-‘Alaq.docx).
export const ALAK_TEXT_EN: SurahDataShape = {
  bismillah: "بِسْـــــــــــــــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",

  section1: {
    label: "The Five-Verse Principal Section",
    gridVerses: [
      {
        number: 1,
        text: "(O Muhammad), recite to the people, in\nthe Name of your Lord, the verses now being revealed to you: He created the human being.",
      },
      {
        number: 2,
        text: "Yes, your Lord created the human being from an ‘alaq, a tiny clinging cell.",
      },
      {
        number: 3,
        text: "Recite these verses again in the Name of your Lord, for He is infinitely generous.",
      },
      {
        number: 4,
        text: "He taught human beings by the pen, including the knowledge contained in the Torah and the Gospel.",
      },
    ],
    anaAyet: {
      number: 5,
      text: "By revealing to an unlettered man (Muhammad ﷺ)\nGod taught him what he had not previously known\nand appointed him as His Messenger.",
    },
  },

  section2: {
    topLabel: "The 1st Five-Verse Explanatory Section",
    introVerse: {
      number: 6,
      text: "Now look: another man, Abu Jahl, denies the Prophethood of Muhammad ﷺ, though it is as evident as the sun, and he transgresses.",
    },
    colorGroups: [
      {
        // Group 1 — Upper maroon block (verses 7–10)
        verses: [
          {
            number: 7,
            text: "Relying upon his circle, he considers himself independent of God.",
          },
          {
            number: 8,
            text: "Yet in the end everyone will return to the Lord Who created them.",
          },
          {
            number: 9,
            text: "Have you seen the one who goes to excess and prevents the Prayer?",
          },
          {
            number: 10,
            text: "He prevents a servant, the Prophet, while he is praying.",
          },
        ],
      },
      {
        // Group 2 — Center green block (verses 11–14), indented/pushed in
        verses: [
          { number: 11, text: "What if that servant is rightly guided?" },
          { number: 12, text: "What if he calls people to obey God?" },
          {
            number: 13,
            text: "And what if the other man denies the religion and turns away from worship?",
          },
          { number: 14, text: "Does he not know that God sees all things?" },
        ],
      },
      {
        // Group 3 — Lower maroon block (verses 15–18)
        verses: [
          {
            number: 15,
            text: "No indeed! If he does not desist, We will seize him by the forelock and drag him away.",
          },
          {
            number: 16,
            text: "We will seize him by his lying, sinful forelock, a forehead bearing no trace of prostration, and cast him into Hell.",
          },
          {
            number: 17,
            text: "Then let him call upon the circle in which he places such confidence.",
          },
          {
            number: 18,
            text: "We too will summon the angels of punishment.",
          },
        ],
      },
    ],
    outroVerse: {
      number: 19,
      text: "No indeed! O Messenger, do not submit to him. Prostrate yourself before God and draw near to Him.",
    },
    bottomLabel: "The 2nd Five-Verse Explanatory Section",
  },
};

// ---------------------------------------------------------------------------
// Aggregated text data (Record<SurahLanguage, SurahDataShape>)
// ---------------------------------------------------------------------------

export const ALAK_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: ALAK_TEXT_AR,
  en: ALAK_TEXT_EN,
  tr: ALAK_TEXT_TR,
};

// ---------------------------------------------------------------------------
// TAFSIR PANEL — ENGLISH
//
// A single, continuous, paragraph-by-paragraph transcription of the English
// edition of the tafsir (Al-‘Alaq.docx), top to bottom, in the EXACT order
// the document prints it — not reorganized around the fold story's own
// verse-by-verse reveal timing the way the Turkish panel above is. Every
// sentence is exactly as printed; nothing paraphrased, added, or omitted.
// It all lives in `byFoldStep["pre-start"]` alone (no byVerse entries, no
// other fold-step entries) so the reading order is never at the mercy of
// which verse the fold story happens to reveal first.
//
// The docx's own section headings are used verbatim as `{ subtitle }` items;
// any paragraph that IS a numbered verse citation ("6. Now look…") becomes a
// capsule instead of plain text, colored per that verse's group exactly as
// the Turkish panel colors it (verses 1–6 & 19 → orange/CAPSULE_BG_6_19,
// 7/8/17/18 → maroon/CAPSULE_BG_7_8_17_18, 9/10/15/16 →
// maroon/CAPSULE_BG_9_10_15_16, 11–14 → green/CAPSULE_BG_12_14) — everything
// else stays plain prose, verbatim. Capsule order always matches the docx's
// own left-to-right, top-to-bottom order (never regrouped by color).
//
// No `recitation` here: the recorded readings exist only in Turkish, so the
// English panel is written text throughout.
// ---------------------------------------------------------------------------

const ALAK_SIDE_INFO_EN: SurahSideInfoConfig = {
  byFoldStep: {
    "pre-start": {
      title:
        "All beings speak, each in the language of its state, bearing witness to its Creator.",
      paragraphs: [
        "All the organs in the bodies of living beings interact with one another and continuously exchange information. The brain is likewise in constant communication with every organ through its own complex signaling system.",
        "The bodies of animals and human beings resemble well-ordered cities. At every moment within the city of the body, countless channels carry messages and transmit information.",
        "Animals also communicate among themselves, speaking in their own languages and expressing their feelings.",
        "Plants send messages to insects through their colors and the scents they release. The wind carries the fragrance and messages of flowers over long distances and becomes a special messenger for them.",
        "Human speech, however, stands far above animal communication, for God has endowed human beings not only with highly developed brains but also with the unique capacity for language and discourse. Through this gift, humanity is able to express meaning, convey knowledge, and communicate in a great variety of languages.",
        { subtitle: "GOD’S SPEECH: REVELATION" },
        "God, Who enables all living beings to speak in languages suited to them, certainly knows how to speak Himself. “Would the One Who creates not know?” The One Who knows how to speak surely speaks—and He has spoken. His speech reaches creation in the forms of revelation and inspiration.",
        "The Exalted Creator addressed His Prophets through revelation. He also revealed His words to the Prophet Muhammad, peace and blessings be upon him, who possessed the noblest natural disposition and the most perfect character among humankind, speaking to him as the Lord of all worlds.",
        "He spoke and, through him, sent His message to all humanity.",
        { subtitle: "SENDING PROPHETS" },
        "The Eternal Power who has endowed bees and ants with an ordered social life, migratory birds and schooling fish with means of guidance and coordination, and countless newborn creatures with parental care or instinctive direction would certainly not leave human beings without Prophets. He would appoint as guides from among them those of the finest disposition, the greatest sensitivity and compassion, and the noblest character, and through them show humanity the way. From this perspective, Prophets are the natural leaders and guiding centers of human communities. Sending Prophets is perfectly consonant with Divine wisdom.",
        "History shows that if Prophets are removed from the human story, humanity cannot make a serious advance in civilization or in true human development.",
        "Before the coming of the Prophet Muhammad, peace and blessings be upon him, Almighty God sent about one hundred and twenty thousand Prophets. He sent nearly every community a Prophet who invited them to God and to worship. The Prophet Muhammad, peace and blessings be upon him, is the final Prophet. No Prophet will come after him.",
        { subtitle: "THE FIRST SURAH OF THE QUR’AN" },
        "When the Messenger of God, peace and blessings be upon him, was forty years old and in retreat in the Cave of Hira, Almighty God, the Creator of all things, spoke to him through the angel Gabriel, peace be upon him, by way of revelation, and sent him His first message. That message consisted of the first five verses of Surah al-‘Alaq.",
        "Thus the Qur’an, God’s final revealed Book, began to descend. Its revelation then continued for twenty-three years. It came verse by verse and surah by surah, and was completed over the course of those twenty-three years.",
        "The verses and surahs of the Qur’an were generally revealed at moments of need. Each surah or verse either established a principle of Islamic faith or worship, gave hope to the believers, invited those who did not believe, solved an immediate problem, or became the language and message of the believers and shaped the agenda of the moment.",
        "One might expect a book revealed in separate portions because of different events and changing needs to lack coherence and meaningful connection among its verses. Yet the Qur’an is such a Word of God that it possesses extraordinary unity both among its verses and among its surahs, as though it had descended all at once; and within that unity lies a perfect system. We see many examples of this truth in this book.",
        "Since this is the first surah revealed and these are the first revealed verses, let us offer some information here about the Qur’an and revelation.",
        "The Qur’an contains 114 surahs. Some are very short, while others are very long.",
        "The angelic messenger Gabriel, peace be upon him, brought revelation, the Word of God, to the Prophet Muhammad, peace and blessings be upon him. The Prophet immediately memorized what was revealed and then dictated it to the scribes of revelation. Muslims would write every newly revealed verse for themselves, memorize it, and recite it in the Prayer.",
        "When revelation came to the Messenger of God, its arrival could be observed. Even in cold weather he would begin to perspire, appear almost overcome, and grow physically heavy. If he was riding a camel, the animal would feel that weight and sink down to the ground.",
        "God’s Messenger, peace and blessings be upon him, stated: “Revelation comes to me in different ways. Sometimes Gabriel takes human form and speaks with me. Sometimes he appears in his own special form with his wings, and I retain everything he says to me. At other times it comes like the humming of bees or the ringing of a bell. This last form is the most difficult for me.” (Sahih al-Bukhari, Book 1, Hadith 2).",
        "The Qur’an is entirely the Word of God. Neither the Messenger of God nor anyone else intervened in it on his own initiative. The order of the surahs and the arrangement of the verses were established wholly by Divine command.",
        "Through its first five verses, Surah al-‘Alaq establishes the positive truth that human beings must know and believe, setting forth the unchanging reality.",
        "The two explanatory sections that follow then present examples of negative realities that ought not to exist: unbelief and oppression.",

        { subtitle: "THE FIVE-VERSE PRINCIPAL SECTION" },
        {
          columns: 1,
          corners: "soft",
          textColor: "#2B2B2B",
          capsules: [
            {
              n: 1,
              text: " (O Muhammad), recite to the people, in the Name of your Lord, the verses now being revealed to you: He created the human being.",
              color: ORANGE_THEME,
              bg: CAPSULE_BG_6_19,
            },
            {
              n: 2,
              text: " Yes, your Lord created the human being from an ‘alaq, a tiny clinging cell.",
              color: ORANGE_THEME,
              bg: CAPSULE_BG_6_19,
            },
            {
              n: 3,
              text: " Recite these verses again in the Name of your Lord, for He is infinitely generous.",
              color: ORANGE_THEME,
              bg: CAPSULE_BG_6_19,
            },
            {
              n: 4,
              text: " He taught human beings by the pen, including the knowledge contained in the Torah and the Gospel.",
              color: ORANGE_THEME,
              bg: CAPSULE_BG_6_19,
            },
            {
              n: 5,
              text: " By revealing to an unlettered man (Muhammad, peace and blessings be upon him) God taught him what he had not previously known and appointed him as His Messenger.",
              color: ORANGE_THEME,
              bg: CAPSULE_BG_6_19,
              textColor: "#A30000",
              span: true,
            },
          ],
        },

        { subtitle: "THE FIRST FIVE-VERSE EXPLANATORY SECTION" },
        {
          columns: 1,
          corners: "soft",
          textColor: "#2B2B2B",
          capsules: [
            {
              n: 6,
              text: " Now look: another man, Abu Jahl, denies the Prophethood of Muhammad, peace and blessings be upon him, though it is as evident as the sun, and he transgresses.",
              color: ORANGE_THEME,
              bg: CAPSULE_BG_6_19,
              textColor: "#A30000",
            },
            {
              n: 7,
              text: " Relying upon his circle, he considers himself independent of God.",
              color: MAROON_THEME,
              bg: CAPSULE_BG_7_8_17_18,
            },
            {
              n: 8,
              text: " Yet in the end everyone will return to the Lord Who created them.",
              color: MAROON_THEME,
              bg: CAPSULE_BG_7_8_17_18,
            },
            {
              n: 9,
              text: " Have you seen the one who goes to excess and prevents the Prayer?",
              color: MAROON_THEME,
              bg: CAPSULE_BG_9_10_15_16,
            },
            {
              n: 10,
              text: " He prevents a servant, the Prophet, while he is praying.",
              color: MAROON_THEME,
              bg: CAPSULE_BG_9_10_15_16,
            },
            {
              n: 11,
              text: " What if that servant is rightly guided?",
              color: GREEN_THEME,
              bg: CAPSULE_BG_12_14,
            },
            {
              n: 12,
              text: " What if he calls people to obey God?",
              color: GREEN_THEME,
              bg: CAPSULE_BG_12_14,
            },
            {
              n: 13,
              text: " And what if the other man denies the religion and turns away from worship?",
              color: GREEN_THEME,
              bg: CAPSULE_BG_12_14,
            },
            {
              n: 14,
              text: " Does he not know that God sees all things?",
              color: GREEN_THEME,
              bg: CAPSULE_BG_12_14,
            },
            {
              n: 15,
              text: " No indeed! If he does not desist, We will seize him by the forelock and drag him away.",
              color: MAROON_THEME,
              bg: CAPSULE_BG_9_10_15_16,
            },
            {
              n: 16,
              text: " We will seize him by his lying, sinful forelock, a forehead bearing no trace of prostration, and cast him into Hell.",
              color: MAROON_THEME,
              bg: CAPSULE_BG_9_10_15_16,
            },
            {
              n: 17,
              text: " Then let him call upon the circle in which he places such confidence.",
              color: MAROON_THEME,
              bg: CAPSULE_BG_7_8_17_18,
            },
            {
              n: 18,
              text: " We too will summon the angels of punishment.",
              color: MAROON_THEME,
              bg: CAPSULE_BG_7_8_17_18,
            },
            {
              n: 19,
              text: " No indeed! O Messenger, do not submit to him. Prostrate yourself before God and draw near to Him.",
              color: ORANGE_THEME,
              bg: CAPSULE_BG_6_19,
              textColor: "#A30000",
              span: true,
            },
          ],
        },

        { subtitle: "THE SECOND FIVE-VERSE EXPLANATORY SECTION" },
        "The first five-verse passage is the principal section of this surah. The essential message intended by the surah is stated concisely within it.",
        "The Qur’an’s audiences in Mecca were the Meccan polytheists, along with Christians and Jews. God takes both audiences into account in His expressions. They are addressed here in sequence. The principal five-verse passage may be unfolded as follows:",
        {
          color: ORANGE_THEME,
          bg: CAPSULE_BG_6_19,
          corners: "soft",
          textColor: "#2B2B2B",
          capsules: [
            {
              n: 3,
              text: " Recite these verses in the Name of your Lord to the Christians and Jews as well, for your Lord bestowed great favors upon them, that is, He sent them Prophets and Books.",
            },
          ],
        },
        "The principal verse of this first section is verse 5. It is therefore also the principal verse of the entire surah.",
        "Could there have been a more fitting and beautiful first message to descend upon the Messenger of God than one that announces his Prophethood and Messengership to all humanity? Many statements are contained implicitly within this single verse:",
        "The Prophet Muhammad, peace and blessings be upon him, is a human being,",
        "just as the earlier Prophets were human beings.",
        "Before revelation came, he was not a person who already knew the verses now descending to him and those that would later descend.",
        "Nor was he a religious scholar who had learned the Torah and the Gospel through reading and writing.",
        "God is the One Who taught him the verses he now recites.",
        "He is a Messenger of God charged with reciting to you the verses now revealed to him.",
        "Now let us consider the twin verses that elaborate and unfold the principal verse:",
        "As the Messenger of your Lord, recite these verses to the idol-worshiping polytheists: God is the Lord Who created them, not their idols. They must therefore believe in and worship God, the Creator of all things, rather than worshiping idols.",
        "Yes, your Lord created the human being from a tiny cell clinging within the mother’s womb. How can you abandon the Lord Who accomplished this wondrous event and brought you into the world, and worship other things?",
        "God reminds the polytheists, who knew nothing of true religion, of the blessing and miracle of creation. We too draw a lesson for ourselves.",
        "God’s first blessing is that He created us in a wondrous form as human beings and brought us into the world. In return, He asks us only to worship Him. He has every right to ask this of us.",
        "As human beings created by God, should not our response to this invitation from our Creator be immediate faith and obedience with all our hearts?",
        "Let us consider two further twin verses that elaborate the principal verse:",
        {
          columns: 2,
          frame: true,
          color: ORANGE_THEME,
          bg: CAPSULE_BG_6_19,
          corners: "soft",
          textColor: "#2B2B2B",
          capsules: [
            {
              n: 3,
              text: " Recite these verses in the Name of your Lord to the Christians and Jews as well, for your Lord bestowed favors upon their Prophets, that is, He revealed to them and gave them Books.",
            },
            {
              n: 4,
              text: " He taught humanity the Torah and the Gospel by the pen. They are therefore not strangers to Scripture and Prophethood and should not keep their distance from the Qur’an.",
            },
          ],
        },
        "God’s second great blessing is the blessing of guidance, the blessing of sending a Book.",
        "From these twin verses we understand that, under the conditions of that time, the Qur’an and the Prophet addressed, after the polytheists, the People of the Book living in the Arabian Peninsula: Christians and Jews. It is entirely natural that these two verses should address them.",
        "Indeed, many verses of the Qur’an show that the Qur’an had two principal audiences in Mecca: the polytheists and the People of the Book, Christians and Jews.",
        "We said that God’s creation of us as human beings is His first blessing. After the blessing of creation, His second blessing is that He guides humanity by sending Books and Prophets. The principal, firm section ends here. We now turn to the corresponding twin sections, which concern changing events.",
        "How, then, does one man from among the Meccan polytheists respond to these two great blessings? The answer appears in the second section.",

        { subtitle: "THE SECOND SECTION: EXPLANATION" },
        {
          columns: 2,
          frame: true,
          color: ORANGE_THEME,
          bg: CAPSULE_BG_6_19,
          corners: "soft",
          textColor: "#2B2B2B",
          capsules: [
            {
              n: 6,
              text: " Now look: this man, Abu Jahl, not only refuses to believe in the Prophet but goes further, transgresses, and commits oppression.",
              span: true,
              textColor: "#A30000",
            },
            {
              n: 7,
              text: " Instead of believing in God, Who created him, the man claims independence. Relying on his circle, he says, “I have no need of God or religion,” and denies the truth.",
              color: MAROON_THEME,
              bg: CAPSULE_BG_7_8_17_18,
            },
            {
              n: 8,
              text: " Yet in the end he will return to the presence of the Lord Who created him, leaving everything behind in this world.",
              color: MAROON_THEME,
              bg: CAPSULE_BG_7_8_17_18,
            },
            {
              n: 9,
              text: " Have you seen the man who commits many forms of oppression and even prevents the most innocent act of worship, the Prayer? Instead of worshiping, he obstructs worship.",
              color: MAROON_THEME,
              bg: CAPSULE_BG_9_10_15_16,
            },
            {
              n: 10,
              text: " Using force, he imposes prohibitions upon a servant of God—the Prophet—while he is praying. He attempts to take away people’s right to believe and worship.",
              color: MAROON_THEME,
              bg: CAPSULE_BG_9_10_15_16,
            },
          ],
        },
        "What does this man do? The following two verses explain the principal verse and describe the denial and self-sufficiency of Abu Jahl and those like him, the stage of denial:",
        "7. Instead of believing in God, Who created him, the man claims independence. Relying on his circle, he says, “I have no need of God or religion,” and denies the truth.",
        "8. Yet just as God created him in the beginning, in the end he will return to the presence of the Lord Who created him.",
        "The next two verses explain that Abu Jahl and those like him go beyond denial into oppression, rebellion, and transgression, the stage of tughyan:",
        "9. Have you seen the man who commits many forms of oppression and even prevents the most innocent act of worship, the Prayer? Instead of worshiping, he obstructs worship.",
        "10. Using force, he imposes prohibitions upon a servant of God, the Prophet, while he is observing the Prayer. He attempts to take away the right of others to believe and worship.",

        {
          subtitle:
            "THE FOUR-VERSE INTERLUDE: AN APPEAL TO REASON AND CONSCIENCE",
        },
        "The four-verse interlude calls people of reason and conscience to fairness and sound judgment.",
        "Even if people like Abu Jahl refuse to understand any word, there will certainly be others who look at the Prophet and his rightful message with conscience and reflection. The Qur’an addresses them through these four verses:",
        {
          columns: 2,
          frame: true,
          color: GREEN_THEME,
          bg: CAPSULE_BG_12_14,
          corners: "soft",
          textColor: "#2B2B2B",
          capsules: [
            { n: 11, text: " What if this Prophet is rightly guided?" },
            { n: 12, text: " What if he calls people to obey God alone?" },
            {
              n: 13,
              text: " And what if that other man denies the truth and turns his back?",
            },
            { n: 14, text: " Does he not know that God sees him?" },
          ],
        },
        "Verse 11 says: Look at the truthfulness and integrity of the Prophet Muhammad, peace and blessings be upon him, and at the beauty of the faith to which he calls: “There is no deity but God.” Understand from this that his cause and invitation are true, and believe in him.",
        "Verse 12 says: The second thing the Prophet asks of you is simply worship and obedience to the One God. He asks nothing else of you.",
        "Verse 13 says: Abu Jahl and those like him rejected the invitation to faith described above and turned their backs upon the Prophet’s call.",
        "Verse 14 says: Do they imagine they will be left without restraint or accountability? God certainly sees their denial and rebellion and will call them to account for it.",

        { subtitle: "HARDENED UNBELIEVERS OR THE STUBBORNLY DEFIANT" },
        "They have never once withdrawn from the noise of daily events and listened to themselves; never once looked at nature; never once reflected upon the miracle of creation; never once listened with conscience to the Prophets who speak of universal truths or to the Books God sent.",
        "They view life only through the window of bodily needs. They are small-minded people who imagine that preserving their shallow social status and petty interests is the most important matter in the world, and who become prisoners of false customs, mistaken prejudices, and empty pride.",
        "If this were all, one might still hope that one day they would reflect and find the truth. Yet some have gone far beyond denial: hostility toward religion has enveloped their souls and disturbed the balance of their reason.",
        "People who accept their own false beliefs and opinions as absolute truths, while judging every truth on the other side to be false, cannot find what is right or behave reasonably and moderately. Their mental structure has hardened like stone; their minds no longer bend. Showing them evidence and presenting proofs to break their denial is of no benefit. The fact that the other side may be right or may perform good works only drives them into greater rage. If only they could be reasonable once; if only they could doubt their own certainties a little; if only they could grant the other side even a small measure of justice.",
        "Their consciences may have darkened and their judgment may have become corrupted in this matter, but there is God, Who sees and knows all things, and there is His unfailing justice. Do they not know that God sees everything? Will God ever allow those who knowingly persist in hostility to prosper?",
        "What, then, will be the punishment in the Hereafter of those who deny and oppress in this way?",
        "The third section informs us of their condition in the Hereafter.",

        { subtitle: "THE THIRD SECTION: THE END OF TRANSGRESSION" },
        "The final two explanatory sections of the surah, together with the four-verse evaluative passage between them, declare: Such oppressive leaders will be struck down by the All-Compelling Lord of Majesty and then cast into Hell by the hand of Divine justice. Those who act in this way will also face what is coming to them. In this manner the surah breaks the courage of oppressors and restrains their attacks upon the rights and liberties of other people.",
        "Let us read in sequence the principal verses of the first, second, and third sections:",
        {
          columns: 1,
          frame: true,
          color: ORANGE_THEME,
          bg: CAPSULE_BG_6_19,
          corners: "soft",
          textColor: "#A30000",
          capsules: [
            {
              n: 5,
              text: " God has now taught an unlettered human being, His servant Muhammad, peace and blessings be upon him, what he did not know, by revealing it to him, and has sent him to humanity as a Prophet.",
            },
            {
              n: 6,
              text: " Now look: this man, Abu Jahl, not only refuses to believe in the Prophet but goes further, transgresses, and commits oppression.",
            },
            {
              n: 19,
              text: " No indeed, O My Messenger! Never submit to him. Prostrate yourself before your Lord alone and draw near to Him.",
            },
          ],
        },
        "There have always been frenzied and oppressive men of this kind in the world. God’s Messenger will not submit to such tyrants, obey them, or leave God’s cause to their whims. Despite every form of oppression and obstruction, he will continue his sacred mission.",
        "That much is clear. But what will you do, O reasonable people who have not yet lost your minds and consciences? Whose side are you on?",
        "Will you stand with God, Who created the heavens and the earth and created you, and with His Messenger, on the side of human rights and freedom? Or will you stand with certain powerful people who make the most noise, show no respect for God, and show no respect for human beings?",
        "The choice is yours. But know well that this choice will be the most important decision affecting both your life in this world and your life in the Hereafter.",

        { subtitle: "TUGHYAN: TRANSGRESSION AND TYRANNY" },
        "An important characteristic of the unbelieving human type described in this surah is tughyan, rebellious transgression. One of its clearest signs is domination over others, oppression, and assault upon life. It is the effort to prohibit and eliminate beliefs and views that differ from one’s own. It is to imagine that the idolatry embraced by oneself and one’s narrow circle is the truest and most unchangeable reality in the world, and then to display behavior reaching the level of frenzy and even paranoia.",
        "Islam does not prohibit other beliefs and viewpoints.",
        "Prophets perform their duty: they convey the message and remind people, but they impose nothing upon anyone and compel no one.",
        "You are only a reminder and a warner. You are not one appointed to compel them: “You are not one to dictate (faith) to them.” (88:22).",
      ],
    },
  },
};

// Wire the English panel in now that it's defined — ALAK_LAYOUT_CONFIG was
// built further up this same file, before ALAK_SIDE_INFO_EN existed yet.
ALAK_LAYOUT_CONFIG.sideInfoTranslations = { en: ALAK_SIDE_INFO_EN };
