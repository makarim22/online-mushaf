import React, { useState, useEffect } from 'react'
import { BookOpen, RefreshCw, Loader2, AlertCircle, Quote } from 'lucide-react'

const HadithSunnah = () => {
    const [hadithData, setHadithData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchRandomHadith = async () => {
        setLoading(true)
        setError(null)
        setHadithData(null)

        try {
            const response = await fetch("/api/sunnah/v1/hadiths/random", {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            })

            if (!response.ok) {
                throw new Error("Failed to fetch hadith. Please try again later.")
            }

            const data = await response.json()
            setHadithData(data)
        } catch (err) {
            console.error("Error fetching hadith:", err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRandomHadith()
    }, [])

    const renderHadithContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={48} className="text-amber-800 dark:text-amber-400 animate-spin mb-4" />
                    <p className="font-serif text-amber-900 dark:text-amber-100 animate-pulse">Seeking knowledge...</p>
                </div>
            )
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <AlertCircle size={48} className="text-red-500 mb-4" />
                    <p className="text-red-600 dark:text-red-400 font-medium mb-4">{error}</p>
                    <button 
                        onClick={fetchRandomHadith}
                        className="px-6 py-2 bg-amber-800 text-white rounded-xl hover:bg-amber-900 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )
        }

        if (!hadithData || !hadithData.hadith) return null

        const englishHadith = hadithData.hadith.find(h => h.lang === 'en')
        const arabicHadith = hadithData.hadith.find(h => h.lang === 'ar')

        // Clean up HTML tags from the body if any exist, although we might want to render them dangerously.
        // The API returns <p> tags, so we'll use dangerouslySetInnerHTML.

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Meta Information */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800/80 p-4 rounded-2xl shadow-sm border border-parchment-200 dark:border-slate-700">
                    <div>
                        <h2 className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Collection</h2>
                        <p className="text-lg font-serif text-amber-900 dark:text-amber-100 capitalize">
                            {hadithData.collection.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                    </div>
                    {(englishHadith?.chapterTitle || arabicHadith?.chapterTitle) && (
                        <div className="text-right">
                            <h2 className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Chapter</h2>
                            <p className="text-md font-serif text-gray-800 dark:text-gray-200">
                                {englishHadith?.chapterTitle || arabicHadith?.chapterTitle}
                            </p>
                        </div>
                    )}
                </div>

                {/* Hadith Content Card */}
                <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-lg border border-parchment-200 dark:border-slate-700 relative overflow-hidden">
                    {/* Decorative Quote Icon */}
                    <div className="absolute top-4 right-4 text-parchment-100 dark:text-slate-700/50">
                        <Quote size={120} />
                    </div>

                    <div className="relative z-10 space-y-10">
                        {/* Arabic Text */}
                        {arabicHadith && (
                            <div className="text-right">
                                <div 
                                    className="font-arabic text-3xl leading-[2.5] text-emerald-950 dark:text-emerald-100"
                                    dangerouslySetInnerHTML={{ __html: arabicHadith.body }}
                                />
                            </div>
                        )}

                        {/* Divider */}
                        {arabicHadith && englishHadith && (
                            <div className="h-px bg-gradient-to-r from-transparent via-parchment-300 dark:via-slate-600 to-transparent"></div>
                        )}

                        {/* English Text */}
                        {englishHadith && (
                            <div className="text-left">
                                <div 
                                    className="font-serif text-xl leading-relaxed text-gray-800 dark:text-gray-200"
                                    dangerouslySetInnerHTML={{ __html: englishHadith.body }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Meta */}
                <div className="flex justify-between items-center px-4 text-sm text-gray-500 dark:text-slate-400">
                    <p>Book: <span className="font-medium text-gray-700 dark:text-gray-300">{hadithData.bookNumber}</span></p>
                    <p>Hadith Number: <span className="font-medium text-gray-700 dark:text-gray-300">{hadithData.hadithNumber}</span></p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col p-4 sm:p-8 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-3">
                        <BookOpen size={32} className="text-emerald-800 dark:text-emerald-400" />
                        Hadith & Sunnah
                    </h1>
                    <p className="text-gray-600 dark:text-slate-400 font-serif">Discover the sayings and teachings of the Prophet ﷺ</p>
                </div>
                <button 
                    onClick={fetchRandomHadith}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-400 rounded-xl shadow-sm border border-parchment-200 dark:border-slate-700 hover:bg-parchment-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    <span className="hidden sm:inline font-medium">New Random Hadith</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-24">
                {renderHadithContent()}
            </div>
        </div>
    )
}

export default HadithSunnah
