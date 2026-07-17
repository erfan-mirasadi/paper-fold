import type { SurahLayoutConfig } from "../schema";
import type { SurahDataShape } from "../SurahConfig";
import type { SurahLanguage } from "../../hooks/useSurahLanguageStore";
import { CAPSULE_BG_6_19, ORANGE_THEME } from "../theme";

const OUTER_GROUP_BG = "#FDF4CA"; // Yellow (top and bottom full-width verses)
const CENTER_GROUP_BG = "#eaf2db"; // Green (middle 2-col group)
const CENTER_GROUP_BORDER = "#5E7367"; // Dark green border

export const KAFIRUN_109_CONFIG: SurahLayoutConfig = {
  id: "kafirun109",
  title: "Kafirun Suresi",
  scriptInfo: {
    title: "Kafirun Suresi",
    sayfa: 603,
    juz: 30,
    hizb: 60,
  },

  // Fold-story → script sync: which script verses light up at each fold step.
  // Keys are `animations.foldSteps` ids; values are verse ids. Edit freely.
  scriptHighlights: {
    "pre-start": [1, 6],
    end: [1, 2, 3, 4, 5, 6],
  },

  // Right-hand tafsir panel (SideInfoPanel). Content transcribed verbatim
  // from the reference tafsir book, pages 355-359 (read in page order:
  // 355, 356, 357, 358, 359).
  sideInfo: {
    panelTitle: "Tefsir",
    byFoldStep: {
      "pre-start": {
        kicker: "1 ve 6. Ayetler",
        title: "Kafirun Suresi: Uzlaşma Çağrısı",
        paragraphs: [
          'Bu Sure İslam dinine karşı kesin tavır almış, inanmamakta kararlı olan bir kısım Mekkeli kafirlere; "HERKES KENDİ YOLUNA GİTSİN, MEKKEDE BERABER ve BARIŞ İÇİNDE YAŞAYALIM" DİYOR..',
          "Kimse kimseyi inancından ve ibadetinden dolayı kınamasın, alay etmesin, taciz etmesin.",
          "Alemlere Rahmet Hz. Muhammed AS. Efendimiz Mekke'de Peygamberlikle görevlendirilince insanları bir olan Allah'a inanmaya ve yalnız Allah'a ibadet etmeye çağırdı.",
          "Hasbi gönüller Rasulullah'ın bu davetine kulak verip ona iman ediyorlar ve müslüman olanların sayısı her geçen gün artıyordu. Belli ki yeni bir dinin ve yeni bir dünya görüşünün temelleri atılıyordu.",
          "Bazı müşrikler kendi eski inanç ve ibadetlerine uymayan bu dine karşı tavır aldılar ve hatta Müslümanlara Mekkede hayat hakkı tanımak istemediler. Zayıf Müslümanlara işkence ediyor, hepsine akıl almaz sıkıntılar veriyorlardı.",
          "Bu bitmeyen işkenceler ve sıkıntılar sonucunda Müslümanlar Mekke'de, kendi öz yurtlarında yaşayamaz duruma gelmişler, büyük guruplar halinde önce Habeşistan'a ve sonra da Medine'ye hicret etmişlerdir. Aileler bölünmüştür. Ancak yaptıkları bunca zulüm bile Mekke kafirlerinin hırslarını tatmin etmemiştir.",
          "Halbuki Mekke'de Müslümanların istekleri gayet masum ve anlaşılır bir şeydi; 1. (Doğup büyüdükleri memleketlerinde) insanca yaşamak istiyorlardı. 2. Özgürce seçtikleri İslam dinini özgürce yaşamak istiyorlardı.",
          "Kur'an-ı Kerim, en olumsuz, en yanlış inanış ve davranışlardan bile evrensel doğrular çıkaran bir üsluba sahiptir. Hiçbir problemi çözümsüz bırakmaz. Bu Surede de, çeşitli inanç ve görüşteki insanların ve birbirlerine zarar vermeden beraberce yaşamaları teklifini getiriyor.",
          "Kafirun Suresi önce Allah Rasulünün putlara tapmama tavrını açıkça ifade ediyor. Bu tavır, en doğal bireysel haktır. Kur'an bu hakka vurgu yapıyor peygamber efendimize de bu hakkı kullandırıyor.",
          'Herkesin, "Ben sizin gibi düşünmüyorum, ben sizin inandığınız şeye inanmıyorum, ben sizin taptığınız şeylere tapmıyorum" deme hakkı vardır.',
          "Müslümanların ikinci talepleri de; Mekke'de herkes neye inanmak istiyorsa öyle yaşamak istiyorsa öyle yaşasın ve Mekke'de beraberce barış içinde yaşayalım. Kimse kimseye karışmasın, şeklindeydi.",
          "Bu makul, bu medeni teklif dünya var oldukça değerinden hiçbir şey kaybetmeyecek doğru bir tekliftir. Doğru bir duruştur.",
          "Yukarıdaki yazılış Kur'an-ı Kerimin pek çok yerinde gördüğümüz şekle daha uygundur. Buna göre şu kısa surenin içinde iki bölüm var. Her iki bölümde de bir ayeti iki ayet açıyor, tafsil ediyor.",
          'Sure mealinin sistematik olarak yazılışı: "1. De ki, Ey (benim dinime) inanmayanlar! 2. Ben sizin taptıklarınıza (tapmadım), tapmıyorum. 3. Siz de benim ibadet ettiğim Allah\'a ibadet etmiyorsunuz. 4. Ben sizin taptıklarınıza tapacak değilim. 5. Siz de benim ibadet ettiğim tek Allaha ibadet edici değilsiz. 6. Sizin dininiz size, benim dinim bana !"',
          {
            capsules: [
              {
                n: 1,
                text: "De ki, Ey (benim dinime) inanmayanlar!",
                color: ORANGE_THEME,
                bg: CAPSULE_BG_6_19,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
          {
            capsules: [
              {
                n: 2,
                text: "Ben sizin taptıklarınıza (tapmadım), tapmıyorum.",
                color: CENTER_GROUP_BORDER,
                bg: CENTER_GROUP_BG,
              },
              {
                n: 3,
                text: "Siz de benim ibadet ettiğim Allah'a ibadet etmiyorsunuz.",
                color: CENTER_GROUP_BORDER,
                bg: CENTER_GROUP_BG,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
          {
            capsules: [
              {
                n: 4,
                text: "Ben sizin taptıklarınıza tapacak değilim.",
                color: CENTER_GROUP_BORDER,
                bg: CENTER_GROUP_BG,
              },
              {
                n: 5,
                text: "Siz de benim ibadet ettiğim Allaha ibadet edici değilsiz.",
                color: CENTER_GROUP_BORDER,
                bg: CENTER_GROUP_BG,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
          {
            capsules: [
              {
                n: 6,
                text: "Sizin dininiz size, benim dinim bana !",
                color: ORANGE_THEME,
                bg: CAPSULE_BG_6_19,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
          "Surenin ana manasını sarı renkle gösterdiğimiz ayetler veriyor. Açık mavi ve açık yeşil renklerle gösterdiğimiz çift ayet Ayetler benzeşen (müteşabih) ayetlerdir. Açıklama ayetleridir. Ana ayetin gerekçesini açıklıyorlar.",
          'Evet surenin ana ayeti birinci ve altıncı ayetlerdir: "1. De ki, Ey (benim dinime) inanmayanlar!" → "6. Sizin dininiz size, benim dinim bana !"',
        ],
      },
    },
    byVerse: {
      // ── Verses 2-5: the twin tafsil (açıklama) ayet pairs ────────────────
      2: {
        kicker: "2-5. Ayetler",
        title: "Muhkem ve Müteşabih Ayetler",
        paragraphs: [
          "Dikkat edilirse bu iki ayet bulundukları yerde tek ayet olarak duruyorlar. Fakat baştaki tek ayet sondaki tek ayetle bütünleşip çift ayet gibi haline geliyorlar. Başka bir ifadeyle: tek ayetler muhkem ayetlerdir. Değişmez gerçeği söylerler. Aradaki çift ayetler ise müteşabih benzeşen ayetlerdir. Benzeşen ayetler daima çift ayetlerdir, biri diğerine benzer ve biri diğerini tamamlar.",
          "Bu ayetlerin muhatabı olan kafirler, Kur'ana ve Peygamber Efendimize inanmamakta kesin kararlı olan Peygamberimizle sürekli mücadele içinde ki Kureyşin ileri gelenleridir. Bunlar muannit kafirlerdir. Yoksa henüz iman etmemiş olan fakat düşmanlık içinde olmayan halkı değildir.",
          'Yukarıdaki ana ayetleri okuduktan sonra: Rabbim senin bu emrini daha iyi anlayabilmemiz için biraz daha açar mısın diye soruyoruz. Cenab-ı Hak bu mukadder soruya cevaben şu dört ayetle emrinin gerekçesini de lütfediyor. De ki: "2. Ey Kafirler, Ben sizin taptığınız şeylere tapmıyorum. 3. Siz de benim ibadet ettiğim tek Allah\'a ibadet etmiyorsunuz. 4. Ben sizin Allahtan başka taptıklarınıza da tapacak değilim 5. Siz de benim ibadet ettiğim tek Allaha ibadet edici değilsiniz.."',
          {
            capsules: [
              {
                n: 2,
                text: "Ey Kafirler, Ben sizin taptığınız şeylere tapmıyorum.",
                color: CENTER_GROUP_BORDER,
                bg: CENTER_GROUP_BG,
              },
              {
                n: 3,
                text: "Siz de benim ibadet ettiğim tek Allah'a ibadet etmiyorsunuz.",
                color: CENTER_GROUP_BORDER,
                bg: CENTER_GROUP_BG,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
          {
            capsules: [
              {
                n: 4,
                text: "Ben sizin Allahtan başka taptıklarınıza da tapacak değilim",
                color: CENTER_GROUP_BORDER,
                bg: CENTER_GROUP_BG,
              },
              {
                n: 5,
                text: "Siz de benim ibadet ettiğim tek Allaha ibadet edici değilsiniz..",
                color: CENTER_GROUP_BORDER,
                bg: CENTER_GROUP_BG,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
          "Bu ayetlerden son ayetten anlıyoruz ki kafirlerle, müşriklerle din ve inanç konusunda katiyen hiçbir uzlaşma ve anlaşma yok. Peygamber Efendimiz müşriklere; Ey müşrikler; dinlerimizi ve ibadetlerimizi birleştirelim, ben sizin taptıklarınıza da benim Allahıma ibadet edin demiyor. Aksine Peygamber Efendimiz Allahın emriyle: Ben sizin yanlış anlaşılacak tek teklifinize asla tapmayacağım, diyor. Kendi inancı ve ibadetinden hiçbir taviz vermiyor. Yalnızca; Mekke'de sizin benimle sürekli kavga halinde olmanıza hiçbir faydası yok, siz de zaten kendi yolunuza gidiyorsunuz, bırakın ben de yoluma gideyim diyor.",
          "Peygamber Efendimiz Sallahü aleyhi ve sellem, bütün cihana ulaştırılması gereken bir mesaj sahibidir. Mekke'de bir avuç kafirle kavga ederek vakit kaybetmek istemiyor. Onun mesajını bekleyen koca bir dünya var. Onun için Mekke'deki 'kavgacı kafirler' problemini, bir sulh anlaşmasıyla çözmek istiyor. Ancak zalim kafirlerin böyle bir barış anlaşmasına yanaşmaları karşısında Peygamber Efendimiz Medineye hicret etmek zorunda kalmış ve bu problemi ancak hicretle aşabilmiştir. Mekke'nin azılı kafirleri Efendimizi ve Müslümanları Mekke'de daima zorla bırakmamışlardır. Ama artık şartlar değişmiştir.",
          "Dikkat edilirse bu surede kafirlere, siz yanlış yoldasınız, siz batıl tanrılara tapıyorsunuz gibi bir suçlama ve tarizde bulunulmuyor. İnançlar değerlendirilmiyor. Bu surenin bu ince ifadeleri, başka din ve milletlerle görüşerek, tanışarak insanları Allahın dinine, tevhit dinine çağıracak olan müminlere, cedelleşmeden hizmet etme yolunu gösteriyor.",
          "İkinci ayet, üçüncü ayetin ikizi yani benzeşenidir. Anlamca benzeşen ayetler oldukları kolayca anlaşılıyor.",
          "4. ayetle 5. ayetin de anlamca hatta lafızca benzeşen ikili ayet oldukları gayet açık.",
          "Sonra da her iki ayet diğer iki ayetle benzeşen ikiz guruplar oluşturuyorlar.",
          '"Suredeki ayetler ikili olduğu gibi, "Benim taptığım Allah ve sizin taptığınız putlar", "Ben tapmıyorum ve siz tapmıyorsunuz", "benim dinim" ve "sizin dininiz" gibi her şey birbirine zıt simetrik ve ikili bir şekilde anlatılıyor.',
          "Katlanabilir simetrik Kur'an: Bu sureyi de tam ortasından, yukarıdan aşağıya sarı renkli ayetleri üst üste getirerek katlayınız. Ana manayı ifade eden ayetlerin ve geçmiş zamanla gelecek zamanın üst üste geldiğini göreceksiniz. Sonra bir de da sağdan sola katlayınız ve simetrik anlamların nasıl üst üste geldiğine bakınız. Bu durumun bütün Kur'an için geçerli olduğunu diğer sureleri incelerken de görüyoruz.",
          "Sonra bu sureyi biraz farklı bir ifadeyle açarak şöyle de yazabiliriz: \"1. De ki, Ey (benim dinime) inanmayan ve sürekli benimle mücadele edip duranlar! 2. (Görüyorsunuz ki ben bugüne kadar) sizin taptığınız putlara tapmadım, tapmıyorum. 3. Siz de benim ibadet ettiğim tek Allah'a ibadet etmediniz, etmiyorsunuz. 4. Madem ben bundan sonra da sizin taptıklarınıza tapmayacağım, 5. Ve madem siz de benim taptığım tek Allah'a tapmayacaksınız. 6. (O halde) Sizin dininiz size, benim dinim bana! Sizin putlara inandığınız ve taptığınız gibi, benim de inanma ve ibadet etme hakkım vardır. (Bırakalım herkes kendi iradesiyle seçimini yapsın ve dilediği yola gitsin. Gelin böyle, vicdanları özgür bırakan bir prensipte anlaşalım, huzur içinde bir arada yaşayalım.) Aramızdaki beşeri ilişkiler eskisi gibi devam etsin. Gerçekler zaman içinde daha iyi görülecektir. Aksine benim görevim Allah'ın emrini insanlara tebliğ etmek ve uyarmaktır, gerisi kendilerinin bilecekleri bir iştir. İster iman eder kendilerini kurtarırlar, ister müşrik olarak kalır kendilerini ebedi helakete atarlar.\"",
          {
            capsules: [
              {
                n: 1,
                text: "De ki, Ey (benim dinime) inanmayan ve sürekli benimle mücadele edip duranlar!",
                color: ORANGE_THEME,
                bg: CAPSULE_BG_6_19,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
          {
            capsules: [
              {
                n: 2,
                text: "(Görüyorsunuz ki ben bugüne kadar) sizin taptığınız putlara tapmadım, tapmıyorum.",
                color: CENTER_GROUP_BORDER,
                bg: CENTER_GROUP_BG,
              },
              {
                n: 3,
                text: "Siz de benim ibadet ettiğim tek Allah'a ibadet etmediniz, etmiyorsunuz.",
                color: CENTER_GROUP_BORDER,
                bg: CENTER_GROUP_BG,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
          {
            capsules: [
              {
                n: 4,
                text: "Madem ben bundan sonra da sizin taptıklarınıza tapmayacağım,",
                color: CENTER_GROUP_BORDER,
                bg: CENTER_GROUP_BG,
              },
              {
                n: 5,
                text: "Ve madem siz de benim taptığım tek Allah'a tapmayacaksınız.",
                color: CENTER_GROUP_BORDER,
                bg: CENTER_GROUP_BG,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
          {
            capsules: [
              {
                n: 6,
                text: "(O halde) Sizin dininiz size, benim dinim bana! Sizin putlara inandığınız ve taptığınız gibi, benim de inanma ve ibadet etme hakkım vardır. (Bırakalım herkes kendi hür iradesiyle seçimini yapsın ve dilediği yola gitsin! Gelin böyle, vicdanları özgür bırakan bir prensipte anlaşalım ve huzur içinde Mekke'de bir arada yaşayalım.) Aramızdaki beşeri ilişkiler eski gibi devam etsin. Gerçekler zaman içinde daha iyi görülecektir. Aksine benim görevim Allah'ın emrini insanlara tebliğ etmek ve uyarmaktır, gerisi kendilerinin bilecekleri bir iştir. İster iman eder kendilerini kurtarırlar, ister müşrik olarak kalır kendilerini ebedi helakete atarlar.",
                color: ORANGE_THEME,
                bg: CAPSULE_BG_6_19,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
          },
        ],
      },
      // ── Verse 6: "Sizin dininiz size, benim dinim bana!" — sonuç ilkeleri ─
      6: {
        kicker: "6. Ayet",
        title: "Sonuç: Birlikte Yaşama İlkeleri",
        paragraphs: [
          "Bir memlekette yaşayan farklı inanca, düşünceye veya dine mensup insanlardan bir gurup, güç kullanarak diğer gurubu kendi inanç ve görüşlerini kabule zorlamalı mı? Gücüne dayanarak farklı görüşleri yasaklamalı mı?",
          "Farklı düşünenleri hapsedip işkence mi etmeli?",
          "Veya yönetimden, ticaretten, sosyal hayattan tecrit mi etmeli?",
          "Veya onları toptan yok etmenin yollarını mı aramalı?",
          "Yahut onları şehir dışına, ülke dışına mı sürmeli?",
          "Buradaki sorular çoğaltılabilir. Geçmişte dünyanın pek çok yerinde bu şıkların hepsi ve hatta daha fazlası uygulanmış ve yaşanmış şeyler. İşte bunlar fazlasıyla Mekke'de de yaşandı.",
          "Kur'an diyor ki: Bunların hiçbiri olmamalı ! Çünkü bu yolların hepsi zulümdür. İnsan haklarına tecavüzdür.",
          "Yapılması gereken şudur: Beraberce barış içinde yaşanmalı ve farklı inançlarla beraber yaşama kültürü geliştirilmelidir. Toplumlar içinde farklı düşünce ve farklı inançlar her zaman olacaktır.",
          "Kimseye zarar vermedikçe farklılıkları hoş görmek, varlığını kabul etmek, hazmetmek hatta farklı düşünce ve inanca sahip olanların haklarını savunmak, gerekli bir olgunluktur.",
          "Farklılıkları dışlayan, sürekli bir sürtüşme ve kavga sebebi yapan toplumlar huzurlarını ve yıllarını kaybettikleri gibi çoğu zaman da kendileri için şans olan farklı değerleri kaybederler.",
          "Güce dayanarak kendi düşünce ve inancını herkese dayatmak, kabule zorlamak zulümdür. Farklı olanları yok etme hırsına kapılmak ise bir cinnettir. Sevinecek bir husustur ki Müslüman toplumlar hiçbir zaman böyle bir cinnete kapılmamışlardır.",
          "Kendi düşünce ve inancını, kendi güzelliklerini müspet bir şekilde ortaya koymak, yapıcı ıslahçı tavırlarla başkalarını da inancına davet etmek meşru bir yoldur.",
          "Barışçı üslupta ısrar etmek bir sabır işidir ve bir kahramanlıktır. Haksızlık yapanların haksızlık yaparak karşılık vermek meşruiyetini kaybetmektir.",
          "Bugün insanlık geçmişe göre olgunlaşma yolundadır. Hukuk gelişmiş, insan haklarına saygı önem kazanmış, hemen her yerde güvenlik sağlanmış, bilim ve teknoloji gelişmiş, insanlar özgürleşmiş ve zenginleşmiştir.",
          'İnsana baktığımız zaman onun ırkını, rengini veya inancını değil; kendisini yani "insanı" görmenin zemini ve şartları da hazır sayılır.',
          "Ayrıca bugün dünya küçülmüş, ülkeler arası mesafeler kısalmıştır. Ticaret sınır tanımıyor. Her ülkenin ürettiği şeyler başka milletler tarafından tüketiliyor. Ulaşım ve iletişim imkanları tasavvurların bile ötesine geçmiştir.",
          "Peygamber Efendimizin ve ilk Müslümanların hukuku olmadığı o zamanlarda karşılaştıkları pek çok zorluklar bugün bazı gelişmemiş ülkelerde devam etse de, gelişmiş ülkelerde büyük oranda ortadan kalkmıştır, kalkmaktadır.. Böylece Müslümanların, kendi seviyelerini yükselterek, insan kalitesini artırarak, evrensel değerleri bünyesinde taşıyan İslam dinini iyi bir temsille dünyaya tanıtmalarının önü açılmıştır.",
          "Ey Müslümanlar, Bir olan Allahın adını herkese duyurmak, Kur'anın mesajını her yere taşımak, her müslümanın görevidir. Bu görevi yaparken kesinlikle İslamın özünden taviz vermediğiniz gibi İslamın özünde var olmayan sertlikten, şiddetten de uzak durunuz. Hakkın vesilesi de hak olmalıdır. Sakın doğru yolda giderken batıl vesilelere tevessül etmeyiniz.",
          "Haklı davanızda haksız duruma düşmeyiniz.",
          "İslamın üslubu sevgi ve şefkat boyutludur. Bu ölçüyü kaybetmeden güzelliklerinizi insanlığa ulaştırınız.",
          "Ayrıca, inanç ve ibadet selametinizi bahane ederek kendinizi toplumdan soyutlamayınız. Bölünmüş alanlarda yaşama gayreti içinde olmayınız. Tam bunun aksine, iyi komşuluk ilişkileri içinde başkalarıyla beraber yaşamak görevinizdir.",
          "Bu makul teklif, dünya var oldukça değerinden hiçbir şey kaybetmeyecek doğru bir tekliftir. Doğru bir duruştur.",
          "Bütün insanlığı isteyen Kur'anın maksadı kavga olamaz. Kur'an, bir kaşık suda fırtına koparılmasına ve bu büyük davanın küçük bir coğrafyada, küçük insanlarla kavga ederek enerji tüketmesine, küçük meselelerde boğulmasına müsaade etmez.",
          "Müşrikler Peygamber Efendimizi kendi şehri olan Mekkede barındırmamış ve onu öldürmeye çalışmışlar ve sonunda Onu Medineye hicret etmeye mecbur bırakmışlardır. Ama Peygamber Efendimiz ne önce ne de Mekke' fethettikten sonra Mekkelileri Mekkeden sürüp çıkarma planları yapmamıştır ve çıkarmamıştır. Aksine onlara bütün beşeri haklarını vererek beraberce barış içinde yaşamanın şartlarını hazırlamış, yalnızca onları İslama davet etmiştir. İslamiyet hukukun, insan hak ve özgürlüklerinin ve bunun da ötesinde bir güzel ahlakın davacısıdır.",
        ],
      },
    },
  },

  heroTitle: "Kafirun",
  heroSubtitle: "Suresi",

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
    padding: 0.29,
    scrollPages: 1.5,
    fixedWidthAcrossLanguages: true,
  },

  specialVerses: {
    middleFoldVerses: { left: [3, 5], right: [2, 4] },
    versePairings: {
      2: 3,
      3: 2,
      4: 5,
      5: 4,
    },
  },

  verseOverrides: {
    1: {
      isPill: false,
      expandW: 0.2,
      expandH: 0.028,
      textScaleOverride: 0.9,
      translationTextScaleOverride: 0.6,
      bg: CAPSULE_BG_6_19,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: ORANGE_THEME,
      textColor: "#A30000",
    },
    2: {
      bg: CENTER_GROUP_BG,
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BORDER,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
    },
    3: {
      bg: CENTER_GROUP_BG,
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BORDER,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
    },
    4: {
      bg: CENTER_GROUP_BG,
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BORDER,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
    },
    5: {
      bg: CENTER_GROUP_BG,
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BORDER,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
    },
    6: {
      isPill: false,
      expandW: 0.2,
      expandH: 0.028,
      textScaleOverride: 0.9,
      translationTextScaleOverride: 0.6,
      bg: CAPSULE_BG_6_19,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: ORANGE_THEME,
      textColor: "#A30000",
    },
  },

  styling: {
    colors: {
      paperBase: "#FAF7F2",
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
      hollowConnectorInnerBg: "#FAF7F2",
      maroonTheme: OUTER_GROUP_BG,
      greenTheme: CENTER_GROUP_BORDER,
      s1InnerBorder: "#cccccc",
      s2IntroOutroBg: "#C4963B",
      s2Group1Bg: OUTER_GROUP_BG,
      s2Group2Bg: CENTER_GROUP_BORDER,
      s2Group3Bg: OUTER_GROUP_BG,
      curveColors: [
        {
          color: ORANGE_THEME,
          fillColor: CAPSULE_BG_6_19,
          bowGap: 0.25,
          innerBowGap: 0.24,
          tipThickness: 0.135,
          topAnchorXOffset: -0.01,
          topAnchorYOffset: -0.001,
          bottomAnchorYOffset: 0.001,
          bottomAnchorXOffset: -0.01,
        },
        { color: CENTER_GROUP_BORDER, fillColor: CENTER_GROUP_BG },
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
  globalSettings: {
    capsuleHeight: 0.075, // was smallBoxH2
    columnGap: 0.02, // was s2Gap (horizontal gap between the 2 columns)
    rowGap: 0.02, // was s2VerticalRowGap (defaults to s2Gap)
    blockGap: 0.06, // was groupGap (gap between the 3 blocks)
    sectionPadX: 0.028, // was s2PadLeftRight
    blockPadding: 0.012, // was groupPad / groupPadBottom
    sectionBorderWidth: 0.006, // was sgBorderWidth
  },

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
          text: "Kafirun Suresi",
        },
      ],
    },
  ],

  // Section-wide resting-state background — was incorrectly attached to
  // block0 alone, which also made it (wrongly) render as block0's own small
  // elevated/all-sections frame instead of the whole section's.
  sectionBackground: {
    texture: "/nisa/all-section-1.svg",
    scaleX: 1.1,
    scaleY: 1.4,
    offsetY: 0.03,
  },

  blocks: [
    // Block 0 — Verse 1 (full-width, yellow "Say" verse)
    {
      id: "section2", // reuse same id so elevation/drag section IDs are stable
      type: "group",
      verseIds: [1],
      columns: 1,
      // outerScale: -0.11 in legacy = the block was wider than the section inner width.
      // horizontalInset < 0 → pushed OUT (wider). 0.11 outward.
      horizontalInset: -0.11,
      isCenter: false,
      disablePopUp: true,
      cameraTarget: { y: 1.2, fov: 30, tilt: -1.2 },
    },
    // Block 1 — Verses 2–5 (2-column center group, pushed in)
    {
      id: "section2_g1",
      type: "group",
      verseIds: [3, 2, 5, 4], // display order: right,left (Arabic RTL)
      columns: 2,
      // g2Scale: 0.01 → pushed in by 0.01 on each side
      horizontalInset: 0.01,
      isCenter: true,
      dragBehavior: "group",
      hideRowConnectors: false,
    },
    // Block 2 — Verse 6 (full-width, yellow closing verse)
    {
      id: "section2_g2",
      type: "group",
      verseIds: [6],
      columns: 1,
      horizontalInset: -0.11,
      isCenter: false,
      disablePopUp: true,
    },
  ],

  animations: {
    computeFoldYPositions: (lm) => {
      // groupYPositions[i] = frameY (top edge) of block i.
      // groupHeights[i]    = frameH of block i.
      // Verse 1 (block 0) has expandH=0.028 → expands downward, shift fold1 down 0.01.
      const fold1 =
        (lm.groupYPositions[0] - lm.groupHeights[0] + lm.groupYPositions[1]) /
          2 -
        0.01;

      // fold2 sits inside block 1 — between the top row and the gap below it.
      const fold2 =
        lm.groupYPositions[1] -
        (lm as any).blockPadding -
        (lm as any).capsuleHeight -
        (lm as any).columnGap / 2;

      // Verse 6 (block 2) has expandH=0.028 → expands upward, shift fold3 up 0.01.
      const fold3 =
        (lm.groupYPositions[1] - lm.groupHeights[1] + lm.groupYPositions[2]) /
          2 +
        0.01;

      return [fold1, fold2, fold3];
    },

    foldSteps: [
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
};

// ── TEXT DATA (unchanged) ────────────────────────────────────────────────────

export const KAFIRUN_109_TEXT_AR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "سورة الكافرون",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        verses: [{ number: 1, text: "قُلْ يَا أَيُّهَا الْكَافِرُونَ" }],
      },
      {
        verses: [
          { number: 3, text: "وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ" },
          { number: 2, text: "لَا أَعْبُدُ مَا تَعْبُدُونَ" },
          { number: 5, text: "وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ" },
          { number: 4, text: "وَلَا أَنَا عَابِدٌ مَا عَبَدْتُمْ" },
        ],
      },
      {
        verses: [{ number: 6, text: "لَكُمْ دِينُكُمْ وَلِيَ دِينِ" }],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const KAFIRUN_109_TEXT_EN: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "Surah Al-Kafirun",
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
            text: "Say, O you who do not believe (in my religion)!",
          },
        ],
      },
      {
        verses: [
          {
            number: 2,
            text: "I (did not worship), do not worship what you worship",
          },
          { number: 3, text: "You also do not worship the Allah I worship" },
          { number: 4, text: "I am not going to worship what you worship" },
          {
            number: 5,
            text: "You also are not worshippers of the Allah I worship",
          },
        ],
      },
      {
        verses: [
          {
            number: 6,
            text: "Your religion is for you, my religion is for me !",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const KAFIRUN_109_TEXT_TR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "Kâfirûn Suresi",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        verses: [
          { number: 1, text: "De ki, Ey (benim dinime) inanmayanlar !" },
        ],
      },
      {
        verses: [
          {
            number: 2,
            text: "Ben sizin taptıklarınıza (tapmadım), tapmıyorum",
          },
          {
            number: 3,
            text: "Siz de benim ibadet ettiğim Allah'a ibadet etmiyorsunuz",
          },
          { number: 4, text: "Ben sizin taptıklarınıza tapacak değilim" },
          {
            number: 5,
            text: "Siz de benim ibadet ettiğim Allah'a ibadet edici değilsiz",
          },
        ],
      },
      {
        verses: [{ number: 6, text: "Sizin dininiz size, benim dinim bana !" }],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const KAFIRUN_109_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: KAFIRUN_109_TEXT_AR,
  en: KAFIRUN_109_TEXT_EN,
  tr: KAFIRUN_109_TEXT_TR,
};
