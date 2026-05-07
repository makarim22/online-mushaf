import React from 'react'
import { Sparkles, X, Loader2, Search, ChevronRight } from 'lucide-react'

const SemanticSearchModal = ({
    showVectorSearch,
    setShowVectorSearch,
    vectorQuery,
    setVectorQuery,
    handleVectorSearch,
    isVectorSearching,
    vectorResults,
    handleSuratChange
}) => {
    if (!showVectorSearch) return null

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 border border-parchment-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-parchment-100 dark:border-slate-800 flex items-center justify-between bg-parchment-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <Sparkles className="text-amber-600" size={24} />
                        <h3 className="font-serif font-bold text-gray-900 dark:text-parchment-50 text-xl">Semantic Search</h3>
                    </div>
                    <button onClick={() => setShowVectorSearch(false)} className="p-2 hover:bg-parchment-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-gray-400">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 border-b border-parchment-100 dark:border-slate-800">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={vectorQuery}
                            onChange={e => setVectorQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleVectorSearch()}
                            placeholder="Coba: 'ayat tentang sabar' atau 'ayat tentang shalat'..." 
                            className="flex-1 bg-parchment-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-serif outline-none ring-1 ring-parchment-200 dark:ring-slate-700 focus:ring-2 focus:ring-amber-600/30 transition-all"
                        />
                        <button 
                            onClick={handleVectorSearch}
                            disabled={isVectorSearching || !vectorQuery.trim()}
                            className="bg-amber-800 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-amber-700 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                            {isVectorSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                            Search
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {isVectorSearching ? (
                        <div className="text-center py-20">
                            <Loader2 size={48} className="mx-auto mb-4 animate-spin text-amber-600" />
                            <p className="font-serif text-gray-500">Mapping semantic connections...</p>
                        </div>
                    ) : vectorResults.length === 0 ? (
                        <div className="text-center py-20 text-gray-400 font-serif italic">
                            {vectorQuery ? 'No relevant ayahs found. Try a broader topic.' : 'Enter a topic above to explore the Quran semantically.'}
                        </div>
                    ) : (
                        vectorResults.map((result, idx) => {
                            const d = result.data || result
                            return (
                                <div key={idx} className="p-6 rounded-2xl bg-parchment-50 dark:bg-gray-800/50 border border-parchment-100 dark:border-gray-700 hover:border-amber-500/50 transition-all cursor-pointer group" onClick={() => {
                                    handleSuratChange(d.id_surat || d.suratNomor)
                                    setShowVectorSearch(false)
                                }}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">
                                                {d.nama_surat || d.namaLatin} : {d.nomor_ayat || d.nomorAyat}
                                            </p>
                                            <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase mt-1 inline-block">
                                                Relevance: {(result.skor * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-amber-800 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <p className="font-arabic text-xl text-right leading-loose mb-4 text-gray-800 dark:text-slate-100">
                                        {d.teks_arab || d.teksArab}
                                    </p>
                                    <p className="font-serif text-xs text-gray-600 dark:text-gray-400 leading-relaxed text-justify italic">
                                        {d.terjemahan_id || d.teksIndonesia}
                                    </p>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}

export default SemanticSearchModal
