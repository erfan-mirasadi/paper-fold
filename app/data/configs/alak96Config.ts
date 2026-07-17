import { SurahLayoutConfig } from "../schema";
import type { SurahDataShape } from "../SurahConfig";
import type { SurahLanguage } from "../../hooks/useSurahLanguageStore";
import {
  S1_VERSE_NUMBER_BORDER,
  S1_VERSE_NUMBER_TEXT,
  S1_VERSE_5_TEXT,
  ORANGE_THEME,
  MAROON_THEME,
  GREEN_THEME,
  CAPSULE_BG_6_19,
  CAPSULE_BG_7_8_17_18,
  CAPSULE_BG_9_10_15_16,
  CAPSULE_BG_12_14,
} from "../theme";

export const ALAK_LAYOUT_CONFIG: SurahLayoutConfig = {
  id: "alak",
  title: "ALAK SURESİ",
  heroTitle: "Alak",
  heroSubtitle: "suresi",
  scriptInfo: {
    title: "Alak suresi",
    sayfa: 597,
    juz: 30,
    hizb: 60,
  },

  // Fold-story → script sync: which script verses light up at each fold step.
  // Keys are `animations.foldSteps` ids; values are verse ids. Edit freely.
  scriptHighlights: {
    "pre-start": [1, 2, 3, 4, 5],
    start: [1, 2, 3, 4, 5, 6, 19],
    "outer-open": [1, 2, 3, 4, 5, 6, 7, 8, 18, 17, 19],
    "inner-open": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 16, 15, 17, 18, 19],
    end: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
  },

  // Right-hand tafsir panel (SideInfoPanel). Entries appear as the fold story
  // reveals them: `byFoldStep` keys are fold step ids, `byVerse` keys are
  // verse ids (surfacing at the first step whose scriptHighlights list them).
  //
  // Content transcribed from the reference tafsir book (references/Alak.pdf,
  // pages 291-301). Structure follows the book exactly:
  //   Birinci Bölüm (Ana Bölüm)      → verses 1-5, Ana Ayet = 5
  //   İkinci Bölüm (Tafsil/Açıklama) → verse 6 + 7-8 (inkar) + 9-10 (tuğyan)
  //   Dört Ayetlik Ara Bölüm         → verses 11-14
  //   Üçüncü Bölüm                   → verses 15-18, closing verse 19
  sideInfo: {
    panelTitle: "Tefsir",
    byFoldStep: {
      // ── Folded page: only the five-verse Ana Bölüm is visible ──────────
      "pre-start": {
        kicker: "Beş Ayetlik Ana Bölüm",
        title: "Kur'anın İlk Suresi",
        paragraphs: [
          "Bütün canlı varlıkları kendilerine mahsus bir dil ile konuşturan Allah elbette kendisi de konuşmayı bilir. (Hiç yaratan bilmez mi?) Konuşmayı bilen elbette konuşur ve konuşmuştur. Onun konuşması vahiy ve ilham şeklindedir.",
          "İşte Yüce Yaratıcı peygamberlerine vahiy yoluyla hitap etmiştir. İnsanlar içinde, yaratılışça en ileri, ahlakça en mükemmel olan Hz. Muhammet AS. ile de vahiy yoluyla ve Alemlerin Rabbi sıfatıyla konuşmuştur. Konuşmuş ve bütün insanlığa Onunla mesaj göndermiştir.",
          "Arıları ve karıncaları kraliçesiz, göçmen kuşları ve küçük balıkları öndersiz, dünyaya yeni gelen yavruları ana-babasız, rehbersiz bırakmayan Ezeli Kudret, elbette insanları da Peygambersiz bırakmayacaktır. Cenab-ı Hak Peygamberimize gelinceye kadar 120 bin peygamber göndermiştir. Peygamber Efendimiz Hz. Muhammet Aleyhisselam son peygamberdir. Ondan sonra peygamber gelmeyecektir.",
          "Hazret-i Muhammed Sallallahü aleyhi ve sellem 40 yaşında Hıra mağarasında inzivada bulunduğu bir sırada herşeyin yaratıcısı yüce Allah, melek yani Cebrail Aleyhisselam vasıtasıyla yani vahiy yoluyla konuştu ve ona ilk mesajını gönderdi. Bu mesaj Alak suresinin ilk beş ayetiydi.",
          "İşte böylece Allahın indirdiği son kitap olan Kur'an-ı Kerim nazil olmaya başladı ve ondan sonra Kur'anın nüzulü (inişi) 23 yıl devam etti. Ayet ayet indi, sure sure indi ve 23 yılda tamamlandı.",
          "Alak Suresi: İlk beş ayeti ile insanların bilmeleri ve inanmaları gereken müspet hakikati vaz'ediyor, değişmez doğruyu ortaya koyuyor. Sonra gelen iki tafsil bölümü ise; olmaması gereken menfi olaylardan, yüzlerce küfür ve zulüm hadiselerinden bir örnek veriyor.",
          "Beş ayetlik birinci bölüm bu surenin ana bölümüdür. Bu surede verilmek istenen esas mesaj bu bölümde veciz bir şekilde veriliyor. Kur'anın Mekkedeki muhatapları Mekkeli müşrikler ve Hıristiyan ve Yahudilerdi. Allah C.C. her ifadesinde bu iki muhatabı gözetmiştir. Burada sırayla onlardan bahsediliyor.",
        ],
      },
      // ── First unfold: verses 6 and 19 frame the two Açıklama sections ──
      start: {
        kicker: "Tafsil Bölümleri",
        title: "İkinci Bölüm: Açıklama Bölümüdür",
        paragraphs: [
          "Ana bölüm, muhkem bölüm burada bitti. Şimdi benzeşen ikiz bölümlere bakalım. Bu iki tafsil bölümü, değişebilen olaylardan bahsediyorlar.",
          "Bakalım Mekkede, müşrikler içinden bir adam bu iki büyük nimete nasıl karşılık veriyor? Bu sorunun cevabını ikinci bölümde bulacağız.",
          {
            capsules: [
              {
                n: 6,
                text: "Şimdi Bak, şu adam (Ebu Cehil) Peygambere iman etmediği gibi, ileri gidiyor, taşkınlık yapıyor, zulmediyor.",
                color: ORANGE_THEME,
                bg: CAPSULE_BG_6_19,
              },
            ],
            corners: "soft",
            textColor: "#A30000",
          },
          {
            capsules: [
              {
                n: 7,
                text: "Adam kendini yaratan Allaha iman edeceğine istiğna ediyor, çevresine güvenerek, (Allaha, dine) ihtiyacım yok diyor, inkar ediyor.",
                color: MAROON_THEME,
                bg: CAPSULE_BG_7_8_17_18,
              },
              {
                n: 8,
                text: "(Halbuki) sonunda yine yaratan Rabbin huzuruna dönülecek. Hem de her şeyini dünyada bırakarak.",
                color: MAROON_THEME,
                bg: CAPSULE_BG_7_8_17_18,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
          {
            capsules: [
              {
                n: 9,
                text: "Gördün mü şu, türlü zulümler eden, hatta en masum bir ibadet olan namazı bile engelleyen adamı. İbadet edeceği yerde ibadeti engelliyor.",
                color: MAROON_THEME,
                bg: CAPSULE_BG_9_10_15_16,
              },
              {
                n: 10,
                text: "Namaz kılan bir Allah kuluna (peygambere) güç kullanarak yasaklar getiriyor. İnsanların inanma ve ibadet etme haklarını ellerinden almaya çalışıyor.",
                color: MAROON_THEME,
                bg: CAPSULE_BG_9_10_15_16,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
        ],
      },
      // ── Fully open: the four-verse middle section appears last ─────────
      end: {
        kicker: "Dört Ayetlik Ara Bölüm",
        title: "Akıl ve Vicdan Sahiplerine",
        paragraphs: [
          "Dört ayetlik ara bölüm; akıl ve vicdan sahiplerini insafa ve muhakemeye davet ediyor. Evet Ebu Cehil gibiler sözden anlamasalar da elbette insanların içinde Peygambere ve Onun haklı mesajına vicdanıyla bakanlar ve düşünenler olacaktır. Kur'an bu gelen dört ayetle onlara sesleniyor.",
          "Bu tamam da ey henüz aklını ve vicdanını kaybetmemiş makul insanlar siz ne yapacaksınız? Siz kimin yanındasınız? Yeri göğü yaratan, sizleri yaratan bir Allahın ve Rasulünün tarafında mı, insan hak ve özgürlüklerinden yana mı, yoksa fazla gürültü çıkaran, Allaha saygısız, insana saygısız bir takım güç sahiplerinden yana mı duruyorsunuz?",
          "Tercih size kalmıştır. Yalnız şunu iyi bilin ki bu tercih, sizin dünya ve ahiretinizi etkileyen en önemli kararınız olacaktır.",
          {
            capsules: [
              {
                n: 11,
                text: "Ya bu (Peygamber) doğru yoldaysa?",
                color: GREEN_THEME,
                bg: CAPSULE_BG_12_14,
              },
              {
                n: 12,
                text: "Allah'a itaat edin diyorsa?",
                color: GREEN_THEME,
                bg: CAPSULE_BG_12_14,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
          {
            capsules: [
              {
                n: 13,
                text: "Ya şu yalanlıyor ve sırtını dönüyorsa?",
                color: GREEN_THEME,
                bg: CAPSULE_BG_12_14,
              },
              {
                n: 14,
                text: "Allahın kendisini gördüğünü bilmiyor mu yoksa?",
                color: GREEN_THEME,
                bg: CAPSULE_BG_12_14,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
        ],
      },
    },
    byVerse: {
      // ── Ana Bölüm: ikiz ayetler 1-2 → müşriklere ───────────────────────
      1: {
        kicker: "1-2. Ayetler",
        title: "Müşriklere: Yaratılış Nimeti",
        paragraphs: [
          "Allah gerçek bir din nedir bilmeyen müşriklere yaratılış nimetini ve yaratılış mucizesini hatırlatıyor. Biz de buradan kendimize bir ders çıkarıyoruz: Allahın birinci nimeti bizi harika bir surette insan olarak yaratması ve dünyaya getirmesidir. Buna karşılık bizden yalnız kendisine ibadet etmemizi istiyor. İstemek de Onun hakkıdır.",
          "Allahın yarattığı bir insan olarak Yaratanımızdan gelen bu davete cevabımız hemen can-u gönülden iman ve itaat olmalı değil midir?",
          {
            capsules: [
              {
                n: 1,
                text: "Sen Rabbinin elçisi olarak şu ayetleri puta tapan müşriklere oku ki herşeyi Rabbin yarattı. Putlar değil! Onlar da başka şeylere değil, Yalnızca Allaha ibadet etsinler.",
                color: ORANGE_THEME,
                bg: CAPSULE_BG_6_19,
              },
              {
                n: 2,
                text: "Evet Rabbin insanı, ana rahmine tutunan bir hücrecikten yarattı. Bu harika olayı gerçekleştiren ve sizi dünyaya getiren Rabbinizi bırakıp nasıl başka şeylere taparsınız?",
                color: ORANGE_THEME,
                bg: CAPSULE_BG_6_19,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
        ],
      },
      // ── Ana Bölüm: ikiz ayetler 3-4 → Ehl-i Kitaba ─────────────────────
      3: {
        kicker: "3-4. Ayetler",
        title: "Ehl-i Kitaba: Hidayet Nimeti",
        paragraphs: [
          "Allahın ikinci büyük nimeti hidayet nimetidir, Kitap gönderme nimetidir.",
          "Bu ikiz ayetlerden de anlıyoruz ki Kur'anın ve Peygamber Efendimizin yine o günün şartlarında müşriklerden sonra gelen muhatabı Arap yarımadasında yaşayan Ehl-i Kitap dediğimiz Hıristiyanlar ve Yahudilerdir. Evet Kur'an-ı Kerimin birçok ayetlerinden anlıyoruz ki Kur'anın Mekkede iki gurup muhatabı var: Müşrikler ve Ehl-i Kitap (Hıristiyanlar ve Yahudiler).",
          {
            capsules: [
              {
                n: 3,
                text: "Yine bu ayetleri Rabbin adına Hıristiyan ve Yahudilere oku ki Rabbin onlara çok lütuflarda bulundu, (yani onlara peygamber ve kitap gönderdi.)",
                color: ORANGE_THEME,
                bg: CAPSULE_BG_6_19,
              },
              {
                n: 4,
                text: "Rabbin, Tevrat ve İncili (Ehl-i Kitap alimlerine kalemle) öğretti! Yani onlar zaten kitaba ve Peygambere yabancı değiller.",
                color: ORANGE_THEME,
                bg: CAPSULE_BG_6_19,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
        ],
      },
      // ── Ana Ayet ───────────────────────────────────────────────────────
      5: {
        kicker: "Ana Ayet",
        title: "Bütün Surenin Ana Ayeti",
        paragraphs: [
          "Bu birinci bölümün de ana ayeti 5. ayettir. Dolayısıyla bütün surenin ana ayetidir 5. ayet. Evet Peygamber Efendimize nazil olan ilk ayetlerin bütün insanlığa Efendimizin nübüvvet ve risaletini ilan etmesi kadar güzel ve isabetli bir mesaj olabilir mi? Bu tek ayetin içinde çok cümleler gizli:",
          "Hz. Muhammet bir insandır; daha önceki peygamberlerin de birer insan oldukları gibi. O şimdi vahiy olarak kendisine gelen ve gelecek olan ayetleri daha önceden bilen bir insan değildi. Tevrat ve İncili okuyup yazarak öğrenen din bilginlerinden biri de değil o. Okuduğu şu ayetleri ona öğreten Allahtır. O şimdi kendisine nazil olan ayetleri size okumakla görevli bir Allah Elçisidir.",
          {
            capsules: [
              {
                n: 5,
                text: "Ey insanlar! Allah şimdi ümmi bir kuluna (Muhammede vahyederek) Ona, daha önce hiç bilmediği şeyleri öğretti ve Onu size rehber yaptı. Haydi hepiniz Allaha ve Onun Elçisine iman ve itaat ediniz.",
                color: ORANGE_THEME,
                bg: CAPSULE_BG_6_19,
              },
            ],
            corners: "soft",
            textColor: "#A30000",
          },
        ],
      },
      // ── İkinci Bölümün ana ayeti ───────────────────────────────────────
      6: {
        kicker: "1. Açıklama Bölümü",
        title: "Şimdi Bak Şu Adama",
        paragraphs: [
          {
            capsules: [
              {
                n: 6,
                text: "Şimdi Bak, şu adam (Ebu Cehil) Peygambere iman etmediği gibi, ileri gidiyor, taşkınlık yapıyor, zulmediyor.",
                color: ORANGE_THEME,
                bg: CAPSULE_BG_6_19,
              },
            ],
            corners: "soft",
            textColor: "#A30000",
          },
        ],
      },
      // ── İnkar safhası: 7-8 ─────────────────────────────────────────────
      7: {
        kicker: "7-8. Ayetler · İnkar Safhası",
        title: "Kendini Müstağni Görüyor",
        paragraphs: [
          "Ne yapıyor bu adam? Bu ana ayeti açıklayan şu iki ayet Ebu Cehilin ve onun gibilerin inkâr ve istiğnalarını haber veriyor:",
          {
            capsules: [
              {
                n: 7,
                text: "Adam kendini yaratan Allaha karşı iman yerine istiğna ediyor, çevresine güvenerek, (Allaha, dine) ihtiyacım yok diyor, inkar ediyor.",
                color: MAROON_THEME,
                bg: CAPSULE_BG_7_8_17_18,
              },
              {
                n: 8,
                text: "(Halbuki başta Allah yarattığı gibi) sonunda yine yaratan Rabbin huzuruna dönülecek.",
                color: MAROON_THEME,
                bg: CAPSULE_BG_7_8_17_18,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
        ],
      },
      // ── Tuğyan safhası: 9-10 ───────────────────────────────────────────
      9: {
        kicker: "9-10. Ayetler · Tuğyan Safhası",
        title: "Namaza Engel Olan Adam",
        paragraphs: [
          "Bundan sonra gelen iki ayet ise Ebu Cehilin ve onun gibilerin inkardan da öteye geçerek zulüm ve tuğyan ve taşkınlık yaptıklarını anlatıyor:",
          "Bu surede anlatılan inkarcı insan tipinin önemli bir özelliği tuğyandır. Tuğyanın önemli bir göstergesi de başkasına tahakkümdür, zulümdür, hayata kastetmektir. Kendi inanç ve düşüncesine uymayan farklı görüş ve inançları yasaklama ve yok etme gayretidir. İslam dini ise başka inanç ve görüşleri yasaklayıcı değildir. Peygamberler vazifelerini yapar, tebliğ eder ve hatırlatırlar ama kimseye hiçbir şeyi dayatmazlar, zorlamazlar.",
          {
            capsules: [
              {
                n: 9,
                text: "Gördün mü şu, türlü zulümler eden, hatta en masum bir ibadet olan namazı bile engelleyen adamı. İbadet edeceği yerde ibadeti engelliyor.",
                color: MAROON_THEME,
                bg: CAPSULE_BG_9_10_15_16,
              },
              {
                n: 10,
                text: "Namaz kılan bir Allah kuluna (peygambere) güç kullanarak yasaklar getiriyor. Başkalarının inanma ve ibadet etme haklarını ellerinden almaya çalışıyor.",
                color: MAROON_THEME,
                bg: CAPSULE_BG_9_10_15_16,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
        ],
      },
      // ── Ara Bölüm: 11-12 ───────────────────────────────────────────────
      11: {
        kicker: "11-12. Ayetler · Ara Bölüm",
        title: "Ya O Kul Doğru Yoldaysa?",
        paragraphs: [
          "Bu ayet: Muhammed Aleyhisselamın sıdk ve doğruluğuna ve davet ettiği La ilâhe illallah inancının güzelliğine bakarak anlayınız ki dava ve daveti haktır. Ona iman ediniz! Peygamberin sizden istediği ikinci şey yalnız bir olan Allaha ibadetle itaattir. Sizden başka bir şey istemiyor ki!",
          {
            capsules: [
              {
                n: 11,
                text: "Ya bu (Peygamber) doğru yoldaysa?",
                color: GREEN_THEME,
                bg: CAPSULE_BG_12_14,
              },
              {
                n: 12,
                text: "Allah'a itaat edin diyorsa?",
                color: GREEN_THEME,
                bg: CAPSULE_BG_12_14,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
        ],
      },
      // ── Ara Bölüm: 13-14 ───────────────────────────────────────────────
      13: {
        kicker: "13-14. Ayetler · Ara Bölüm",
        title: "Allahın Gördüğünü Bilmiyor mu?",
        paragraphs: [
          "Ebu Cehil ve onun gibileri yukarıdaki iman davetini yalanladılar. Peygamberin davetine sırt döndüler. Kendilerinin başıboş bırakılacaklarını mı sanıyorlar? Allah, elbette kullarının bu inkar ve isyanlarını görüyor. Onlardan bunun hesabını soracaktır.",
          "Kesin inançsızlar veya inatçı kafirler: Bir kere günlük olaylardan sıyrılıp kendini dinlememiş, tabiata bakmamış, bir kere yaratılış mucizesini düşünmemiş, bir kere evrensel hakikatlerden bahseden peygamberlere ve Allahın gönderdiği kitaplara vicdanıyla kulak vermemiş. Hayata yalnız bedensel ihtiyaçlarının penceresinden bakmış, kendi basit sosyal statüsünü ve basit çıkarlarını korumayı dünyanın en önemli meselesi zannetmiş küçük adamlar…",
          "Böyle kendi yanlış inanç ve düşüncelerini kesin doğrular olarak kabul eden ve karşı tarafın bütün doğrularını yanlış kabul eden adamlar doğruyu bulamazlar, makul ve mutedil davranamazlar. Zihin yapıları taşlaşmıştır, beyinleri esnemez. Ne olur bir kere makul olabilseler, bir kere de kendi doğrularından azıcık şüphe etseler? Bir kere de karşı tarafa azıcık hak verebilseler dersiniz.",
          "Bu konuda onların vicdanları kararmış, muhakemeleri bozulmuş olabilir. Ama her şeyi gören, bilen bir de Allah var. Bir de Allahın şaşmaz adaleti var. Allahın her şeyi gördüğünü bilmiyorlar mı yoksa? Bile bile düşmanlık edenleri Allah hiç iflah eder mi?",
          {
            capsules: [
              {
                n: 13,
                text: "Ya şu yalanlıyor ve sırtını dönüyorsa?",
                color: GREEN_THEME,
                bg: CAPSULE_BG_12_14,
              },
              {
                n: 14,
                text: "Allahın gördüğünü bilmiyor mu yoksa?",
                color: GREEN_THEME,
                bg: CAPSULE_BG_12_14,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
        ],
      },
      // ── Üçüncü Bölüm: 15-16 ────────────────────────────────────────────
      15: {
        kicker: "15-16. Ayetler · Üçüncü Bölüm",
        title: "Yalancı, Secdesiz Alnından",
        paragraphs: [
          "Böyle zalim başlar, Kahhar-ı Zülcelal tarafından gebertilip sonra da İlahi adaletin eliyle cehenneme atılacaklardır. Böylelerin yapacakları varsa görecekleri de var! diyor, zalimlerin cesaretlerini ve insan haklarına, hukuka tecavüzlerini kırıyor.",
          {
            capsules: [
              {
                n: 15,
                text: "Hayır, eğer vazgeçmezse biz onu alnından tutar sürükleriz!",
                color: MAROON_THEME,
                bg: CAPSULE_BG_9_10_15_16,
              },
              {
                n: 16,
                text: "O yalancı, o secdesiz alnından tutar cehenneme atarız.",
                color: MAROON_THEME,
                bg: CAPSULE_BG_9_10_15_16,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
        ],
      },
      // ── Üçüncü Bölüm: 17-18 ────────────────────────────────────────────
      17: {
        kicker: "17-18. Ayetler · Üçüncü Bölüm",
        title: "Çağırsın Çevresini",
        paragraphs: [
          "Dünyada böyle inkar ve böyle zulmedenlerin ahirette cezaları nasıl olacak? Üçüncü bölüm onların ahiretteki durumlarını haber veriyor.",
          {
            capsules: [
              {
                n: 17,
                text: "Çağırsın o zaman, o çok güvendiği çevresini;",
                color: MAROON_THEME,
                bg: CAPSULE_BG_7_8_17_18,
              },
              {
                n: 18,
                text: "Elbette biz de çağıracağız o zaman Zebanileri.",
                color: MAROON_THEME,
                bg: CAPSULE_BG_7_8_17_18,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
        ],
      },
      // ── Surenin son ayeti ──────────────────────────────────────────────
      19: {
        kicker: "Surenin Son Ayeti",
        title: "Secde Et ve Yaklaş",
        paragraphs: [
          "Evet dünyada böyle çılgın, böyle zalim adamlar her zaman vardır. Allah Rasulü böyle zalim adamlara mahkum olmayacak, onlara itaat de etmeyecek, Allah davasını onların keyiflerine bırakmayacak; her türlü zulüm ve engellemelere rağmen mukaddes vazifesine devam edecektir.",
          "Sen hatırlatıcı ve uyarıcısın. Onları zorlayıcı değilsin. (Leste aleyhim bimusaytır)",
          {
            capsules: [
              {
                n: 19,
                text: "Hayır ey Rasulüm, sakın onun mahkumu olma! Yalnız Rabbine secde et (yani namaz kıl) ve ona yaklaş.",
                color: ORANGE_THEME,
                bg: CAPSULE_BG_6_19,
              },
            ],
            corners: "soft",
            textColor: "#A30000",
          },
        ],
      },
    },
  },
  features: {
    hasIntro: true,
    hasElevatedSections: true,
    hasPopUps: true,
  },
  dimensions: {
    paperWidth: 1.54,
    paperHeight: 1.78,
    sceneCenterYOffset: -0.045,
    padding: 0.29,
    scrollPages: 6,
    fixedWidthAcrossLanguages: true,
  },
  specialVerses: {
    middleFoldVerses: { left: [12, 14], right: [11, 13] },
    versePairings: {
      1: 2,
      2: 1,
      3: 4,
      4: 3,
      7: 8,
      8: 7,
      9: 10,
      10: 9,
      11: 12,
      12: 11,
      13: 14,
      14: 13,
      15: 16,
      16: 15,
      17: 18,
      18: 17,
    },
  },
  introMedia: {
    section1_start: {
      src: "",
      isVideo: false,
      backgroundText: {
        title: "İkra!",
        arabicHollowText: "اقرأ",
        titleSize: "text-[16vw] md:text-[12vw]",
        groupId: "oku_intro",
        isZoomed: false,
      },
    },
    section1_zoom: {
      src: "",
      isVideo: false,
      backgroundText: {
        title: "İkra!",
        arabicHollowText: "اقرأ",
        titleSize: "text-[16vw] md:text-[12vw]",
        groupId: "oku_intro",
        isZoomed: true,
      },
    },
    section1: {
      src: "",
      isVideo: false,
      backgroundText: {
        title: "İnsanlara oku!",
        titleSize: "text-[11vw] md:text-[8.5vw] leading-[1.05]",
      },
    },
    section1_step1: {
      src: "",
      isVideo: false,
      backgroundText: {
        title:
          "Alak suresi, insanlığın ufkunda doğan İlahi bir güneş gibi\nMuhammed aleyhisselama peygamberlik tacının giydirildiğini\nbütün cihana ilan etmiş ve müjdelemiştir",
        titleSize: "text-[5.5vw] md:text-[3.5vw] leading-[1.2]",
      },
    },
    section1_step2: {
      src: "/intro/section-1.mp4",
      isVideo: true,
      backgroundText: {
        caption: "Muhkem",
        title: "Tebliğ\nirşad vazifesinin \ntarifi tebliği",
      },
    },
    section1_step3: {
      src: "/intro/section-1.mp4",
      isVideo: true,
      backgroundText: {
        caption: "Muhkem",
        title: "Risâlet makamının rütbesinin\nvazifesinin dünyaya ilânı",
      },
    },
    section2_g0: {
      src: "/intro/section-2.mp4",
      isVideo: true,
      backgroundText: {
        caption: "Ebu cehil'in dünyası",
        title: "Tuğyan\n zulüm\ninkâr \nistiğna",
      },
    },
    section2_g1: {
      src: "/intro/section-3.mp4",
      isVideo: true,
      backgroundText: {
        title: "Dışarıdan bakanlara\n hitap",
      },
    },
    section2_g2: {
      src: "/intro/section-4.mp4",
      isVideo: true,
      backgroundText: {
        caption: "Ebu cehil'in ahireti",
        title: "Tuğyanın\n zulmün\n inkârın \nkarşılığı",
      },
    },
  },
  introGuides: {
    section1: "Ana bölüm",
    section2_g0: "1. Açıklama bölümü",
    section2_g1: "Orta bölüm",
    section2_g2: "2. Açıklama bölümü",
  },
  assets: {},
  verseOverrides: {
    // ── Section 1 verse 5 ─────────────────────────────────────────────────
    5: {
      customFrameSvg: "/alak/Group 11.svg",
      expandW: 0.035,
      expandH: 0.01,
      frameScaleLTR: 1.1,
      isPill: false,
      bg: CAPSULE_BG_6_19,
      border: CAPSULE_BG_6_19,
      circleBorderCol: S1_VERSE_NUMBER_BORDER,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: S1_VERSE_NUMBER_TEXT,
      textColor: S1_VERSE_5_TEXT,
      hasCapsuleLabel: true,
    },
    // ── Section 2 intro verse (6) ─────────────────────────────────────────
    // isPill:false is needed so the paper-mask radius (VERSE_5_6_19_RADIUS)
    // matches the actual rendered shape — BlockRenderer's dedicated
    // introVerse path always renders it non-pill regardless of this flag.
    6: {
      bg: CAPSULE_BG_6_19,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: ORANGE_THEME,
      isPill: false,
    },
    // ── Group 1 outer rows (7, 8) ─────────────────────────────────────────
    7: {
      bg: CAPSULE_BG_7_8_17_18,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_7_8_17_18,
      circleTextCol: MAROON_THEME,
    },
    8: {
      bg: CAPSULE_BG_7_8_17_18,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_7_8_17_18,
      circleTextCol: MAROON_THEME,
    },
    // ── Group 1 inner rows (9, 10) ────────────────────────────────────────
    9: {
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    10: {
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    // ── Group 2 center (11, 12, 13, 14) ──────────────────────────────────
    11: {
      bg: CAPSULE_BG_12_14,
      border: GREEN_THEME,
      circleBorderCol: GREEN_THEME,
      circleBg: CAPSULE_BG_12_14,
      circleTextCol: GREEN_THEME,
    },
    12: {
      bg: CAPSULE_BG_12_14,
      border: GREEN_THEME,
      circleBorderCol: GREEN_THEME,
      circleBg: CAPSULE_BG_12_14,
      circleTextCol: GREEN_THEME,
    },
    13: {
      bg: CAPSULE_BG_12_14,
      border: GREEN_THEME,
      circleBorderCol: GREEN_THEME,
      circleBg: CAPSULE_BG_12_14,
      circleTextCol: GREEN_THEME,
    },
    14: {
      bg: CAPSULE_BG_12_14,
      border: GREEN_THEME,
      circleBorderCol: GREEN_THEME,
      circleBg: CAPSULE_BG_12_14,
      circleTextCol: GREEN_THEME,
    },
    // ── Group 3 inner rows (15, 16) ───────────────────────────────────────
    15: {
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    16: {
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    // ── Group 3 outer rows (17, 18) ───────────────────────────────────────
    17: {
      bg: CAPSULE_BG_7_8_17_18,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_7_8_17_18,
      circleTextCol: MAROON_THEME,
    },
    18: {
      bg: CAPSULE_BG_7_8_17_18,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_7_8_17_18,
      circleTextCol: MAROON_THEME,
    },
    // ── Section 2 outro verse (19) ────────────────────────────────────────
    19: {
      bg: CAPSULE_BG_6_19,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: ORANGE_THEME,
      isPill: false,
    },
  },
  styling: {
    colors: {
      paperBase: "#E4DFCA",
      shadow: "#000000",
      backface: "#e8e4d8",
      textDark: "#333333", // Assuming some dark hex
      textLabel: "#555555", // Assuming some label hex
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
      maroonTheme: MAROON_THEME,
      greenTheme: GREEN_THEME,
      s1InnerBorder: "#cccccc",
      s2IntroOutroBg: ORANGE_THEME,
      s2Group1Bg: MAROON_THEME,
      s2Group2Bg: GREEN_THEME,
      s2Group3Bg: MAROON_THEME,
      /**
       * Bracket color sequence for SideCurves, outermost → center.
       * Index 0–2 = outer brackets (blue → maroon → maroon).
       * Index 3   = center bracket (green).
       */
      curveColors: [
        {
          color: ORANGE_THEME,
          fillColor: CAPSULE_BG_6_19,
          topAnchorXOffset: 0.01,
          bottomAnchorXOffset: 0.01,
        },
        {
          color: MAROON_THEME,
          fillColor: CAPSULE_BG_7_8_17_18,
          topAnchorXOffset: 0.009,
          bottomAnchorXOffset: 0.009,
        },
        {
          color: MAROON_THEME,
          fillColor: CAPSULE_BG_9_10_15_16,
          topAnchorXOffset: 0.008,
          bottomAnchorXOffset: 0.008,
        },
        { color: GREEN_THEME, fillColor: CAPSULE_BG_12_14 },
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
    s1NeonConfig: {
      haloPad: 0.014,
      haloZ: -0.001,
      haloOpacity: 0.36,
      haloEmissiveIntensity: 4.2,
      outerHaloPad: 0.026,
      outerHaloOpacity: 0.16,
      outerHaloEmissiveIntensity: 2.4,
      topLabelGapWidth: 0.425,
      topLabelGapPadding: 0.01,
      topLabelGapHeight: 0.058,
      topLabelGapYOffset: 0.022,
    },
  },
  // ── NEW BLOCK-BASED SCHEMA ──────────────────────────────────────────────
  // Legacy params mapping:
  //   smallBoxH2: 0.075      → capsuleHeight
  //   s2Gap: 0.02            → columnGap
  //   s2VerticalRowGap: (unset, falls back to s2Gap) → rowGap
  //   groupGap: 0.035        → blockGap (middleExtraGap 0.03 applied via
  //                             verticalNudge on g1/g2 below — see note there)
  //   s2PadLeftRight: 0.035  → sectionPadX
  //   groupPad: 0.012        → blockPadding
  //   sgBorderWidth: 0.006   → sectionBorderWidth
  //   sgPad: 0.03            → connectorPad
  //   s2VerticalPad: 0.054   → framePad
  //   boxExtOffset: 0.02     → boxExtOffset
  globalSettings: {
    capsuleHeight: 0.075,
    columnGap: 0.02,
    rowGap: 0.02,
    blockGap: 0.035,
    sectionPadX: 0.035,
    blockPadding: 0.012,
    sectionBorderWidth: 0.006,
    connectorPad: 0.03,
    framePad: 0.054,
    boxExtOffset: 0.02,
    contentStartYOverride: -0.06, // was the hand-tuned fixed s1Top (Alak does not auto-center)
    capsuleLabelW: 0.2,
    capsuleLabelH: 0.032,
    capsuleLabelBorderWidth: 0.0035,
    capsuleLabelDrop: 0.015,
  },

  blocks: [
    // ── Section 1 — grid + AnaAyet ─────────────────────────────────────────
    {
      id: "section1",
      type: "grid",
      verseIds: [2, 1, 4, 3],
      anaAyetId: 5,
      capsuleHeight: 0.07, // was smallBoxH
      rowGap: 0.02, // was gap
      blockPadding: 0.045, // was s1Pad
      fixedHeight: 0.132, // AnaAyet height, was anaAyetH
      anaAyetGap: 0.05, // was s1AnaGap
      anaAyetYOffset: -0.01, // was the hardcoded ANA_AYET_Y_OFFSET
      bgThemeKey: "s1InnerBorder",
      labelKey: "section1Label",
      // Surah-wide Section 2 title labels — declared here (on Section 1)
      // purely as a stable single source; ElevatedSectionLabels anchors them
      // to the first/last "real" section2 group regardless of which block
      // declares the key.
      topLabelKey: "section2TopLabel",
      bottomLabelKey: "section2BottomLabel",
      cameraTarget: { y: 2, fov: 20, tilt: -1.3 },
    },
    // ── Intro verse (6) — merges into section2_g0's elevation zone ────────
    {
      id: "section2_intro",
      type: "group",
      verseIds: [6],
      columns: 1,
      capsuleHeight: 0.125, // was bigBoxH
      blockPadding: 0,
      isCenter: false,
      introOutroRole: "intro",
      customSectionId: "section2_g0",
      // was gapBetweenS1andS2 (0.09) + s2VerticalPad (0.054) — legacy derives
      // the intro verse's Y as `s2Top - s2VerticalPad`, where s2Top is
      // already offset from Section 1 by gapBetweenS1andS2, so both gaps
      // stack here.
      gapBefore: 0.144,
    },
    // ── Group 0 (top, not pushed in) ───────────────────────────────────────
    {
      id: "section2_g0",
      type: "group",
      verseIds: [8, 7, 10, 9],
      horizontalInset: 0,
      isCenter: false,
      bgThemeKey: "s2Group1Bg",
      cameraTarget: { y: 1.4, fov: 25, tilt: -1.3 }, // was subCameraTargets.top
    },
    // ── Group 1 (center, pushed in, group-drag) ────────────────────────────
    {
      id: "section2_g1",
      type: "group",
      verseIds: [12, 11, 14, 13],
      horizontalInset: 0.01, // was g2Scale
      isCenter: true,
      dragBehavior: "group",
      bgThemeKey: "s2Group2Bg",
      // Legacy quirk, preserved: `middleExtraGap` (0.03) is added on top of
      // the standard blockGap for BOTH inner gaps (g0→g1, g1→g2). Each real
      // group's own verticalNudge cascades forward, so giving g1 AND g2
      // their own +0.03 nudge reproduces legacy's cumulative 2x offset by g2
      // exactly (verified numerically).
      verticalNudge: 0.03,
      cameraTarget: { y: 1, fov: 30, tilt: -1.5 }, // was subCameraTargets.center
    },
    // ── Group 2 (bottom, not pushed in) ────────────────────────────────────
    {
      id: "section2_g2",
      type: "group",
      verseIds: [16, 15, 18, 17],
      horizontalInset: 0,
      isCenter: false,
      bgThemeKey: "s2Group3Bg",
      verticalNudge: 0.03,
      cameraTarget: { y: 0.7, fov: 35, tilt: -1.5 }, // was subCameraTargets.bottom
    },
    // ── Outro verse (19) — merges into section2_g2's elevation zone ───────
    {
      id: "section2_outro",
      type: "group",
      verseIds: [19],
      columns: 1,
      capsuleHeight: 0.125,
      blockPadding: 0,
      isCenter: false,
      introOutroRole: "outro",
      customSectionId: "section2_g2",
    },
  ],
  animations: {
    introCamera: {
      introPosition: [-1.221, 0.343, 2.756],
      introTarget: [0.492, 0.176, 1.237],
      scrollOffset: [0.5, 1.5, 0],
      targetFollow: 1,
      allowOrbit: false,
      handoffDurationMs: 800,
    },
    scrollTimeline: {
      intro: { start: 0, end: 15 },
      ambient: { start: 15, end: 50 },
      handoff: { start: 50, end: 60 },
      story: { start: 60, end: 100 },
    },
    scrollLock: {
      lockPositionPercentage: 0.6,
      effortRequired: 3000,
      grabRangePixels: 50,
    },
    ambientMediaKeys: [
      "section1_start",
      "section1_zoom",
      "section1",
      "section1_step1",
      "section1_step2",
      "section1_step3",
      "section2_g0",
      "section2_g1",
      "section2_g2",
    ],
    // groupYPositions/groupHeights index: 0=section1, 1=intro, 2=g0, 3=g1,
    // 4=g2, 5=outro. The 0.033 constants are a deliberate legacy quirk — the
    // visual fold crease sits slightly off from the real `middleExtraGap`
    // (0.03) layout gap, preserved exactly rather than "cleaned up".
    computeFoldYPositions: (lm: any) => {
      const y = lm.groupYPositions;
      const h = lm.groupHeights;
      return [
        // Midpoint of the Section1→Section2 GAP itself (gapBetweenS1andS2 /
        // 2 = 0.045) — NOT the midpoint with the intro verse's actual
        // position, which sits `framePad` further down inside Section 2's
        // own padded box.
        y[0] - h[0] - 0.045,
        (y[1] - h[1] + y[2]) / 2,
        y[2] - lm.blockPadding - lm.capsuleHeight - lm.rowGap / 2,
        y[2] - h[2] - (lm.blockGap + 0.033) / 2,
        y[3] - lm.blockPadding - lm.capsuleHeight - lm.rowGap / 2,
        y[3] - h[3] - (lm.blockGap + 0.033) / 2,
        y[4] - lm.blockPadding - lm.capsuleHeight - lm.rowGap / 2,
        (y[4] - h[4] + y[5]) / 2,
      ];
    },
    foldSteps: [
      {
        id: "pre-start",
        folds: [
          { direction: 1, angleFactor: 0.93 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: -1 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: -1 },
        ],
      },
      {
        id: "start",
        folds: [
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: -0.5 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: -1, angleFactor: 1.03 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: -0.53 },
        ],
      },
      {
        id: "outer-open",
        folds: [
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0.5 },
          { direction: -1, angleFactor: 0 },
          { direction: -1, angleFactor: 1.03 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0.53 },
          { direction: -1, angleFactor: 0 },
        ],
      },
      {
        id: "inner-open",
        folds: [
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: -0.6 },
          { direction: -1, angleFactor: 1.1 },
          { direction: -1, angleFactor: -0.5 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
        ],
      },
      {
        id: "end",
        folds: [
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
        ],
      },
    ],
  },
};

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
            text: "Çağırsın o zaman o (çok güvendiği) çevresini,",
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

// English translated data
export const ALAK_TEXT_EN: SurahDataShape = {
  bismillah: "بِسْـــــــــــــــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",

  section1: {
    label: "Five-verse Main Section",
    gridVerses: [
      {
        number: 1,
        text: "(O Muhammad, read these verses revealed to you to people in the name of your Lord: He created",
      },
      {
        number: 2,
        text: "Yes, your Lord created man from an 'alaq, that is, a single cell.",
      },
      {
        number: 3,
        text: "Read these verses again in the name of your Lord, for He is most generous.",
      },
      {
        number: 4,
        text: "He taught people (the knowledge in the Torah and the Gospel) by the pen.",
      },
    ],
    anaAyet: {
      number: 5,
      text: "Now Allah has taught an unlettered man, Muhammad (PBUH), by revelation, things he did not know before, that is, He made him a Messenger for Himself.",
    },
  },

  section2: {
    topLabel: "Five-verse 1st Explanation Section",
    introVerse: {
      number: 6,
      text: "Look now at another man (Abu Jahl), who denies and rebels against the Prophethood of Muhammad, which is as clear as the sun:",
    },
    colorGroups: [
      {
        // Group 1 — Upper maroon block (verses 7–10)
        verses: [
          {
            number: 7,
            text: "(Relying on his surroundings) he sees himself as self-sufficient against Allah.",
          },
          {
            number: 8,
            text: "However, in the end, there will be a return to the Creator Lord.",
          },
          {
            number: 9,
            text: "Have you seen the one who goes too far and prevents (prayer).",
          },
          {
            number: 10,
            text: "He prevents a servant (prophet) while he is praying.",
          },
        ],
      },
      {
        // Group 2 — Center green block (verses 11–14), indented/pushed in
        verses: [
          {
            number: 11,
            text: "What if that Servant is on the right path?",
          },
          { number: 12, text: "Or if he commands obedience to Allah?" },
          {
            number: 13,
            text: "What if the other denies the religion and turns away from worship?",
          },
          {
            number: 14,
            text: "Does he not know that Allah sees everything?",
          },
        ],
      },
      {
        // Group 3 — Lower maroon block (verses 15–18)
        verses: [
          {
            number: 15,
            text: "No! If he does not desist, We will grab him by his forelock and drag him.",
          },
          {
            number: 16,
            text: "That lying, prostration-less forelock, We will grab it and throw it into hell.",
          },
          {
            number: 17,
            text: "Let him call then upon his (trusted) associates,",
          },
          {
            number: 18,
            text: "Then We too, will certainly call the guards of hell (Zabaniya).",
          },
        ],
      },
    ],
    outroVerse: {
      number: 19,
      text: "No! Beware, do not be subjected to him! Prostrate (to Allah) and draw near to Him.",
    },
    bottomLabel: "Five-verse 2nd Explanation Section",
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
