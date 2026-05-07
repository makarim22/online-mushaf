import React from 'react'
import { ChevronLeft, ChevronRight, Info, Sparkles, Pause, Play } from 'lucide-react'
import AyahCard from '../ui/AyahCard'

const Mushaf = ({
    selectedSurat,
    handleSuratChange,
    toggleFullSurahPlayback,
    isPlayingFullSurah,
    ayatList,
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
    return (
        <div className="flex flex-col h-full bg-parchment-50 dark:bg-slate-950 transition-colors duration-500">
            <div className="px-4 sm:px-8 py-6 sm:py-8 border-b border-parchment-100 dark:border-slate-800/50 bg-white dark:bg-slate-950 sticky top-0 z-30 transition-colors duration-500">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                    <button 
                        onClick={() => handleSuratChange(selectedSurat.nomor - 1)}
                        disabled={selectedSurat?.nomor === 1}
                        className="hidden sm:flex p-3 rounded-2xl bg-parchment-100 dark:bg-slate-800 text-amber-800 dark:text-amber-200 hover:scale-105 transition-all disabled:opacity-0 shadow-sm"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="flex-1 text-center">
                        {/* Mobile Navigation Row */}
                        <div className="flex sm:hidden justify-between items-center mb-4">
                            <button 
                                onClick={() => handleSuratChange(selectedSurat.nomor - 1)}
                                disabled={selectedSurat?.nomor === 1}
                                className="p-2 rounded-xl bg-parchment-100 dark:bg-slate-800 text-amber-800 dark:text-amber-200 disabled:opacity-30"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-[10px] uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">Surah {selectedSurat?.nomor}</span>
                            <button 
                                onClick={() => handleSuratChange(selectedSurat.nomor + 1)}
                                disabled={selectedSurat?.nomor === 114}
                                className="p-2 rounded-xl bg-parchment-100 dark:bg-slate-800 text-amber-800 dark:text-amber-200 disabled:opacity-30"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <div className="space-y-1">
                            <p className="hidden sm:block text-[10px] uppercase tracking-[0.4em] text-amber-800 dark:text-amber-400 font-bold">Surah {selectedSurat?.nomor}</p>
                            <div className="flex items-center justify-center gap-3">
                                <h1 className="text-2xl sm:text-4xl font-serif font-bold text-gray-900 dark:text-white">{selectedSurat?.namaLatin}</h1>
                                
                                {/* Surah Description Tooltip */}
                                <div className="group relative inline-block align-middle mt-1">
                                    <Info size={18} className="text-amber-600 dark:text-amber-400 cursor-help opacity-40 hover:opacity-100 transition-opacity" />
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-4 w-[280px] sm:w-[450px] p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-parchment-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 text-left scale-95 group-hover:scale-100 origin-top">
                                        <h4 className="font-serif font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 border-b border-parchment-100 dark:border-slate-700 pb-2">
                                            <Sparkles size={16} className="text-amber-600" />
                                            Tentang Surah
                                        </h4>
                                        <div 
                                            className="text-sm leading-relaxed text-gray-600 dark:text-slate-100 font-serif max-h-80 overflow-y-auto pr-3 custom-scrollbar deskripsi-surah"
                                            dangerouslySetInnerHTML={{ __html: selectedSurat?.deskripsi }}
                                        />
                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white dark:border-b-slate-800"></div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-serif italic">{selectedSurat?.arti}</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => handleSuratChange(selectedSurat.nomor + 1)}
                        disabled={selectedSurat?.nomor === 114}
                        className="hidden sm:flex p-3 rounded-2xl bg-parchment-100 dark:bg-slate-800 text-amber-800 dark:text-amber-200 hover:scale-105 transition-all disabled:opacity-0 shadow-sm"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                <div className="flex justify-center mt-8">
                    <button 
                        onClick={toggleFullSurahPlayback}
                        className={`flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-xl hover:scale-105 active:scale-95 ${
                            isPlayingFullSurah 
                            ? 'bg-amber-100 text-amber-800 border-2 border-amber-200' 
                            : 'bg-emerald-900 text-white hover:bg-emerald-800 border-2 border-emerald-900'
                        }`}
                    >
                        {isPlayingFullSurah 
                            ? <Pause size={18} fill="currentColor" /> 
                            : <Play size={18} fill="currentColor" className="ml-1" />
                        }
                        <span className="tracking-wide">{isPlayingFullSurah ? 'Playing Surah...' : 'Play Full Surah'}</span>
                    </button>
                </div>

                {selectedSurat?.nomor !== 9 && (
                    <div className="font-arabic text-3xl sm:text-4xl text-gray-800 dark:text-parchment-50 mt-8 text-center select-none opacity-80">
                        ﷽
                    </div>
                )}
            </div>

            {/* Ayah List */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-32 pt-12">
                <div className="max-w-4xl mx-auto space-y-12">
                    {ayatList.map((ayat, idx) => (
                        <AyahCard 
                            key={idx}
                            ayat={ayat}
                            idx={idx}
                            selectedSurat={selectedSurat}
                            playingAyat={playingAyat}
                            verseHighlight={verseHighlight}
                            arabicFont={arabicFont}
                            fontSize={fontSize}
                            showTranslation={showTranslation}
                            latinFontSize={latinFontSize}
                            handleShowTafsir={handleShowTafsir}
                            toggleBookmark={toggleBookmark}
                            bookmarks={bookmarks}
                            handleShare={handleShare}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Mushaf
