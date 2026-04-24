import type { ColorGroup, SectionOneData, SectionTwoData } from "./SurahConfig";

export interface SurahDataShape {
  bismillah: string;
  section1: SectionOneData;
  section2: SectionTwoData;
}

// Arabic data (default language)
export const SURAH_DATA_ARABIC: SurahDataShape = {
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
  } satisfies SectionOneData,

  section2: {
    topLabel: "Beş ayetlik 1. Açıklama Böl.",
    introVerse: { number: 6, text: "كَلَّا إِنَّ الْإِنْسَانَ لَيَطْغَىٰ" },
    colorGroups: [
      {
        // Group 1 — Upper maroon block (verses 7–10)
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0.01,
        verses: [
          { number: 8, text: "إِنَّ إِلَىٰ رَبِّكَ الرُّجْعَىٰ" },
          { number: 7, text: "أَنْ رَآهُ اسْتَغْنَىٰ" },
          { number: 10, text: "عَبْدًا إِذَا صَلَّىٰ" },
          { number: 9, text: "أَرَأَيْتَ الَّذِي يَنْهَىٰ" },
        ],
      },
      {
        // Group 2 — Center green block (verses 11–14), indented/pushed in
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [
          { number: 12, text: "أَوْ أَمَرَ بِالتَّقْوَىٰ" },
          { number: 11, text: "أَرَأَيْتَ إِنْ كَانَ عَلَى الْهُدَىٰ" },
          { number: 14, text: "أَلَمْ يَعْلَمْ بِأَنَّ اللَّهَ يَرَىٰ" },
          { number: 13, text: "أَرَأَيْتَ إِنْ كَذَّبَ وَتَوَلَّىٰ" },
        ],
      },
      {
        // Group 3 — Lower maroon block (verses 15–18)
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0.01,
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
    ] satisfies ColorGroup[],
    outroVerse: {
      number: 19,
      text: "كَلَّا لَا تُطِعْهُ وَاسْجُدْ وَاقْتَرِبْ",
    },
    bottomLabel: "Beş ayetlik 2. Açıklama Böl.",
  } satisfies SectionTwoData,
};

// Turkish data exactly as it appears in the provided image
export const SURAH_DATA_TURKISH: SurahDataShape = {
  bismillah: "بِسْـــــــــــــــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",

  section1: {
    label: "Beş ayetlik Ana Bölüm",
    gridVerses: [
      {
        number: 2,
        text: "2. Evet Rabbin insanı, alak'tan, yani bir hücrecikten yarattı.",
      },
      {
        number: 1,
        text: "1. Ya Muhammed, Sana nazil olan şu ayetleri Rabbin namına insanlara oku: (insanı) O yarattı.",
      },
      {
        number: 4,
        text: "4. İnsanlara (Tevrat ve İncildeki bilgileri) kalemle öğretti.",
      },
      {
        number: 3,
        text: "3. Yine bu ayetleri Rabbin adına oku ki O çok lütufkardır",
      },
    ],
    anaAyet: {
      number: 5,
      text: "5. Allah şimdi ümmi bir insana yani Muhammed Aleyhisselama vahyederek daha önce bilmediği şeyleri öğretti yani Onu kendisine Elçi yaptı.",
    },
  } satisfies SectionOneData,

  section2: {
    topLabel: "Beş ayetlik 1. Açıklama Böl.",
    introVerse: {
      number: 6,
      text: "6. Bak şimdi başka bir insan (Ebu Cehil), güneş gibi apaçık olan Risalet-i Muhammediyeyi inkar ve taşkınlık ediyor:",
    },
    colorGroups: [
      {
        // Group 1 — Upper maroon block (verses 7–10)
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0.01,
        verses: [
          {
            number: 8,
            text: "8. Halbuki sonunda yine yaratan Rabbine dönülecek",
          },
          {
            number: 7,
            text: "7. (Çevresine güvenerek) kendisini Allaha karşı müstağni görüyor.",
          },
          {
            number: 10,
            text: "10. Bir kulu (peygamberi) namaz kılarken engelliyor.",
          },
          {
            number: 9,
            text: "9. Gördün mü şu aşırı giderek namaza) engel olanı.",
          },
        ],
      },
      {
        // Group 2 — Center green block (verses 11–14), indented/pushed in
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [
          { number: 12, text: "12. Allah'a itaat edin diyorsa ?" },
          { number: 11, text: "11. Ya O Kul doğru yoldaysa ?" },
          {
            number: 14,
            text: "14. Allah'ın her şeyi gördüğünü bilmiyor mu yoksa?.",
          },
          {
            number: 13,
            text: "13. Ya öbürü, dini yalanlıyor ve ibadetten yüz çeviriyorsa?",
          },
        ],
      },
      {
        // Group 3 — Lower maroon block (verses 15–18)
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0.01,
        verses: [
          {
            number: 16,
            text: "16. O yalancı, o secdesiz alnından tutar cehenneme atarız.",
          },
          {
            number: 15,
            text: "15. Hayır! Eğer vazgeçmezse biz onu alnından tutar sürükleriz.",
          },
          {
            number: 18,
            text: "18. O zaman elbette biz de, çağıracağız zebanileri.",
          },
          {
            number: 17,
            text: "17. Çağırsın o zaman o (çok güvendiği) çevresini,",
          },
        ],
      },
    ] satisfies ColorGroup[],
    outroVerse: {
      number: 19,
      text: "19. Hayır! Sakın onun mahkumu olma! (Allaha) secde et ve Ona yaklaş.",
    },
    bottomLabel: "Beş ayetlik 2. Açıklama Böl.",
  } satisfies SectionTwoData,
};

// English translated data
export const SURAH_DATA_ENGLISH: SurahDataShape = {
  bismillah: "بِسْـــــــــــــــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",

  section1: {
    label: "Five-verse Main Section",
    gridVerses: [
      {
        number: 2,
        text: "2. Yes, your Lord created man from an 'alaq, that is, a single cell.",
      },
      {
        number: 1,
        text: "1. (O Muhammad, read these verses revealed to you to people in the name of your Lord: He created (man).",
      },
      {
        number: 4,
        text: "4. He taught people (the knowledge in the Torah and the Gospel) by the pen.",
      },
      {
        number: 3,
        text: "3. Read these verses again in the name of your Lord, for He is most generous.",
      },
    ],
    anaAyet: {
      number: 5,
      text: "5. Now Allah has taught an unlettered man, Muhammad (Peace be upon him), by revelation, things he did not know before, that is, He made him a Messenger for Himself.",
    },
  } satisfies SectionOneData,

  section2: {
    topLabel: "Five-verse 1st Explanation Section",
    introVerse: {
      number: 6,
      text: "6. Look now at another man (Abu Jahl), who denies and rebels against the Prophethood of Muhammad, which is as clear as the sun:",
    },
    colorGroups: [
      {
        // Group 1 — Upper maroon block (verses 7–10)
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0.01,
        verses: [
          {
            number: 8,
            text: "8. However, in the end, there will be a return to the Creator Lord.",
          },
          {
            number: 7,
            text: "7. (Relying on his surroundings) he sees himself as self-sufficient against Allah.",
          },
          {
            number: 10,
            text: "10. He prevents a servant (prophet) while he is praying.",
          },
          {
            number: 9,
            text: "9. Have you seen the one who goes too far and prevents (prayer).",
          },
        ],
      },
      {
        // Group 2 — Center green block (verses 11–14), indented/pushed in
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [
          { number: 12, text: "12. Or if he commands obedience to Allah?" },
          {
            number: 11,
            text: "11. What if that Servant is on the right path?",
          },
          {
            number: 14,
            text: "14. Does he not know that Allah sees everything?",
          },
          {
            number: 13,
            text: "13. What if the other denies the religion and turns away from worship?",
          },
        ],
      },
      {
        // Group 3 — Lower maroon block (verses 15–18)
        isPushedIn: false,
        isCenter: false,
        extraRowGap: 0.01,
        verses: [
          {
            number: 16,
            text: "16. That lying, prostration-less forelock, We will grab it and throw it into hell.",
          },
          {
            number: 15,
            text: "15. No! If he does not desist, We will grab him by his forelock and drag him.",
          },
          {
            number: 18,
            text: "18. Then We too, will certainly call the guards of hell (Zabaniya).",
          },
          {
            number: 17,
            text: "17. Let him call then upon his (trusted) associates,",
          },
        ],
      },
    ] satisfies ColorGroup[],
    outroVerse: {
      number: 19,
      text: "19. No! Beware, do not be subjected to him! Prostrate (to Allah) and draw near to Him.",
    },
    bottomLabel: "Five-verse 2nd Explanation Section",
  } satisfies SectionTwoData,
};
