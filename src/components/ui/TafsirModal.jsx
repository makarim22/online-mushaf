import React from 'react'
import { BookMarked, X, Loader2 } from 'lucide-react'

const TafsirModal = ({ 
    showTafsirModal, 
    setShowTafsirModal, 
    selectedTafsirAyat, 
    selectedSurat, 
    loadingTafsir, 
    tafsirSuratCache,
    arabicFont
}) => {
    if (!showTafsirModal || !selectedTafsirAyat) return null

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 border border-parchment-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-parchment-100 dark:border-slate-800 flex items-center justify-between bg-parchment-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <BookMarked className="text-emerald-700" size={24} />
                        <h3 className="font-serif font-bold text-gray-900 dark:text-parchment-50 text-xl">Tafsir Ayat</h3>
                    </div>
                    <button onClick={() => setShowTafsirModal(false)} className="p-2 hover:bg-parchment-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-gray-400">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="p-6 rounded-2xl bg-parchment-50 dark:bg-slate-800/50 border border-parchment-100 dark:border-slate-700">
                        <p className="text-[10px] uppercase tracking-widest text-emerald-800 dark:text-emerald-400 font-bold mb-4">
                            {selectedSurat?.namaLatin} — Ayat {selectedTafsirAyat.nomorAyat}
                        </p>
                        <p className={`${arabicFont} text-3xl text-right leading-loose text-gray-800 dark:text-white`}>
                            {selectedTafsirAyat.teksArab}
                        </p>
                    </div>
                    {loadingTafsir ? (
                        <div className="text-center py-10">
                            <Loader2 size={32} className="mx-auto mb-4 animate-spin text-emerald-700" />
                            <p className="font-serif text-gray-500">Retrieving tafsir...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Tafsir Kemenag</p>
                            <p className="font-serif text-gray-700 dark:text-gray-300 leading-relaxed text-justify whitespace-pre-line">
                                {tafsirSuratCache[selectedSurat?.nomor]?.[selectedTafsirAyat.nomorAyat] || 'Tafsir tidak tersedia untuk ayat ini.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TafsirModal
