/**
 * Ayat al-Kursi — Full Layout Config & Text Data
 *
 * Layout matches the hand-drawn design:
 *   - ONE fold in the middle (2 paper segments)
 *   - ONE VerticalGroupsSectionConfig with 3 groups:
 *       Top    (not pushed in): verseIds [2, 1]         — 2 chunks side-by-side
 *       Middle (pushed in):     verseIds [4, 3, 6, 5]   — 4 chunks in a 2×2 grid
 *       Bottom (not pushed in): verseIds [8, 7]         — 2 chunks side-by-side
 *
 * verseId ordering within a group: [left-col, right-col, left-col-row2, right-col-row2]
 * (i.e. even indices → left/RTL-start column, odd indices → right/RTL-end column)
 */

import type { SurahLayoutConfig, SurahSideInfoConfig } from "../schema";
import type { SurahDataShape } from "../SurahConfig";
import type { SurahLanguage } from "../../hooks/useSurahLanguageStore";

// ---------------------------------------------------------------------------
// LAYOUT CONFIG
// ---------------------------------------------------------------------------

const OUTER_GROUP_BG = "#EFE2C7"; // Yellow (Top and Bottom groups)
const OUTER_GROUP_BORDER = "#BE9E63"; // Lighter brown/gold border
const CENTER_GROUP_BG = "#CBE2EE"; // Blue/Grey (Middle group)
const CENTER_GROUP_BORDER = "#7A9CAD"; // Lighter slate blue border

export const AYAT_AL_KURSI_CONFIG: SurahLayoutConfig = {
  id: "ayatalkursi",
  title: "Bakara 255",
  heroTitle: "Ayetel",
  heroSubtitle: "kürsî",

  scriptInfo: {
    title: "Bakara: 255",
    sayfa: 42,
    juz: 3,
    hizb: 5,
    singleAyahNumber: 255,
  },

  // Fold-story → script sync: which script chunks light up at each fold step.
  // Keys are `animations.foldSteps` ids; values are verse ids. Edit freely.
  scriptHighlights: {
    "pre-start": [1, 2, 7, 8],
    end: [1, 2, 3, 4, 5, 6, 7, 8],
  },

  // Right-hand tafsir panel (SideInfoPanel). Entries follow the reference
  // tafsir book's own page order (pp. 33-42) one-for-one: byFoldStep entries
  // are the book's structural/summary pages, byVerse entries are the book's
  // per-cümle deep dives — resolveEntries renders pre-start, then verses
  // [1,2,7,8], then end, then verses [3,4,5,6], which is exactly that order.
  // Capsule text reuses this file's own AYAT_AL_KURSI_TEXT_TR translations
  // (already canonical in-app copy); the surrounding commentary is an
  // original condensed paraphrase, not a transcription of the book's prose.
  //
  // This panel is the TURKISH edition (and what Arabic falls back to). The
  // English edition is the same panel in `sideInfoTranslations.en` below —
  // its own chunk, fetched only when a reader switches to English.
  sideInfo: {
    panelTitle: "Tefsir",
    byFoldStep: {
      "pre-start": {
        paragraphs: [
          {
            capsules: [
              {
                n: 1,
                text: "Müspet cümle, doğruyu söylüyor.",
                bg: "#F3ECD5",
                color: "#C4A771",
              },
              {
                n: 2,
                text: "Menfi cümle, yanlışı düzeltiyor.",
                bg: "#DAE8EE",
                color: "#8DAAB6",
              },
              {
                n: 3,
                text: "Müspet cümle, doğruyu söylüyor.",
                bg: "#F3ECD5",
                color: "#C4A771",
              },
              {
                n: 4,
                text: "Menfi cümle, yanlışı düzeltiyor.",
                bg: "#DAE8EE",
                color: "#8DAAB6",
              },
              {
                n: 5,
                text: "Müspet cümle, doğruyu söylüyor.",
                bg: "#F3ECD5",
                color: "#C4A771",
              },
              {
                n: 6,
                text: "Menfi cümle, yanlışı düzeltiyor.",
                bg: "#DAE8EE",
                color: "#8DAAB6",
              },
              {
                n: 7,
                text: "Müspet cümle, doğruyu söylüyor.",
                bg: "#F3ECD5",
                color: "#C4A771",
              },
              {
                n: 8,
                text: "Menfi cümle, yanlışı düzeltiyor.",
                bg: "#DAE8EE",
                color: "#8DAAB6",
              },
            ],
            corners: "soft",
            color: OUTER_GROUP_BORDER,
            bg: OUTER_GROUP_BG,
            textColor: "#2B2B2B",
            frame: OUTER_GROUP_BORDER,
          },
        ],
      },
    },
    byVerse: {
      // ── Page 34 ───────────────────────────────────────────────────────
      1: {
        title: "KAİNAT BİR BÜYÜK AYNADIR; ALLAHI TANITIYOR.",
        paragraphs: [
          "Yüce Allah, bütün kainatı ve bütün varlıkları pek çok gayelerle yaratmıştır. Her şeyi yaratırken sayısız faydaları gözetmiş, her şeyin vücuduna bir çok anlamlar yüklemiştir.",
          "Her varlığın kendi hayatına ait görevi bir ise, onu yapan, yaratan Zat'a bakan manaları, hikmetleri binlerdir.",
          "Bütün varlıklar, bütün faaliyet ve varlıklarıyla kendilerini yaratan Yüce Yaratıcıya ait olan binler anlam da ifade ederler.",
          "Evet yaratılışın en büyük gayesi, Yaratıcıya bakan gayelerdir. Ona ait manalardır.",
          "Kainatta var olan her şey ve özellikle de canlı varlıklar, dünyaya gelişleriyle, hayatlarındaki bütün renkli olaylarla hep yüce yaratıcının varlığına ve Onun pek çok isim ve sıfatlarına işaret ve delalet ederler. Onu anlatırlar. Adeta her biri bir ayna gibi Onu gösterirler, Onu tanıtırlar. Onun isim ve sıfatlarını yansıtırlar.",
          "Her sanat eseri sanatkarının, ustasının imzasını, her teknoloji ürünü de kendi mühendisinin ve firmasını markasını, kalitesini taşıdığı gibi gökler ve yerlerde olan her şey de Yüce yaratıcının ismini, imzasını, ustalığını üzerinde taşır ve bizlere de sanatlı birer imza gibi Onu gösterirler. Bütün bitkiler ve canlı varlıklar Onun harika birer sanat eserleridir. Onun kudretinin, hikmetinin, ilminin, şefkatinin sonsuzluğunu gösteriyorlar. Yüce Allah'ın bin bir isminin tecellilerini aksettirirler. İşte yaratılışın en önemli gayesi bu işlevdir.",
          { subtitle: "İNSAN DERİN BİR AYNADIR; ALLAHI GÖSTERİYOR." },
          "İnsan görünüşü itibariyle küçük, fakat mahiyeti ve yaratılışındaki akıl, kalp gibi fevkalade cihazlar sayesinde de kainattan bile büyük bir varlıktır. İnsan, sahip olduğu her şeyiyle Allahı gösteren ve Onu yeryüzünde temsil eden bir yeryüzü sultanıdır.",
          "İnsanın yaratılışında da kendi hayatına bakan çok gayeler, hikmetler ve manalar ve faydalar görülüyor. Ama yaratılmışların sultanı olan insanın en büyük gayesi ve en anlamlı görevi, kainatın yaratıcısını isim ve sıfatlarıyla tanımak, hayatıyla, aklıyla, kalbiyle yani yüksek istidadıyla Ona şuurlu, özel bir ayna olmaktır.",
          {
            subtitle:
              "MUHAMMED ALEYHİSSELAM MÜKEMMEL BİR AYNADIR; ALLAHI GÖSTERİYOR.",
          },
          "O, herkesten önce Allahı tanımış. O, bütün hayatını Allahı tanımaya ve tanıtmaya adamış. O yaşayışıyla, sesiyle soluğuyla ve her an Onu gözleriyle görüyor gibi ibadetiyle ve her an Onun huzurunda bulunma haliyle hep Allahı aksettirmiş.",
          "İnsanlığın Efendisi Hz. Muhammet Aleyhi Ekmelüttehaya gibi bir Zat'ın Peygamber olarak gönderilişinde de pek çok hikmetler ve faydalar ve Onda örnek alınacak pek çok güzellikler vardır. Ancak Onun risaletle taçlandırılmasında en büyük gaye Rabbimizi bize tanıtmasıdır.",
          "Kainatın Halık-ı zülcelali ve Malik-i Zülkemali olan Rabbimizi nasıl tanıyacağız?",
          "Allah nasıl tavsif ve sena edilir ?",
          "Ona nasıl ibadet ve itaat edilir? Gibi daha pek çok sorularımızın cevabını Kur'anda ve Onun hayat-ı seniyyelerinde buluyoruz.",
          "Ayinedir bu alem her şey hak ile kaim,\nMir'at-ı Muhammetten Allah görünür daim.",
        ],
      },
      // ── Page 35 ───────────────────────────────────────────────────────
      2: {
        title:
          "KUR'AN APAÇIK BİR AYNADIR; BİZE ALLAHI GÖSTERİYOR VE TANITIYOR.",
        paragraphs: [
          "Kur'an-ı Kerimin de pek çok gayeleri, hikmetleri, faydaları vardır. Onun her bir ayeti başka başka şeylerden bahseder ve bize dersler verir. Her emri, her dersi başımız ve gözümüz üstüne. Her bir ayet çok yönleriyle bizim için nurdur, hidayettir, şifadır.",
          "Ama Kur'anın da en büyük gayesi, yine O İlahi Sözün Sahibi zişanı olan Allah'a bakar ve Ondan bahseder ve Onu tanıtır.",
          "Evet Allah, vahyettiği bu Yüce Kitapla her şeyden önce kendisini anlatıyor, kendisini tanıtıyor. Kendi İlahi maksadını bize bildiriyor. Rızasının yollarını gösteriyor.",
          'İşte Kur\'an-ı Kerimde "muhkem" adı verilen (sağlam, değişmez, sabit hakikatleri söyleyen) ayetler Allahtan bahseden, Allahı tanıtan bu ayetlerdir.',
          "Bir yönüyle Kur'anın tamamı Allahtan bahsediyor da diyebiliriz. Çünkü çeşitli varlıklardan, insanlardan ve olaylardan bahseden bütün ayetler yine sürekli bizi Allah'a yöneltiyor. Kur'an her şeyden önce içinde Allah'ı bulduğumuz bir büyük aynadır. Her bir ayet bizim için mukaddestir, kıymetlidir ama ayetler içinde en önemli, en kıymetli ayetler yine de doğrudan doğruya Allahtan bahseden, Onu tanıtan ayetlerdir.",
          "Ayet-ül Kürsi, İhlas suresi, Fatiha'nın baş tarafı ve Haşir Suresinin son üç ayeti gibi ayetler bu bakımdan Kur'anın kalbi olan ayetlerdir. Kur'anın ana ayetleridir. Muhkem hakikatleridir. Değişmeyen hakikatleridir.",
        ],
      },
      // ── Page 36 ───────────────────────────────────────────────────────
      7: {
        paragraphs: [
          "Evet Ayet-ül Kürsi, bütün cümleleriyle Rabbimizi bize tanıtıyor ve bir kısım batıl inançların da kökünü kesiyor.",
          "İnsanlar mücerret (soyut) hakikatleri misallerle daha kolay anlarlar. Bu surede de Cenab-ı Hak kendisini padişah ve saltanat misalleri ile anlatıyor.",
          "Padişahı da, onun oturduğu yüksek tahtı da bilmeyen insan yoktur. Padişahın ülkesi vardır, halkı vardır. Padişah gücü, kuvveti temsil eder. Ülkesinde onun kanunları, emirleri geçerlidir. Herkes ona saygı gösterir ve itaat eder. O, saltanatını kimseyle paylaşmaz. Onun izin ve iradesi olmadan kimse bir karış yere sahip olamaz.",
          "Bizim sınırlı aklımızla, sınırlı bilgimizle sonsuz ve sınırsız büyük olan Allahı hakkıyla anlamamız, idrak etmemiz mümkün değildir. Bizim akıl terazimiz, idrak ölçülerimiz Onun sonsuz sıfatlarını ölçemez.",
          "Kısacası biz Allahı hakkıyla tanıyamayacak ve bilemeyeceğiz.",
          "Ancak bu surede ima edilen Padişah misali, yüce Rabbimizi bir parça tanımamız için bizim elimizde bir dürbün olabilir. Biz bu misalin dürbünüyle, kabiliyetimiz ölçüsünde gerçeğin yüzüne uzaktan bakabiliriz.",
          {
            capsules: [
              {
                n: "A -1)",
                text: " Allah! (Onun eşi ortağı yoktur). Hay ve Kayyumdur.",
                color: "#C68A69",
                bg: "#F4EAD5",
                textColor: "#A83C3C",
              },
              {
                n: "A-2)",
                text: " O hiç uyuklamaz ve uyumaz.",
                color: "#8CB08D",
                bg: "#E5EFE2",
              },
              {
                n: "B-1)",
                text: " Göklerde ve yerde ne varsa Onundur.",
                color: "#93A5B3",
                bg: "#E6EAEF",
              },
              {
                n: "B-2)",
                text: " Onun izni olmadan kim onun huzurunda şefaatçi ve söz sahibi olabilir ki?",
                color: "#93A5B3",
                bg: "#E6EAEF",
              },
              {
                n: "C-1)",
                text: " Yalnızca Allah onların geleceklerini de geçmişlerini bilmektedir.",
                color: "#93A5B3",
                bg: "#E6EAEF",
              },
              {
                n: "C-2)",
                text: " Allah dilemeden, Onun ilminden bir şeyler mi kapmışlar ki geçmişi ve geleceği bilsinler?",
                color: "#93A5B3",
                bg: "#E6EAEF",
              },
              {
                n: "D-1)",
                text: " Onun tahtı, hakimiyeti gökler ve yer genişliğindedir.",
                color: "#C68A69",
                bg: "#F4EAD5",
                textColor: "#A83C3C",
              },
              {
                n: "D-2)",
                text: " O ikisini korumak Ona ağır gelmez. O, Yüce ve Büyüktür.",
                color: "#8CB08D",
                bg: "#E5EFE2",
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
          'Ey Allahı tanımayanlar "Allah" deyince aklınıza bir mabede hapsolmuş, eli kolu bağlı, taştan, ağaçtan yapılmış küçücük putlarınız ve batıl tanrılarınız gelmesin. Allah, kendisinden başka İlah olmayan, Hay ve Kayyum olan, yerde ve gökte ne varsa her şey Onun mülkü olan, bütün kainatın hakimi ve Sahibi bir Allahtır.',
          "Bu misal, sınırlı insan aklının sonsuz olanı kavramasına yardımcı olan bir dürbün hükmündedir.",
        ],
      },
      // ── Page 37 ───────────────────────────────────────────────────────
      8: {
        paragraphs: [
          "(Hay) Diri deyince, Kayyum deyince Onu diğer canlılar gibi de düşünmeyin. O uyumaz, gaflet basmaz, yorulmaz, hasta olmaz ve ölmez. Bu son cümle Yahudilere hitap ediyor: Allah yorulmaz diyor. Çünkü onlar, Allah kainatı altı günde yaratı, yedinci gün dinlendi diyorlar. Halbuki Allah yorulmaz ki dinlensin, uyuklasın veya uyusun.",
          "B1 ve B2 cümleleri de Hıristiyanlara bir ders veriyor. Allah ne Hz. İsa'ya ne de bir başkasına uluhiyetinden, hükümranlığından bir parça vermiş de Allahlığını başkasıyla paylaşmış değildir. Böyle bir saçmalığı kimsenin Allaha isnat etmeye hakkı da yoktur.",
          {
            capsules: [
              {
                n: "A -1)",
                text: " Allah, (eşi ortağı olmayan Büyük Padişah), Hay ve Kayyumdur. (Yani Alemlerin Sultanı olan Allah tek'tir. Diridir. Varlıklara can veren de, her şeye hareket ve düzen veren de Odur. Her şeyi her an elinde tutmaktadır.",
                color: "#C68A69",
                bg: "#F4EAD5",
                textColor: "#A83C3C",
              },
              {
                n: "A-2)",
                text: " O hiç uyuklamaz ve uyumaz. (Yorulmaz ve aciz kalmaz, bir iş bir işe mani olmaz. Evrenin idaresini bir an olsun elinden bırakmaz.)",
                color: "#8CB08D",
                bg: "#E5EFE2",
              },
              {
                n: "B-1)",
                text: " O öyle Melik'tir ki Göklerde ve yerde ne varsa her şey Onun mülküdür. Müşriklerin tanrı yerine koydukları şeyler de Allahın mülkünden ibarettir.",
                color: "#93A5B3",
                bg: "#E6EAEF",
              },
              {
                n: "B-2)",
                text: " Onun izni olmadan kim onun huzurunda şefaatçi ve söz sahibi olabilir ki? Yani Allah bu taştan ağaçtan putlara bir izin, bir yetki mi vermiş ki müşrikler; bu putlar Allah ile insanlar arasında aracılık edecek diyorlar? Allah kimseye böyle bir izin vermediğine göre putların, sahte mabutların kime ne faydası olabilir? Putlara taparak maskara olmayın!",
                color: "#A88BAA",
                bg: "#EBE2ED",
              },
              {
                n: "C-1)",
                text: " Onların geleceklerini ve geçmişlerini yalnızca Allah bilmektedir.",
                color: "#A88BAA",
                bg: "#EBE2ED",
              },
              {
                n: "C-2)",
                text: " (Medyumlar, şamanlar, cinciler yani batıl dinlerin temsilcileri) Allah dilemeden, Onun geçmiş ve geleceği kuşatan sonsuz ilminden bir şey bilemezler. Onlara gelecekten sorarak zavallı durumuna düşmeyin.",
                color: "#A88BAA",
                bg: "#EBE2ED",
              },
              {
                n: "D-1)",
                text: " O Sultanın tahtı, Onun saltanatı ve hükümranlığı gökler ve yer genişliğindedir. Emri ve kanunları, göklerin ve yerin her yerinde geçerlidir.",
                color: "#C68A69",
                bg: "#F4EAD5",
                textColor: "#A83C3C",
              },
              {
                n: "D-2)",
                text: " Göklerin nizamını ve yerin varlıklarını korumak Ona ağır gelmez, Onu yormaz. O, Yüce ve Büyüktür.",
                color: "#8CB08D",
                bg: "#E5EFE2",
                textColor: "#A83C3C",
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
          "Lütfen önce sırayla soldan sağa A1 ve A2 yi okuyunuz, sonra bir de sırayla yukarıdan aşağıya doğru A1 ve D1 karelerini okuyarak anlam bütünlüğünü görünüz.",
          {
            capsules: [
              {
                n: "A -1)",
                text: " Allah, (eşi ortağı olmayan Büyük Padişah), Hay ve Kayyumdur. (Yani Alemlerin Sultanı olan Allah tek'tir. Diridir. Varlıklara can veren de, her şeye hareket ve düzen veren de Odur.",
                color: "#C68A69",
                bg: "#F4EAD5",
                textColor: "#A83C3C",
              },
              {
                n: "A-2)",
                text: " O hiç uyuklamaz ve uyumaz. (Yorulmaz ve aciz kalmaz, bir iş bir işe mani olmaz. Evrenin idaresini bir an olsun elinden bırakmaz.)",
                color: "#8CB08D",
                bg: "#E5EFE2",
              },
              {
                n: "D-1)",
                text: " O Sultanın tahtı, yani Onun saltanatı, hakimiyeti gökler ve yer genişliğindedir. Emri ve kanunları, göklerin ve yerin her yerinde geçerlidir.",
                color: "#C68A69",
                bg: "#F4EAD5",
                textColor: "#A83C3C",
              },
              {
                n: "D-2)",
                text: " Göklerin nizamını ve yerin varlıklarını korumak Ona ağır gelmez, Onu yormaz. O, Yüce ve Büyüktür.",
                color: "#8CB08D",
                bg: "#E5EFE2",
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
          "(A-1) Birinci cümlede Yüce Yaratıcı lutfedip kendisini Varlık aleminde eşi ortağı olmayan büyük padişah olarak bize tanıtıyor. Varlık aleminde en büyük, en önemli hakikat, Yüce Yaratıcının Kendisidir. Onu doğru sıfatlarıyla tanımak ve yalnızca Ona ibadet etmek insanlığın en büyük, en önemli görevidir.",
          '(A-2) İkinci cümle, birinci cümleye dayanarak; "Allah uyumaz da, uyuklamaz da". Diyerek Cenab-ı Hakkı tanıtmaya devam ediyor. İnsanların, Allah hakkındaki muhtemel yanılmalarını önlüyor.',
          "(A-1) Ana cümlesinin anlamı en sondaki iki cümlede (D-1 ve D-2) bölümünde devam ediyor.",
          'Zaten ikili sistemin ana kurallarından biri şudur: "Birinci ayetin anlamı dördüncü ayette devam eder. Aradaki ikinci ve üçüncü ayetler açıklama (tafsil) ayetleridir."',
          "Bu durumu matematiksel olarak şöyle yazabiliriz:",
          "A1+A2 (( (B1+B2) + (C1+C2) )) D1+D2",
          "Açıklama, tafsil bölümleri: Bu cümleler, ana manayı veren cümlelerin arasında parantez içi cümlelerdir. Tam da orada söylenmesi gereken iki önemli hakikati söylüyorlar.",
          'Evet şu gelen birinci tafsil cümlesi müşriklerin "Allah katında bizim şefaatçimiz " dedikleri putlara öyle bir darbe vuruyor ki yerlerinde yeller esiyor.',
        ],
      },
      // ── Page 39 ───────────────────────────────────────────────────────
      3: {
        paragraphs: [
          {
            capsules: [
              {
                n: "B-1)",
                text: " O öyle Melik'tir ki <span style='color: #A83C3C;'>Göklerde ve yerde ne varsa Onundur.</span> Evet sizin de, tanrı yerine koyup taptığınız şeylerin de Sahibi Odur.",
                color: "#93A5B3",
                bg: "#E6EAEF",
              },
              {
                n: "B-2)",
                text: " O, her şeyin sahibi iken <span style='color: #A83C3C;'>Onun izni olmadan kim onun huzurunda şefaatçi ve söz sahibi, olabilir ki?</span> Yani Allah bu taştan ağaçtan putlara bir izin, bir yetki mi vermiş ki müşrikler; bu putlar Allah katında insanlara şefaat edecek diyorlar? Allah kimseye böyle bir izin vermediğine göre putların, sahte mabutların kime ne faydası olabilir?",
                color: "#A88BAA",
                bg: "#EBE2ED",
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
          { subtitle: "ŞEFAAT KONUSUNU NASIL ANLAYACAĞIZ ?" },
          "Eski Arap toplumunda, DEVLET mefhumunun henüz gelişmediği, tam teşekkül etmediği çağlarda sosyal hayat o günün şartlarına göre şekilleniyordu. Halkın büyük bir kısmı göçebe idi. Devlete ait bir çok görevler de, kabile reisleri tarafından karşılanıyordu. Özellikle yabancıların ve zayıf kimselerin can ve mal güvenliği, seyahat güvenliği kabile reisleri tarafından sağlanırdı.",
          "Kabile reisleri ve güçlü zenginler, zayıfları ve yabancıları himaye'lerine alırlar, bunu halkın içinde ilan ederlerdi. O zayıf veya yabancı kimse de kendisini himaye eden reisin adını her yerde söyler, onun adıyla dolaşırdı.",
          "Bu himayenin başka bir adı da ŞEFAAT'tir. Şefaat eden şahıs, şefaat ettiği kimsenin can, mal güvenliğinden olduğu kadar diğer kişisel haklarının da arkasında olur, hatta sorumlu olurdu.",
          "Kabile reisinin şefaati, himayesi resmi anlamda bir pasaport verme ve vize vermekti.",
          "Bugün bu hak ve görev devletlere ait bir görev ve sorumluluktur. Çünkü artık toplum hayatı gelişmiş. Her millet kendi devletini kurmuştur. Devletler de toplumun ihtiyaçlarına göre maliye, eğitim, polis ve ordu gibi organlarını kurmuştur.",
          'Eskiden insanlar; "Ben filan reisin, filan kabilenin himayesindeyim!, filan reis bana şefaat eder " derlerdi.',
          'Şimdi; "Ben Türkiye Cumhuriyeti vatandaşıyım. Benim devletim, hukukuyla, mahkemeleriyle, polis ve ordusuyla, hatta gerekirse mutfak ve hastanesiyle benim hizmetimdedir, beni himaye eder." Diyoruz.',
          "Toplum fertlerinin nüfusa kaydedilmeleri, onlara hüviyet verilmesi, yurt dışına çıkacaklarsa pasaport verilmesi, can ve mal güvenliklerinin sağlanması ve diğer bütün haklarının güvenceye alınması, himaye edilmesi hep devletin yetki ve sorumluluğundadır.",
          'Kısacası Kur\'an-ı Kerimde söz edilen "şefaat ve himaye" nin bugünkü anlamı budur.',
        ],
      },
      // ── Page 40 ───────────────────────────────────────────────────────
      4: {
        paragraphs: [
          { subtitle: "Şimdi şurası önemli:" },
          "Devlet; yetkilerini, milli meclisler ve sonra da memurları eliyle yerine getirir. Yani devlet yasama ve yürütme işini çeşitli kurumlarıyla ve yetki verdiği kimselerle yürütüyor. Mesela Türkiye'nin Almanya büyük elçisi, Türkiye'den yetki alır ve bulunduğu yerde Türk Devletini temsil eder, yetkilerini kullanır. Almanya'daki Türk vatandaşlarının hukukunu savunur. Onların resmi işlerini gören bir devlet temsilcisidir. Devlet namına onları himaye ve şefaat eder.",
          'İşte cahiliye dönemi putperest Araplarının kafasındaki "put" imajı, put anlamı böyle yetkilerle donatılmış bir büyük elçi, şefaat ve himaye edebilen bir devlet görevlisi makamı ile aynı idi.',
          "Güya putların içinde melekler vardı. Ve bu meleklere Allahın kızları derlerdi. Onlar kendilerine yapılan ibadetleri, kesilen kurbanları Allah adına kabul ediyorlar, kendilerinden istenen şeyleri Allah adına yerine getiriyorlar, halkı koruyorlar! Putlara tapanlar putları Uluhiyetin (Allah'ın) yeryüzü elçiliği gibi düşünüyorlardı. Hıristiyanlar da Hz. İsanın, Hz. Meryemin heykellerine dua ederlerken aynı tasavvur içinde yalvarıyorlar.",
          "Ama putlara veya müşriklere, böyle bir resmi elçilik, hem de İlahi bir elçilik açma yetkisini kim vermişti ?",
          "Devletin görevlendirmediği bir büyük elçinin hükmü olmadığı gibi, taştan, ağaçtan putların da ne Allah katında bir yetkileri ve ne de tabiatta bir etkileri yoktu.",
          "Allah göklerde ve yerde bizzat, doğrudan doğruya ilmiyle, kudretiyle hazır ve nazır olduğu halde, her şeyi sonsuz kudretiyle bizzat kendisi idare etmekte olduğu halde birilerinin çıkıp kendi kafalarından Allah'a ortaklar icat etmeleri, Onun mülkünü ve yetkilerini güya paylaştırmaları çok büyük bir suç olmaz mı?",
          "Tıpkı hiçbir resmi görevi (devletten aldığı bir yetkisi) olmadığı halde ben devlet memuruyum, ben polisim, ben elçiyim diyen sahtekar veya böyle bir sahtekarı destekleyen yandaşları nasıl suç işliyorlarsa, putlar, heykeller Allahın yetkili ortağıdır diyen müşrikler de suçludurlar, çok büyük bir suç işliyorlar.",
          "Aynı şekilde Hz. İsa Aleyhisselam, diğer bütün peygamberler gibi Allahın bir peygamberi olduğu halde ve Hz. Meryem de yalnızca Hz. İsanın muhterem annesi olduğu halde, hem Hz. İsayı, hem Hz. Meryemi tanrılaştırarak, güya İlahi yetkilerle donatanlar da aynı şekilde büyük bir şirk suçu işlemektedirler.",
        ],
      },
      // ── Page 41 ───────────────────────────────────────────────────────
      5: {
        paragraphs: [
          {
            subtitle:
              "Şimdi Ayet ül Kürsinin dördüncü cümlesini tekrar okuyalım:",
          },
          {
            capsules: [
              {
                text: "Göklerde ve yerde ne varsa her şey Allahın mülkü olduğu, yani Allah göklerin ve yerin tek sahip ve hakimi olduğu halde ve Onun izni olmadığı, O yetki ve görev vermediği halde kim Onun mülkünde yetkili ve etkili olabilir ki?",
                color: "#C68A69",
                bg: "#F4EAD5",
                textColor: "#A83C3C",
                span: true,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
          "Evet işin doğrusu; herkes her halinde, her anda, her yerde ezel ebed Sultanı olan kendi Rabbine doğrudan doğruya, perdesiz, hailsiz, aracısız müracaat edebilir ve istediklerini Ondan isteyebilir. Başka hiç kimseye ve hiçbir şeyi aracı yapmaya ihtiyacı yoktur.",
          "İkinci açıklama cümlesi:",
          {
            capsules: [
              {
                n: "C-1)",
                text: " Yalnızca Allah onların geleceklerini de geçmişlerini bilmektedir.",
                color: "#A88BAA",
                bg: "#EBE2ED",
              },
              {
                n: "C-2)",
                text: " (Medyumlar, şamanlar, büyücüler yani batıl dinlerin temsilcileri) Allah dilemeden, Allahın, geçmiş ve geleceği kuşatan sonsuz ilminden bir şeyler mi kapmışlar ki geçmişi ve geleceği bilsinler?",
                color: "#A88BAA",
                bg: "#EBE2ED",
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
          "Bu ikinci tafsil cümlesi de müşrik Arapların akıllarını karıştıran batıl mistik dinlerin temsilcileri olan cahil şarlatanlara, Şamanlara öyle bir tokat vuruyor ki bir daha ağızlarını açamayacak şekilde susturuyor.",
          "Allah size vahyetmemiş, kendi ilminden ilim vermemiş. O vermediği halde, o dilemeden siz mi onun ilminden bir şeyler çaldınız ki kendinizi güya peygamber yerine koyarak insanlara bir şeyler söylüyorsunuz. Siz ancak insanları şeytan namına iğfal ediyorsunuz. Sözleriniz de saçma sapan şeytan sözleri.",
          {
            capsules: [
              {
                n: "A-1)",
                text: " <span style='color: #A83C3C;'>BİR ALLAH VAR:</span> Eşi benzeri olmayan, bütün kainatın Sultanı olan Allah birdir. O Hayy ve Kayyum'dur. Uyuklamaz ve uyumaz.",
                color: "#C68A69",
                bg: "#F4EAD5",
                span: true,
              },
              {
                n: "B-1)",
                text: " <span style='color: #A83C3C;'>PUTLARA YER YOK</span> Kainatta her şey O büyük Padişahın mülküdür. Putları da, sebepleri de yaratan Odur. Haşa, Allah kendi mülkünün ve sonsuz kudretinin bir parçasını putlara mı vermiş ki siz o putlara veya bazı insanlara tanrı diyorsunuz?",
                color: "#93A5B3",
                bg: "#E6EAEF",
              },
              {
                n: "B-2)",
                text: " <span style='color: #A83C3C;'>PUTPEREST ŞAMANLARA YER YOK</span> Geleceği de geçmişi de bilen yalnızca Allah olduğu halde, geçmişten ve gelecekten haber aldığını iddia eden putperest cinci güya din adamlarına, Şamanlara ne demeli? Onlar ancak şeytan namına konuşup saçmalıyorlar.",
                color: "#93A5B3",
                bg: "#E6EAEF",
              },
              {
                n: "A-2)",
                text: " <span style='color: #A83C3C;'>ALLAH, SONSUZ BİR HAKİMİYET SAHİBİDİR:</span> Onun hükümranlığı, gökler ve yer genişliğindedir. Zerrelerden güneşlere kadar bütün kainat onun taht-ı idaresindedir. Yeri-göğü idare etmek Ona zor gelmez ve Onu yormaz. Allah, tasavvurlarımızın çok üstünde Yüce ve Büyüktür.",
                color: "#C68A69",
                bg: "#F4EAD5",
                span: true,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
        ],
      },
      // ── Page 42 ───────────────────────────────────────────────────────
      6: {
        paragraphs: [
          "Burada geçen cümlelerin Yahudilerin itikadını tashih edip düzelttiğini görüyoruz. Yahudiler; Allah gökleri ve yeri altı günde yaratıp yedinci günde dinlendi diyorlardı. Böylece Allahın da diğer canlılar gibi yorulduğuna inanıyorlardı. Böyle sözler söylemek Allah hakkında büyük iftiradır. Ayet ül Kürsinin ana ve ara cümleleri: Allah Hay ve Kayyumdur, O uyumaz ve uyuklamaz, hem kainatın her zerresi, her atomu Onun kudret elindedir, Allah yorulmaz diyerek Yahudilerin yanlış inançlarını tashih ediyor.",
        ],
      },
    },
  },

  // The tafsir panel in the other languages the switcher offers. Arabic has
  // no edition of its own, so it keeps the `sideInfo` above; English
  // (AYAT_AL_KURSI_SIDE_INFO_EN) is defined at the end of this file and wired
  // in there — it's declared after this object, so it can't be referenced here.
  sideInfoTranslations: {},

  features: {
    hasIntro: false,
    hasElevatedSections: true,
    hasPopUps: true,
    hideVerseNumbers: false,
  },

  dimensions: {
    paperWidth: 1.54,
    paperHeight: 1.78,
    sceneCenterYOffset: -0.045,
    padding: 0.15,
    scrollPages: 1.5,
    fixedWidthAcrossLanguages: true,
  },

  specialVerses: {
    // The single fold sits between the top group and the pushed-in middle group.
    // Verses flanking that crease are 1/2 (top) and 3/4 (middle top row).
    // No middleFoldVerses — all pairs fold as normal V-shape popups
    versePairings: {
      1: 2,
      2: 1,
      3: 4,
      4: 3,
      5: 6,
      6: 5,
      7: 8,
      8: 7,
    },
  },

  verseOverrides: {
    1: {
      border: OUTER_GROUP_BORDER,
      circleBorderCol: OUTER_GROUP_BG,
      circleBg: OUTER_GROUP_BG,
      circleTextCol: OUTER_GROUP_BORDER,
    },
    2: {
      border: OUTER_GROUP_BORDER,
      circleBorderCol: OUTER_GROUP_BG,
      circleBg: OUTER_GROUP_BG,
      circleTextCol: OUTER_GROUP_BORDER,
    },
    3: {
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BG,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
    },
    4: {
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BG,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
    },
    5: {
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BG,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
      translationTextScaleOverride: 0.65,
    },
    6: {
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BG,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
    },
    7: {
      border: OUTER_GROUP_BORDER,
      circleBorderCol: OUTER_GROUP_BG,
      circleBg: OUTER_GROUP_BG,
      circleTextCol: OUTER_GROUP_BORDER,
    },
    8: {
      border: OUTER_GROUP_BORDER,
      circleBorderCol: OUTER_GROUP_BG,
      circleBg: OUTER_GROUP_BG,
      circleTextCol: OUTER_GROUP_BORDER,
    },
  },

  styling: {
    colors: {
      paperBase: "#FAF7F2", // Lighter, creamy paper color for the background fill
      shadow: "#000000",
      backface: "#EDE8D6",
      textDark: "#333333",
      textLabel: "#555555",
      circleBorder: "#bbbbbb",
      verseNumberText: "#222222",
      s1AnaLabelBg: "#ffffff",
      s1AnaLabelText: "#000000",
      s1AnaLabelBorder: "#dddddd",
      s2FrameBg: "#f4f4f4",
      boarderFrame: "#ffffff",
      boarderHalo: "#ADADAD",
      innerCard: "#eeeeee",
      sectionBgTexture: "#fcfcfc",
      hollowConnectorInnerBg: "#e3e3e3",
      maroonTheme: OUTER_GROUP_BG, // Yellow (Top and Bottom groups, since they are symmetrical)
      greenTheme: CENTER_GROUP_BG, // Blue/Grey (Middle group)
      // The three group background colours echo the hand-drawn image:
      s1InnerBorder: "#cccccc",
      s2IntroOutroBg: "#C4963B", // unused (no intro/outro verse)
      s2Group1Bg: OUTER_GROUP_BG, // yellow  — top group
      s2Group2Bg: CENTER_GROUP_BG, // light blue/grey — middle (pushed-in)
      s2Group3Bg: OUTER_GROUP_BG, // yellow — bottom group (symmetrical)

      // The background rectangles for the paper, echoing the hand-drawn sections
      // sectionBackgrounds: ["#DCE8DC", "#EDD8DF", "#DCE8DC"],

      curveColors: [
        { color: OUTER_GROUP_BORDER, fillColor: OUTER_GROUP_BG }, // Outer curves (top/bottom)
        { color: CENTER_GROUP_BORDER, fillColor: CENTER_GROUP_BG }, // Center curves (middle)
      ],
    },
    capsuleBorderWidth: 0.0039,
    circleBorderWidth: 0.0035,
    verseRadius: 0.04,
    oppositeVerseConnectorRadius: 0.05,
    elevatedSectionRadii: {
      base: 0.039,

      outer: 0.025,
      innerA: 0.023,
      innerB: 0.022,
    },
  },

  // ── NEW BLOCK-BASED SCHEMA ──────────────────────────────────────────────
  // Legacy params mapping:
  //   smallBoxH2: 0.075      → capsuleHeight
  //   s2Gap: 0.02            → columnGap
  //   s2VerticalRowGap: 0.02 → rowGap
  //   groupGap + middleExtraGap (0.025 + 0.007) → blockGap
  //   s2PadLeftRight: 0.08   → sectionPadX
  //   groupPad: 0.012        → blockPadding
  //   sgBorderWidth: 0.006   → sectionBorderWidth
  //   sgPad: 0.03            → connectorPad
  globalSettings: {
    capsuleHeight: 0.075,
    columnGap: 0.032,
    rowGap: 0.032,
    blockGap: 0.035,
    sectionPadX: 0.08,
    blockPadding: 0.012,
    sectionBorderWidth: 0.006,
    connectorPad: 0.03,
    framePad: 0.02, // was s2VerticalPad
    verseTextScale: 1.0,
    translationVerseTextScale: null,
  },

  // Example handwritten margin note (Turkish) — sits in the blank top-left
  // margin above the content, like a personal note jotted next to the ayah.
  handwrittenNotes: [
    {
      x: 0.77,
      y: -0.08,
      fontSize: 0.048,
      color: "#2f4858",
      lineSpacing: 1.6,
      maxWidth: 1.5,
      textAlign: "center",
      rotationZ: 0,
      lines: [
        {
          text: "Bakara: 255",
        },
        { text: "(Ayetel Kürsi)" },
      ],
    },
    {
      x: 1.15,
      y: -0.3,
      fontSize: 0.04,
      color: "#2f4858",
      lineSpacing: 2,
      maxWidth: 1.7,
      textAlign: "center",
      rotationZ: 0,
      lines: [
        {
          segments: [{ text: "Sağ blokta müspet ", color: "#8a4b3d" }],
        },
        { text: "cümlelerle hakikat beyan" },
        { text: "edilir;" },
      ],
    },
    {
      x: 0.38,
      y: -0.3,
      fontSize: 0.04,
      color: "#2f4858",
      lineSpacing: 2,
      maxWidth: 0.7,
      textAlign: "center",
      rotationZ: 0,
      lines: [
        {
          segments: [{ text: "Sol blokta menfi ", color: "#8a4b3d" }],
        },
        { text: "cümlelerle bu hakikate" },
        { text: "aykırı bütün yanlışlar" },
        { text: "reddedilir." },
      ],
    },
  ],

  // Section-wide resting-state background (the whole 3-block stack's outer
  // frame) — independent of any single block's own bounds.
  sectionBackground: {
    texture: "/nisa/all-section-1.svg",
    scaleX: 0.9,
    scaleY: 1.4,
    offsetY: 0.025,
    solidScaleX: 0.6,
    solidScaleY: 1,
  },

  blocks: [
    // ── Top block: 2 verses side-by-side (NOT pushed in) ────────────────
    {
      id: "section2_g0",
      type: "group",
      verseIds: [2, 1], // [left-col=2, right-col=1]
      columns: 2,
      horizontalInset: 0,
      isCenter: false,
      bgThemeKey: "s2Group1Bg",
    },
    // ── Middle block: 4 verses 2×2 (pushed in / indented) ────────────────
    {
      id: "section2_g1",
      type: "group",
      verseIds: [4, 3, 6, 5], // [left-row1=4, right-row1=3, left-row2=6, right-row2=5]
      columns: 2,
      horizontalInset: 0.01, // was g2Scale
      isCenter: true,
      dragBehavior: "individual",
      bgThemeKey: "s2Group2Bg",
    },
    // ── Bottom block: 2 verses side-by-side (NOT pushed in) ──────────────
    {
      id: "section2_g2",
      type: "group",
      verseIds: [8, 7], // [left-col=8, right-col=7]
      columns: 2,
      horizontalInset: 0,
      isCenter: false,
      bgThemeKey: "s2Group3Bg",
    },
  ],

  // "unified" elevation (legacy groupElevation: "unified") — all 3 blocks
  // share one drag/elevation zone, exactly like Ihlas's customSections.
  customSections: [
    {
      id: "section2",
      verseIds: [1, 2, 3, 4, 5, 6, 7, 8],
      cameraTarget: { y: 1.2, fov: 30, tilt: -1.2 },
    },
  ],

  animations: {
    computeFoldYPositions: (lm) => {
      // groupYPositions[i] = frameY (top edge) of block i; groupHeights[i] = frameH.
      // Position 1: between block 0 (top) and block 1 (middle)
      const fold1 =
        (lm.groupYPositions[0] - lm.groupHeights[0] + lm.groupYPositions[1]) /
        2;
      // Position 2: between row 1 and row 2 inside block 1 (middle, 2×2)
      const fold2 =
        lm.groupYPositions[1] - lm.groupPad - lm.smallBoxH2 - lm.rowGap / 2;
      // Position 3: between block 1 (middle) and block 2 (bottom)
      const fold3 =
        (lm.groupYPositions[1] - lm.groupHeights[1] + lm.groupYPositions[2]) /
        2;

      return [fold1, fold2, fold3];
    },

    foldSteps: [
      // Fully folded (paper closed in on itself)
      {
        id: "pre-start",
        folds: [
          { direction: 1, angleFactor: 0.4 },
          { direction: -1, angleFactor: 1 },
          { direction: 1, angleFactor: 0.6 },
        ],
      },
      {
        id: "end",
        folds: [
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
        ],
      },
    ] as const,

    scrollTimeline: {
      intro: { start: 0, end: 10 },
      ambient: { start: 10, end: 40 },
      handoff: { start: 40, end: 55 },
      story: { start: 55, end: 100 },
    },

    scrollLock: {
      lockPositionPercentage: 0.55,
      effortRequired: 2500,
      grabRangePixels: 50,
    },
  },

  svgOverlays: [
    {
      src: "/ayatalKursi/divider.svg",
      anchorEdge: "center",
      scaleX: 0.51,
      scaleY: 1.35,
      offsetX: 0.005,
      offsetY: 0,
      renderOrder: 10, // Behind the verses
    },
    {
      src: "/ayatalKursi/divider.svg",
      anchorEdge: "center",
      scaleX: 0.46,
      scaleY: 1.54,
      offsetX: 0,
      offsetY: 0.0025,
      rotationZ: Math.PI / 2,
      renderOrder: 1, // Behind the verses
    },
    // {
    //   src: "/ayatalKursi/balara.png",
    //   anchorEdge: "top",
    //   scaleX: 0.4,
    //   scaleY: 0.16,
    //   offsetX: 0,
    //   offsetY: 0.85,
    //   renderOrder: 20,
    // },
  ],
};

// ---------------------------------------------------------------------------
// TEXT DATA — Arabic (canonical)
// ---------------------------------------------------------------------------
// verse ordering inside each colorGroup must match the config's verseIds:
//   group 0: [i=0 → id 2, i=1 → id 1]
//   group 1: [i=0 → id 4, i=1 → id 3, i=2 → id 6, i=3 → id 5]
//   group 2: [i=0 → id 8, i=1 → id 7]
// ---------------------------------------------------------------------------

export const AYAT_AL_KURSI_TEXT_AR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",

  // section1 is a stub — the Ayat al-Kursi config has no gridWithAnaAyet section.
  section1: {
    label: "آية الكرسي",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },

  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" }, // no intro verse
    colorGroups: [
      // ── Group 0 — top, not pushed in ─────────────────────────────────────
      {
        verses: [
          // i=0 → verseId 2 (left column)
          { number: 2, text: "لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ" },
          // i=1 → verseId 1 (right column)
          {
            number: 1,
            text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
          },
        ],
      },
      // ── Group 1 — middle, pushed in ─────────────────────────────────────
      {
        verses: [
          // i=0 → verseId 4 (left col, row 1)
          {
            number: 4,
            text: "مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ",
          },
          // i=1 → verseId 3 (right col, row 1)
          { number: 3, text: "لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ" },
          // i=2 → verseId 6 (left col, row 2)
          {
            number: 6,
            text: "وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ",
          },
          // i=3 → verseId 5 (right col, row 2)
          {
            number: 5,
            text: "يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ",
          },
        ],
      },
      // ── Group 2 — bottom, not pushed in ─────────────────────────────────
      {
        verses: [
          // i=0 → verseId 8 (left column)
          {
            number: 8,
            text: "وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
          },
          // i=1 → verseId 7 (right column)
          { number: 7, text: "وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ" },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" }, // no outro verse
    bottomLabel: "",
  },
};

// ---------------------------------------------------------------------------
// TEXT DATA — English
// The eight chunks exactly as the English edition of the tafsir prints them
// (Al-Baqarah 255.docx), i.e. statements A-1 … D-2 in chunk order.
// ---------------------------------------------------------------------------

export const AYAT_AL_KURSI_TEXT_EN: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "Ayat al-Kursi",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        verses: [
          {
            number: 1,
            text: "God! There is no partner or equal to Him. He is the Ever-Living and the Self-Subsisting Sustainer of all.",
          },
          { number: 2, text: "Neither drowsiness nor sleep overtakes Him." },
        ],
      },
      {
        verses: [
          {
            number: 3,
            text: "To Him belongs whatever is in the heavens and whatever is on earth.",
          },
          {
            number: 4,
            text: "Who can intercede or speak in His presence except by His permission?",
          },
          {
            number: 5,
            text: "God alone knows what lies before them and what lies behind them.",
          },
          {
            number: 6,
            text: "Can they grasp anything of His knowledge—of the past or the future—unless God wills?",
          },
        ],
      },
      {
        verses: [
          {
            number: 7,
            text: "His Throne, His dominion, extends over the heavens and the earth.",
          },
          {
            number: 8,
            text: "Preserving them does not burden Him. He is the All-Exalted, the Supreme.",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

// ---------------------------------------------------------------------------
// TEXT DATA — Turkish (empty strings per spec)
// ---------------------------------------------------------------------------

export const AYAT_AL_KURSI_TEXT_TR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "Ayetü'l-Kürsî",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        verses: [
          {
            number: 1,
            text: "Allah! (Onun eşi ortağı yoktur). Hay ve Kayyumdur.",
          },
          {
            number: 2,
            text: "O hiç uyuklamaz ve uyumaz.",
          },
        ],
      },
      {
        verses: [
          { number: 3, text: "Göklerde ve yerde ne varsa Onundur." },
          {
            number: 4,
            text: "Onun izni olmadan kim onun huzurunda şefaatçi ve söz sahibi olabilir ki?",
          },
          {
            number: 5,
            text: "Yalnızca Allah onların geleceklerini de geçmişlerini bilmektedir.",
          },
          {
            number: 6,
            text: "Allah dilemeden, Onun ilminden bir şeyler mi kapmışlar ki geçmişi ve geleceği bilsinler?",
          },
        ],
      },
      {
        verses: [
          {
            number: 7,
            text: "Onun tahtı, hakimiyeti gökler ve yer genişliğindedir.",
          },
          {
            number: 8,
            text: "O ikisini korumak Ona ağır gelmez. O, Yüce ve Büyüktür.",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

// ---------------------------------------------------------------------------
// Aggregated text data (Record<SurahLanguage, SurahDataShape>)
// ---------------------------------------------------------------------------

export const AYAT_AL_KURSI_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: AYAT_AL_KURSI_TEXT_AR,
  en: AYAT_AL_KURSI_TEXT_EN,
  tr: AYAT_AL_KURSI_TEXT_TR,
};

// ---------------------------------------------------------------------------
// TAFSIR PANEL — ENGLISH
//
// A single, continuous, paragraph-by-paragraph transcription of the English
// edition of the tafsir (Al-Baqarah 255.docx), top to bottom, in the EXACT
// order the document prints it — not reorganized around the fold story's own
// per-verse reveal timing. Every sentence is exactly as printed; nothing
// paraphrased, added, or omitted. It all lives in `byFoldStep["pre-start"]`
// alone (no byVerse entries, no other fold-step entries).
//
// The docx's own section headings are used verbatim as `{ subtitle }` items.
// The Verse of the Throne's eight statements (A-1, A-2, B-1, B-2, C-1, C-2,
// D-1, D-2) are capsuled ONLY the first time they appear, as the short list
// right after "In brief, we cannot know and comprehend God..." — colored
// exactly as the Turkish panel colors that same first list (A/D → orange,
// B/C → blue-grey). Every later restatement of those same eight labels
// (the docx repeats and re-explains them several times, each in slightly
// different words) stays plain prose, verbatim, with the label kept inline —
// mirroring how Alak's repeated verse citations were simplified to plain
// text rather than boxed again each time.
//
// No `recitation` here: the recorded readings exist only in Turkish, so the
// English panel is written text throughout.
// ---------------------------------------------------------------------------

// Per-statement capsule colors — used only for the ONE first-occurrence list.
const EN_A_COLOR = "#C68A69";
const EN_A_BG = "#F4EAD5";
const EN_A_TEXT = "#A83C3C";
const EN_SLEEP_COLOR = "#8CB08D";
const EN_SLEEP_BG = "#E5EFE2";
const EN_OWN_COLOR = "#93A5B3";
const EN_OWN_BG = "#E6EAEF";

const AYAT_AL_KURSI_SIDE_INFO_EN: SurahSideInfoConfig = {
  byFoldStep: {
    "pre-start": {
      paragraphs: [
        {
          capsules: [
            {
              n: 1,
              text: "The first affirmative statement declares the truth.",
              bg: "#F3ECD5",
              color: "#C4A771",
            },
            {
              n: 2,
              text: "The second negative statement corrects the error.",
              bg: "#DAE8EE",
              color: "#8DAAB6",
            },
            {
              n: 3,
              text: "The second affirmative statement declares the truth.",
              bg: "#F3ECD5",
              color: "#C4A771",
            },
            {
              n: 4,
              text: "The fourth negative statement corrects the error.",
              bg: "#DAE8EE",
              color: "#8DAAB6",
            },
            {
              n: 5,
              text: "The third affirmative statement declares the truth.",
              bg: "#F3ECD5",
              color: "#C4A771",
            },
            {
              n: 6,
              text: "The sixth negative statement corrects the error.",
              bg: "#DAE8EE",
              color: "#8DAAB6",
            },
            {
              n: 7,
              text: "The fourth affirmative statement declares the truth.",
              bg: "#F3ECD5",
              color: "#C4A771",
            },
            {
              n: 8,
              text: "The eighth negative statement corrects the error.",
              bg: "#DAE8EE",
              color: "#8DAAB6",
            },
          ],
          corners: "soft",
          color: OUTER_GROUP_BORDER,
          bg: OUTER_GROUP_BG,
          textColor: "#2B2B2B",
          frame: OUTER_GROUP_BORDER,
        },

        { subtitle: "THE UNIVERSE IS A GREAT MIRROR: IT MAKES GOD KNOWN" },
        "God Almighty creates the entire universe and all beings for many purposes. In creating each thing, He places within it countless benefits and invests every being with many layers of meaning.",
        "Even if a being has only one function related to its own life, the meanings and wisdom through which it points to the One Who creates it are countless.",
        "Through their existence and all their activities, all beings express innumerable meanings concerning the Supreme Creator Who brings them into being.",
        "Indeed, the greatest purposes of creation are those that point to the Creator and convey meanings related to Him.",
        "Everything in the universe, and living beings in particular, through its coming into existence and the many events of its life, points to and bears witness to the existence of the Supreme Creator and to His many Names and Attributes. All beings speak of Him. Each is, as it were, a mirror that displays His works and makes Him known.",
        "Every work of art bears the signature of its artist or master, and every technological product reflects the brand, skill, and quality of its engineer and manufacturer. In the same way, everything in the heavens and on earth bears the Name, signature, and craftsmanship of the Supreme Creator and displays Him to us like an exquisitely fashioned sign. All plants and living beings are marvelous works of His art. They reveal the boundlessness of His power, wisdom, knowledge, and compassion and reflect the manifestations of the countless beautiful Names of God Almighty. This is one of the greatest purposes of creation.",

        { subtitle: "THE HUMAN BEING IS A COMPREHENSIVE MIRROR: HE MAKES GOD KNOWN" },
        "In outward appearance, the human being is small. Yet through the extraordinary faculties placed within his nature—such as intellect and heart—he is, in meaning and potential, greater even than the universe. With all that he has been given, the human being is a sovereign on earth who reflects God’s Names and Attributes and fulfills the role of His vicegerent on earth.",
        "Many purposes, wisdom, meanings, and benefits related to human life can be discerned in the creation of the human being. Yet the greatest purpose and most meaningful duty of the human being, the sovereign of created beings, is to know the Creator of the universe through His Names and Attributes and, through his life, intellect, heart, and lofty potential, to become a conscious and distinctive mirror reflecting them.",

        {
          subtitle:
            "THE PROPHET MUHAMMAD, PEACE AND BLESSINGS BE UPON HIM, IS A PERFECT MIRROR: HE MAKES GOD KNOWN",
        },
        "He knew God more fully than anyone else and devoted his entire life to knowing Him and making Him known. Through his way of life, every breath he took, his worship as though he saw God at every moment, and his constant awareness of standing in the Divine presence, he continually reflected God’s Names and Attributes.",
        "There are many wisdoms and benefits in the sending of a person such as the Prophet Muhammad, upon him be the most perfect peace and blessings, as a Messenger, and many qualities in his life for us to emulate. Yet the greatest purpose of his being honored with Prophethood was to make our Lord known to us.",
        "How are we to know our Lord, the Majestic Creator of the universe and its Sovereign of absolute perfection?",
        "How should God be described and praised? How should He be worshiped and obeyed?",
        "We find the answers to these and many other questions in the Qur’an and in the noble life of the beloved Prophet.",
        "“This world is a mirror; all things subsist through the Truth. Through the mirror of Muhammad, God is ever seen.” —Aziz Mahmud Hüdayi",

        "The Qur’an is a clear mirror: it reveals God to us and makes Him known.",
        "The Qur’an has many purposes, profound wisdoms, and countless benefits. Each of its verses addresses different matters and teaches us valuable lessons. We receive every command and every lesson with reverence. In many respects, each verse is a source of light, guidance, and healing for us.",
        "Yet the Qur’an’s greatest purpose concerns God, the Glorious Author of this Divine Word. It speaks of Him and makes Him known.",
        "Indeed, through this exalted Book that He revealed, God first and foremost tells us about Himself and makes Himself known. He informs us of His Divine purpose and shows us the paths that lead to His good pleasure.",
        "Thus, the verses of the Qur’an described as muhkam, those that express firm, unchanging, and established truths, are the verses that speak of God and make Him known.",
        "In one sense, we may say that the entire Qur’an speaks of God. Every verse that speaks of beings, people, or events continually directs us back to Him. Above all, the Qur’an is a great mirror through which God makes Himself known. Every verse is sacred and precious to us; yet the most important and precious verses are those that speak directly of God and make Him known.",
        "From this perspective, the Verse of the Throne, Surah al-Ikhlas, the opening verses of Surah al-Fatiha, and the final three verses of Surah al-Hashr form the heart of the Qur’an. In a sense, they are its principal verses.",
        "Indeed, every statement of the Verse of the Throne makes our Lord known to us while also uprooting a number of false beliefs.",
        "People understand abstract truths more easily through analogies. In this verse, God Almighty describes His sovereignty through the analogy of a sovereign and his dominion.",
        "Everyone understands what a sovereign is and what the lofty throne upon which he sits represents. A sovereign has a realm and subjects. He embodies power and authority. His laws and commands prevail throughout his dominion. Everyone respects and obeys him. He shares his sovereignty with no one, and without his permission and will, no one can possess even a span of land.",
        "With our limited minds and knowledge, we cannot fully comprehend God, Who is infinite and beyond all limits. The scales of our reason and the measures of our understanding cannot encompass His infinite Attributes.",
        "In brief, we cannot know and comprehend God as He truly deserves to be known. Yet the analogy of sovereignty implied in this verse may serve as a telescope through which we gain some knowledge of our Exalted Lord. Through the lens of this analogy, we may glimpse the truth from afar, to the extent of our capacity.",

        {
          corners: "soft",
          textColor: "#2B2B2B",
          capsules: [
            {
              n: "A-1.",
              text: " God! There is no partner or equal to Him. He is the Ever-Living and the Self-Subsisting Sustainer of all.",
              color: EN_A_COLOR,
              bg: EN_A_BG,
              textColor: EN_A_TEXT,
            },
            {
              n: "A-2.",
              text: " Neither drowsiness nor sleep overtakes Him.",
              color: EN_SLEEP_COLOR,
              bg: EN_SLEEP_BG,
            },
            {
              n: "B-1.",
              text: " To Him belongs whatever is in the heavens and whatever is on earth.",
              color: EN_OWN_COLOR,
              bg: EN_OWN_BG,
            },
            {
              n: "B-2.",
              text: " Who can intercede or speak in His presence except by His permission?",
              color: EN_OWN_COLOR,
              bg: EN_OWN_BG,
            },
            {
              n: "C-1.",
              text: " God alone knows what lies before them and what lies behind them.",
              color: EN_OWN_COLOR,
              bg: EN_OWN_BG,
            },
            {
              n: "C-2.",
              text: " Can they grasp anything of His knowledge—of the past or the future—unless God wills?",
              color: EN_OWN_COLOR,
              bg: EN_OWN_BG,
            },
            {
              n: "D-1.",
              text: " His Throne, His dominion, extends over the heavens and the earth.",
              color: EN_A_COLOR,
              bg: EN_A_BG,
              textColor: EN_A_TEXT,
            },
            {
              n: "D-2.",
              text: " Preserving them does not burden Him. He is the All-Exalted, the Supreme.",
              color: EN_SLEEP_COLOR,
              bg: EN_SLEEP_BG,
            },
          ],
        },

        "O you who do not know God: when the word “God” is mentioned, do not imagine Him in the form of finite objects of worship confined to temples, fashioned from stone or wood, and lacking all power. God is the One besides whom there is no deity, the Ever-Living and the Self-Subsisting Sustainer. Everything in the heavens and on earth belongs to Him. He is the Sovereign and Owner of the entire universe.",
        "When He is described as the Ever-Living and the Self-Subsisting Sustainer, He should not be conceived in the manner of created living beings. He does not sleep or lapse into heedlessness. He does not grow weary, become ill, or die. This also corrects the idea that God might need rest after creating the universe. The Qur’anic teaching is that God does not tire and therefore has no need for rest, drowsiness, or sleep.",
        "The statements B-1 and B-2 likewise clarify that God did not grant Jesus, or anyone else, a share in His Divinity or sovereignty, nor does He share His Divinity with another. Divine unity therefore excludes attributing any partner or participant to God’s absolute sovereignty.",

        "A-1. God, the Supreme Sovereign Who has no equal or partner, is the Ever-Living and the Self-Subsisting Sustainer. In other words, God, the Sovereign of all worlds, is One. He is the Ever-Living. He gives life to beings, gives movement and order to everything, and holds all things in His grasp at every moment.",
        "A-2. Neither drowsiness nor sleep overtakes Him. He does not tire or become powerless; one task does not prevent Him from carrying out another. Not for a single moment does He relinquish the governance of the universe.",
        "B-1. He is such a Sovereign that everything in the heavens and on earth is His property. The very things that idolaters set up as gods are nothing but part of God’s dominion.",
        "B-2. Who can intercede or speak in His presence except by His permission? Did God grant these idols of stone and wood permission or authority so that the idolaters can say, “These idols will mediate between God and human beings”? Since God has granted no such permission, what benefit can idols and false objects of worship bring to anyone? Do not disgrace yourselves by worshiping idols.",
        "C-1. God alone knows what lies before them and what lies behind them.",
        "C-2. Mediums, shamans, and spiritists—the representatives of false religions—cannot know anything of His infinite knowledge, which encompasses past and future, unless God wills. Do not humiliate yourselves by asking them about the future.",
        "D-1. The Throne of that Sovereign, His sovereignty and rule, extends over the heavens and the earth. His command and laws prevail everywhere in the heavens and on earth.",
        "D-2. Preserving the order of the heavens and the beings on earth does not burden or tire Him. He is the All-Exalted, the Supreme.",

        "First read A-1 and A-2 from left to right. Then read A-1 and D-1 from top to bottom and observe the unity of meaning.",
        "A-1. God, the Supreme Sovereign Who has no equal or partner, is the Ever-Living and the Self-Subsisting Sustainer. In other words, God, the Sovereign of all worlds, is One. He is Living. He gives life to beings and gives movement and order to everything.",
        "D-1. The Throne of that Sovereign, His sovereignty and dominion, extends over the heavens and the earth. His command and laws prevail everywhere in the heavens and on earth.",
        "A-2. Neither drowsiness nor sleep overtakes Him. He does not tire or become powerless; one task does not prevent Him from carrying out another. Not for a single moment does He relinquish the governance of the universe.",
        "D-2. Preserving the order of the heavens and the beings on earth does not burden or tire Him. He is the All-Exalted, the Supreme.",

        "A-1. In the first statement, the Supreme Creator graciously introduces Himself to us as the Supreme Sovereign Who has no equal or partner in the realm of existence. The greatest and most important reality in existence is the Supreme Creator Himself. To know Him through His true Attributes and to worship Him alone is humanity’s greatest and most important duty.",
        "A-2. Building on the first statement, the second continues to make God Almighty known by declaring: “Neither sleep nor drowsiness overtakes God.” It prevents possible human misconceptions about Him.",
        "The main statement A-1 continues in the final two statements, D-1 and D-2.",
        "One of the principal rules of the binary symmetrical system is this: “The meaning of the first verse continues in the fourth, while the second and third verses in between are explanatory verses of elaboration.”",
        "This may be expressed schematically as follows:",
        "(A1 + A2) + [(B1 + B2) + (C1 + C2)] + (D1 + D2)",
        "Main statement A + explanatory groups B and C + continuation of the main statement D.",

        { subtitle: "Explanatory sections of elaboration" },
        "These sentences function as parenthetical statements placed between the sentences that convey the main meaning. They present two important truths that need to be stated at precisely that point.",
        "Indeed, the first explanatory statement that follows delivers a decisive blow to the idols of which the polytheists claimed, “They are our intercessors with God,” leaving no basis for that claim.",
        "B-1. He is such a Sovereign that everything in the heavens and on earth belongs to Him. Yes, He is your Owner and also the Owner of the things you set up as gods and worship.",
        "B-2. Since He owns everything, who can intercede or speak in His presence without His permission? Did God grant these idols of stone and wood permission or authority so that the polytheists can say, “These idols will intercede for people before God”? Since God has granted no one such permission, what benefit can idols and false objects of worship bring to anyone?",

        { subtitle: "HOW SHOULD WE UNDERSTAND INTERCESSION?" },
        "In early Arab society, before the concept of the state had fully developed, social life was shaped by the conditions of the time. A large part of the population was nomadic, and many responsibilities that would later belong to the state were carried out by tribal chiefs. In particular, tribal leaders helped safeguard the lives, property, and freedom of movement of foreigners and vulnerable people.",
        "Tribal chiefs and other wealthy or influential individuals would take the weak and strangers under their protection and publicly announce that protection. The protected person would then invoke the name of the chief who had granted him protection and travel under that chief’s guarantee.",
        "One term used for such protection was shafa‘ah, or intercession. The person granting protection assumed responsibility not only for the life and property of the person under his care but also for that person’s other rights. In practical terms, the protection and intercession of a tribal chief functioned somewhat like an official passport, visa, or guarantee of safe conduct.",
        "Today, these rights and responsibilities generally belong to the state. As social life developed, nations established states, and those states formed institutions responsible for finance, education, policing, defense, and other public needs.",
        "In the past, a person might say, “I am under the protection of such-and-such a chief and such-and-such a tribe. That chief will intercede for me.”",
        "Today, one might say, “I am a citizen of a state that protects me through its laws, courts, police, armed forces, hospitals, and social institutions.”",
        "Registering citizens, issuing identity cards and passports, safeguarding life and property, and guaranteeing legal rights all fall within the authority and responsibility of the state.",
        "In this limited social and historical sense, such protection may help us understand one aspect of the concept of intercession mentioned in the Qur’an.",
        "An important point follows. A state exercises its authority through legislative bodies, institutions, and public officials. In other words, it carries out its legislative and executive functions through those to whom it has formally delegated authority. For example, an ambassador receives authority from the state he or she represents, serves in another country on its behalf, and exercises that delegated authority. The ambassador helps protect the legal rights of citizens abroad, handles official matters on their behalf, and safeguards their interests as a representative of the state.",
        "The conception of idols held by the pagan Arabs of the Age of Ignorance resembled, in some respects, that of ambassadors endowed with delegated authority or officials believed to be capable of granting protection and intercession.",
        "They imagined that spiritual beings were associated with the idols and described some of these beings as daughters of God. They believed that the idols accepted acts of worship and sacrifice on God’s behalf, conveyed requests to Him, and protected those who appealed to them. In this way, the idols were treated as though they were earthly representatives of Divinity. Similar ideas may arise whenever a created being or object is regarded as possessing independent spiritual authority before God.",
        "Yet who granted idols or their devotees the authority to establish such a representation, let alone a Divine representation?",
        "Just as a person who has not been appointed by a state possesses no ambassadorial authority, idols fashioned from stone or wood possess neither authority before God nor any independent power in nature.",
        "God encompasses the heavens and the earth through His knowledge and power and governs all things by His infinite authority. Is it not, therefore, a grave error for people to invent partners for God and imagine that His dominion and authority have been divided among them?",
        "A person who has received no authority from the state but falsely claims, “I am a civil servant, a police officer, or an ambassador,” acts fraudulently, as do those who knowingly support such a claim. In the same way, from the Qur’anic perspective, attributing independent Divine authority to idols, statues, or created beings constitutes a grave error.",
        "Likewise, Jesus, peace be upon him, was a Prophet of God, as were the Prophets before him, and Mary was his honored mother. From the Qur’anic perspective, attributing Divinity or independent Divine powers to either of them constitutes the association of partners with God.",

        "Now let us read the fourth statement of the Verse of the Throne once again:",
        "Since everything in the heavens and on earth belongs to God, since He is the sole Owner and Sovereign of the heavens and the earth, who can possess authority or exercise influence within His dominion without His permission and without His having granted that person authority?",
        "The truth is that everyone, in every condition, at every moment, and in every place, may turn directly to his or her Lord, the Sovereign from pre-eternity to post-eternity, without veil, barrier, or intermediary, and ask Him for whatever is needed. No one is required to regard another person or object as an independently empowered intermediary.",

        { subtitle: "The Second Explanatory Statement" },
        "C-1. God alone knows what lies before them and what lies behind them.",
        "C-2. Have those who claim knowledge of the unseen somehow acquired a portion of God’s infinite knowledge of the past and future without His willing it, so that they may claim to know what is hidden?",
        "This second explanatory statement challenges the claims of charlatans, diviners, shamans, and others who confused people by claiming access to hidden knowledge.",
        "God has neither revealed such knowledge to them nor granted them a share of His knowledge. Without His granting it and without His willing it, how could they have acquired knowledge of the unseen and placed themselves in the position of Prophets? Such claims deceive people and attribute to human beings a knowledge they do not possess.",

        { subtitle: "A-1. THERE IS ONE GOD" },
        "God, Who has no equal or likeness and is the Sovereign of the entire universe, is One. He is the Ever-Living and the Self-Subsisting Sustainer. Neither drowsiness nor sleep overtakes Him.",
        { subtitle: "B-1. IDOLS POSSESS NO DIVINE AUTHORITY" },
        "Everything in the universe belongs to the Supreme Sovereign. He created both the objects people worship and the causes to which they attribute power. Far exalted is He above all such associations. Has God granted any portion of His dominion or infinite power to idols or created beings, such that they may rightly be called gods?",
        { subtitle: "B-2. CLAIMANTS TO HIDDEN KNOWLEDGE POSSESS NO INDEPENDENT AUTHORITY" },
        "Since God alone possesses complete knowledge of the past and the future, how should we regard diviners, spiritists, shamans, or self-appointed religious authorities who claim access to hidden knowledge? Their claims have no authority.",
        { subtitle: "A-2. GOD POSSESSES INFINITE SOVEREIGNTY" },
        "His dominion extends throughout the heavens and the earth. From the smallest particles to the greatest stars, the entire universe lies under His governance. Sustaining the heavens and the earth is neither difficult nor burdensome for Him. God is the All-Exalted, the Supreme, far beyond all human conception.",

        "The statements in this passage also reject any interpretation of scriptural language about God’s resting after creation that might suggest weariness or physical exhaustion. From the Qur’anic perspective, attributing fatigue to God is incompatible with Divine perfection.",
        "The principal and explanatory statements of the Verse of the Throne affirm:",
        "God is the Ever-Living and the Self-Subsisting Sustainer. Neither drowsiness nor sleep overtakes Him. The preservation of the heavens and the earth does not burden Him. He is the All-Exalted, the Supreme.",
      ],
    },
  },
};

// Wire the English panel in now that it's defined — AYAT_AL_KURSI_CONFIG was
// built further up this same file, before AYAT_AL_KURSI_SIDE_INFO_EN existed
// yet.
AYAT_AL_KURSI_CONFIG.sideInfoTranslations = {
  en: AYAT_AL_KURSI_SIDE_INFO_EN,
};
