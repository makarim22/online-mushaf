import React from 'react'
import { Sparkles, BookOpen, Target, Award, Calendar, ChevronRight } from 'lucide-react'

const MyProgress = ({ userStats, bookmarks, setActiveSection }) => {
    return (
        <div className="p-4 sm:p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-10">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-amber-900 dark:text-amber-100 italic mb-2">My Hifdz Journey</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-serif">Tracking your spiritual growth and memorization progress.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Stats Card */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-parchment-200 dark:border-slate-800">
                    <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                        <Target className="text-emerald-600" size={24} />
                        Performance Metrics
                    </h3>
                    
                    <div className="space-y-6">
                        <div className="flex justify-between items-end pb-4 border-b border-parchment-100 dark:border-slate-800">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Total Reading Sessions</p>
                                <span className="text-2xl font-serif font-bold text-gray-900 dark:text-white">{userStats.totalVersesRead}</span>
                            </div>
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">ACTIVE</span>
                        </div>
                        
                        <div className="flex justify-between items-end pb-4 border-b border-parchment-100 dark:border-slate-800">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Saved Ayahs</p>
                                <span className="text-2xl font-serif font-bold text-gray-900 dark:text-white">{bookmarks.length}</span>
                            </div>
                            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">BOOKMARKED</span>
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Current Streak</p>
                                <span className="text-2xl font-serif font-bold text-gray-900 dark:text-white">{userStats.streak} Days</span>
                            </div>
                            <Calendar className="text-gray-300 dark:text-slate-700" size={24} />
                        </div>
                    </div>
                </div>

                {/* Milestone Card */}
                <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-xl font-serif font-bold mb-8 flex items-center gap-3 text-emerald-100">
                            <Award className="text-amber-400" size={24} />
                            Active Milestones
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="bg-emerald-800/40 p-4 rounded-2xl border border-emerald-700/50 hover:bg-emerald-800/60 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-sm font-bold">First 100 Verses</p>
                                    <span className="text-[10px] font-bold px-2 py-1 bg-white/10 rounded-lg">{Math.min(userStats.totalVersesRead, 100)}/100</span>
                                </div>
                                <div className="w-full bg-emerald-950/50 rounded-full h-1.5">
                                    <div className="bg-amber-400 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((userStats.totalVersesRead / 100) * 100, 100)}%` }}></div>
                                </div>
                            </div>

                            <div className="bg-emerald-800/40 p-4 rounded-2xl border border-emerald-700/50 hover:bg-emerald-800/60 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-sm font-bold">Bookmark Collector</p>
                                    <span className="text-[10px] font-bold px-2 py-1 bg-white/10 rounded-lg">{Math.min(bookmarks.length, 50)}/50</span>
                                </div>
                                <div className="w-full bg-emerald-950/50 rounded-full h-1.5">
                                    <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((bookmarks.length / 50) * 100, 100)}%` }}></div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-10 pt-6 border-t border-emerald-800 flex justify-between items-center">
                            <p className="text-[10px] uppercase tracking-widest text-emerald-300 font-bold">Next Rank: Qari Apprentice</p>
                            <Sparkles className="text-amber-400 animate-pulse" size={18} />
                        </div>
                    </div>
                    <Award size={160} className="absolute -bottom-10 -right-10 text-emerald-800 opacity-20 transform -rotate-12 transition-transform group-hover:scale-110 duration-1000" />
                </div>
            </div>

            {/* Recently Read Section */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-parchment-200 dark:border-slate-800 mb-12">
                <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-8">Reading Log</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userStats.recentlyRead.length > 0 ? (
                        userStats.recentlyRead.map((log, i) => (
                            <div key={i} className="bg-parchment-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-parchment-100 dark:border-slate-700 flex flex-col gap-4 group">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-lg">SURAH {log.surahNomor}</span>
                                    <span className="text-[10px] text-gray-400 font-medium">{new Date(log.timestamp).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white mb-1">{log.surahName}</p>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-serif">Last read at Ayah {log.lastAyah}</p>
                                </div>
                                <button 
                                    onClick={() => setActiveSection('mushaf')}
                                    className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    Continue Reading <ChevronRight size={14} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center">
                            <BookOpen className="mx-auto text-gray-200 dark:text-slate-800 mb-4" size={48} />
                            <p className="text-gray-500 dark:text-gray-400 font-serif italic">Your reading history will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MyProgress
