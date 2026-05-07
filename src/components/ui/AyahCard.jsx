import React from 'react'
import { BookMarked, Bookmark, Share2 } from 'lucide-react'

const AyahCard = ({
    ayat,
    idx,
    selectedSurat,
    playingAyat,
    verseHighlight,
    arabicFont,
    fontSize,
    showTranslation,
    latinFontSize,
    handleShowTafsir,
    toggleBookmark,
    bookmarks,
    handleShare
}) => {
    const isPlaying = playingAyat === `${selectedSurat?.nomor}-${ayat.nomorAyat}`

    return (
        <div 
            id={`ayah-${selectedSurat?.nomor}-${ayat.nomorAyat}`}
            className={`group relative transition-all duration-500 p-8 rounded-3xl ${
                isPlaying && verseHighlight 
                ? 'bg-emerald-50/50 dark:bg-emerald-900/20 shadow-sm border border-emerald-100 dark:border-emerald-800/50 ring-1 ring-emerald-50 dark:ring-emerald-900/30' 
                : 'hover:bg-parchment-50 dark:hover:bg-gray-800/20'
            }`}
        >
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-8 mb-6 sm:mb-8">
                <div className="w-10 h-10 rounded-full border-2 border-emerald-500/10 dark:border-emerald-500/20 flex items-center justify-center font-bold text-xs text-emerald-800 dark:text-emerald-400 flex-shrink-0 shadow-inner">
                    {ayat.nomorAyat}
                </div>
                <div className="flex-1 text-right w-full">
                    <p 
                        className={`${arabicFont} text-right leading-[2.5] tracking-wide text-gray-800 dark:text-slate-100 transition-all duration-300`}
                        style={{ fontSize: `${fontSize}px` }}
                    >
                        {ayat.teksArab}
                    </p>
                </div>
            </div>

            {showTranslation && (
                <div className="border-l-2 border-amber-200/30 pl-6">
                    <p 
                        className="font-serif italic text-gray-700 dark:text-white leading-relaxed"
                        style={{ fontSize: `${latinFontSize}px` }}
                    >
                        {ayat.teksIndonesia}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold mt-2 tracking-widest uppercase">
                        [{selectedSurat?.nomor}:{ayat.nomorAyat}]
                    </p>
                </div>
            )}

            {/* Action Buttons */}
            <div className={`flex justify-end gap-3 mt-6 pt-4 border-t border-parchment-100 dark:border-slate-800 transition-all duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button onClick={() => handleShowTafsir(ayat)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all text-xs font-bold" title="Tafsir">
                    <BookMarked size={18} />
                    <span className="sm:hidden">Tafsir</span>
                </button>
                <button onClick={() => toggleBookmark(ayat)} className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-xs font-bold ${bookmarks.find(b => b.key === `${selectedSurat?.nomor}-${ayat.nomorAyat}`) ? 'bg-amber-100 text-amber-600' : 'hover:bg-white dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400'}`}>
                    <Bookmark size={18} fill={bookmarks.find(b => b.key === `${selectedSurat?.nomor}-${ayat.nomorAyat}`) ? 'currentColor' : 'none'} />
                    <span className="sm:hidden">Bookmark</span>
                </button>
                <button onClick={() => handleShare(ayat)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-xs font-bold" title="Share">
                    <Share2 size={18} />
                    <span className="sm:hidden">Share</span>
                </button>
            </div>
        </div>
    )
}

export default AyahCard
