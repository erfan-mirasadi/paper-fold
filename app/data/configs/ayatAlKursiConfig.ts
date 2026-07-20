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

import type { SurahLayoutConfig } from "../schema";
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

  features: {
    hasIntro: false,
    hasElevatedSections: true,
    hasPopUps: true,
    hideVerseNumbers: true,
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
      circleBorderCol: OUTER_GROUP_BORDER,
      circleBg: OUTER_GROUP_BG,
      circleTextCol: OUTER_GROUP_BORDER,
    },
    2: {
      border: OUTER_GROUP_BORDER,
      circleBorderCol: OUTER_GROUP_BORDER,
      circleBg: OUTER_GROUP_BG,
      circleTextCol: OUTER_GROUP_BORDER,
    },
    3: {
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BORDER,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
    },
    4: {
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BORDER,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
    },
    5: {
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BORDER,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
      translationTextScaleOverride: 0.65,
    },
    6: {
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BORDER,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
    },
    7: {
      border: OUTER_GROUP_BORDER,
      circleBorderCol: OUTER_GROUP_BORDER,
      circleBg: OUTER_GROUP_BG,
      circleTextCol: OUTER_GROUP_BORDER,
    },
    8: {
      border: OUTER_GROUP_BORDER,
      circleBorderCol: OUTER_GROUP_BORDER,
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
// TEXT DATA — English (empty strings per spec)
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
            text: "Allah! (He has no equal or partner). He is the Ever-Living, the Sustainer.",
          },
          { number: 2, text: "He never slumbers or sleeps." },
        ],
      },
      {
        verses: [
          {
            number: 3,
            text: "Whatever is in the heavens and on the earth belongs to Him.",
          },
          {
            number: 4,
            text: "Without His permission, who can intercede and have a say in His presence?",
          },
          {
            number: 5,
            text: "Only Allah knows their future and their past.",
          },
          {
            number: 6,
            text: "Unless Allah wills, have they grasped anything from His knowledge to know the past and the future?",
          },
        ],
      },
      {
        verses: [
          {
            number: 7,
            text: "His throne, His sovereignty is as wide as the heavens and the earth.",
          },
          {
            number: 8,
            text: "Protecting both of them is not burdensome to Him. He is the Most High and the Most Great.",
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
