import React from 'react'
import { Bookmark, Trash2, ExternalLink, BookOpen } from 'lucide-react'

const SavedVerses = ({ bookmarks, toggleBookmark, handleSuratChange, setActiveSection }) => {
    if (bookmarks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-parchment-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-amber-800 dark:text-amber-500 mb-6">
                    <Bookmark size={40} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">No Saved Verses</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 font-serif">
                    Your saved verses will appear here. Click the bookmark icon while reading the Mushaf to save an Ayah for later.
                </p>
                <button 
                    onClick={() => setActiveSection('mushaf')}
                    className="px-6 py-3 bg-emerald-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-800 transition-all shadow-lg"
                >
                    <BookOpen size={20} />
                    Open Mushaf Reader
                </button>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-amber-900 dark:text-amber-100 italic">Saved Verses</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-serif mt-1">You have {bookmarks.length} bookmarked {bookmarks.length === 1 ? 'ayah' : 'ayahs'}</p>
                </div>
            </div>

            <div className="space-y-6 pb-20">
                {bookmarks.map((bookmark) => (
                    <div 
                        key={bookmark.key}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-parchment-200 dark:border-slate-800 group hover:shadow-md transition-all duration-300"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest">
                                    {bookmark.surahName}
                                </div>
                                <span className="text-xs text-gray-400 font-serif font-bold">Ayah {bookmark.ayatNomor}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => {
                                        handleSuratChange(bookmark.surahNomor)
                                        setActiveSection('mushaf')
                                        setTimeout(() => {
                                            const element = document.getElementById(`ayah-${bookmark.surahNomor}-${bookmark.ayatNomor}`)
                                            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                        }, 800)
                                    }}
                                    className="p-2 text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                                    title="Open in Mushaf"
                                >
                                    <ExternalLink size={18} />
                                </button>
                                <button 
                                    onClick={() => toggleBookmark(bookmark)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                    title="Remove Bookmark"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <p className="font-arabic text-right text-2xl sm:text-3xl leading-[2] text-gray-800 dark:text-parchment-50">
                                {bookmark.teksArab}
                            </p>
                            <div className="border-l-2 border-amber-200/30 pl-6">
                                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base font-serif italic leading-relaxed">
                                    "{bookmark.teksIndonesia}"
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SavedVerses
