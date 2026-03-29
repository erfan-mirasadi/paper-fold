const quranData = {
  bismillah: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
  section1: {
    title: "Beş ayetlik Ana Böl.",
    verses: [
      { id: 1, text: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ" },
      { id: 2, text: "خَلَقَ الْإِنْسَانَ مِنْ عَلَقٍ" },
      { id: 3, text: "اقْرَأْ وَرَبُّكَ الْأَكْرَمُ" },
      { id: 4, text: "الَّذِي عَلَّمَ بِالْقَلَمِ" },
    ],
    anaAyet: { id: 5, text: "عَلَّمَ الْإِنْسَانَ مَا لَمْ يَعْلَمْ" },
  },
  section2: {
    title: "Beş ayetlik 1. Açıklama Böl.",
    mainVerse: { id: 6, text: "كَلَّا إِنَّ الْإِنْسَانَ لَيَطْغَى" },
    groups: [
      {
        colorBg: "bg-[#a37a8e]", // Purple
        verses: [
          { id: 7, text: "أَنْ رَأَهُ اسْتَغْنَى" },
          { id: 8, text: "إِنَّ إِلَى رَبِّكَ الرُّجْعَى" },
          { id: 9, text: "أَرَأَيْتَ الَّذِي يَنْهَى" },
          { id: 10, text: "عَبْدًا إِذَا صَلَّى" },
        ],
      },
      {
        colorBg: "bg-[#a0b28f]", // Green
        verses: [
          { id: 11, text: "أَرَأَيْتَ إِنْ كَانَ عَلَى الْهُدَى" },
          { id: 12, text: "أَوْ أَمَرَ بِالتَّقْوَى" },
          { id: 13, text: "أَرَأَيْتَ إِنْ كَذَّبَ وَتَوَلَّى" },
          { id: 14, text: "أَلَمْ يَعْلَمْ بِأَنَّ اللَّهَ يَرَى" },
        ],
      },
      {
        colorBg: "bg-[#a16a82]", // Darker Purple
        verses: [
          {
            id: 15,
            text: "كَلَّا لَئِنْ لَمْ يَنْتَهِ لَنَسْفَعًا بِالنَّاصِيَةِ",
          },
          { id: 16, text: "نَاصِيَةٍ كَاذِبَةٍ خَاطِئَةٍ" },
          { id: 17, text: "فَلْيَدْعُ نَادِيَهُ" },
          { id: 18, text: "أَوْ أَمَرَ بِالتَّقْوَى" },
        ],
      },
    ],
    footerVerse: { id: 19, text: "كَلَّا لَا تُطِعْهُ وَاسْجُدْ وَاقْتَرِبْ" },
  },
};

// Export the UI component
export const PaperUI = ({
  section1Ref,
  section2Ref,
  section3Ref,
}: {
  section1Ref?: React.RefObject<HTMLDivElement | null>;
  section2Ref?: React.RefObject<HTMLDivElement | null>;
  section3Ref?: React.RefObject<HTMLDivElement | null>;
}) => {
  return (
    <div className="w-[800px] font-serif relative" dir="rtl" style={{ perspective: "2500px", transformStyle: "preserve-3d" }}>
      {/* 
        TOP 1/3
        Anchor section. Stays flat against the wall. 
      */}
      <div 
        ref={section1Ref} 
        className="p-8 pb-8 w-full border-b border-dashed border-[#d6cec0] bg-[#fdfbf0] shadow-sm relative z-30" 
        style={{ minHeight: "400px", transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
      >
        <div className="text-center text-3xl mb-6">{quranData.bismillah}</div>
        <div className="relative bg-[#fce4b4] rounded-2xl p-6 shadow-md mb-4 border border-[#ebd099]">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 py-1 text-xs border border-gray-300 rounded shadow-sm text-gray-600">
            {quranData.section1.title}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4 mt-2">
            {quranData.section1.verses.map((v) => (
              <div key={v.id} className="bg-[#fdf5d3] border border-[#e8d29b] rounded-lg p-3 flex items-center justify-between shadow-sm">
                <span className="text-xl">{v.text}</span>
                <span className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center text-sm">{v.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 
          MIDDLE 1/3
          Attached to the bottom of Top 1/3 logically via CSS absolute positioning.
          This forms the first kinematic hinge.
        */}
        <div 
          ref={section2Ref} 
          className="p-8 w-full border-b border-dashed border-[#d6cec0] bg-[#fdfbf0] shadow-md border-t border-t-[#ebe2cc]" 
          style={{ 
            minHeight: "400px", 
            position: "absolute", 
            top: "100%", 
            left: 0, 
            transformOrigin: "top",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            zIndex: 20
          }}
        >
          <div className="relative bg-[#d8b05e] rounded-xl p-4 shadow-lg border border-[#c29c4f] flex items-center justify-between mb-8">
            <div className="absolute -left-16 top-1/2 -translate-y-1/2 bg-[#bc7648] text-white px-2 py-1 text-xs rounded border border-white shadow">
              Ana Ayet
            </div>
            <span className="text-3xl font-bold">{quranData.section1.anaAyet.text}</span>
            <span className="w-6 h-6 rounded-full border border-gray-800 flex items-center justify-center text-sm">{quranData.section1.anaAyet.id}</span>
          </div>

          <div className="relative bg-[#f4ecdf] rounded-t-3xl p-6 shadow-lg border border-[#d6cec0]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 py-1 text-xs border border-gray-300 rounded shadow-sm text-gray-600">
              {quranData.section2.title}
            </div>
            <div className="bg-[#fefdf4] border border-[#d4cfc2] rounded-xl p-4 mb-4 text-center mt-2 shadow-sm flex items-center justify-between">
              <span className="text-3xl font-bold w-full">{quranData.section2.mainVerse.text}</span>
              <span className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center text-sm">{quranData.section2.mainVerse.id}</span>
            </div>
            <div className="text-center text-gray-500 text-sm mt-4">... continued ...</div>
          </div>

          {/* 
            BOTTOM 1/3
            Attached to the bottom of Middle 1/3.
            Forms the second kinematic hinge perfectly synced in 3D space!
          */}
          <div 
            ref={section3Ref} 
            className="p-8 w-full bg-[#fdfbf0] shadow-lg border-t border-t-[#ebe2cc] rounded-b-xl" 
            style={{ 
              minHeight: "600px", 
              position: "absolute", 
              top: "100%", 
              left: 0, 
              transformOrigin: "top",
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
              zIndex: 10
            }}
          >
            <div className="relative bg-[#f4ecdf] rounded-b-3xl p-6 shadow-lg border-x border-b border-[#d6cec0] -mt-8 pt-12">
              <div className="space-y-4">
                {quranData.section2.groups.map((group, i) => (
                  <div key={i} className={`${group.colorBg} rounded-xl p-4 grid grid-cols-2 gap-3 shadow-inner`}>
                    {group.verses.map((v) => (
                      <div key={v.id} className="bg-[#fcfaf5] bg-opacity-90 rounded-lg p-2 flex items-center justify-between">
                        <span className="text-lg">{v.text}</span>
                        <span className="w-5 h-5 rounded-full border border-gray-500 flex items-center justify-center text-xs">{v.id}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="bg-[#fefdf4] border border-[#d4cfc2] rounded-xl p-4 mt-4 text-center shadow-sm flex items-center justify-between">
                <span className="text-3xl font-bold w-full">{quranData.section2.footerVerse.text}</span>
                <span className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center text-sm">{quranData.section2.footerVerse.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
