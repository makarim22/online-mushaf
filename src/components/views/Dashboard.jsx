import React from 'react'
import { RotateCcw, BookOpen, ChevronRight, Sparkles } from 'lucide-react'

const Dashboard = ({ setActiveSection, handleSuratChange }) => {
    return (
        <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-parchment-200">
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Current Streak</p>
                    <h2 className="text-5xl font-serif font-bold text-amber-900">12 Days</h2>
                    <p className="text-emerald-700 text-xs mt-2 flex items-center gap-1 font-medium">
                        <RotateCcw size={12} /> Keep it up! 3 days to next reward.
                    </p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-parchment-200 flex justify-between items-center">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Total Hifdz</p>
                        <h2 className="text-5xl font-serif font-bold text-gray-900">14 Juz</h2>
                        <p className="text-gray-500 text-xs mt-2 font-medium">46.2% of the Quran</p>
                    </div>
                    <div className="relative w-20 h-20">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-parchment-100" />
                            <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={220} strokeDashoffset={220 * (1 - 0.46)} className="text-amber-500" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">46%</span>
                    </div>
                </div>
                <div className="bg-emerald-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-xs uppercase tracking-widest text-emerald-100/60 font-bold mb-2">Weekly Goal</p>
                        <h2 className="text-4xl font-serif font-bold mb-4">5 Pages to go</h2>
                        <div className="w-full bg-emerald-800/50 rounded-full h-2 mb-6">
                            <div className="bg-white h-full rounded-full w-2/3"></div>
                        </div>
                        <button 
                            onClick={() => setActiveSection('progress')}
                            className="text-sm font-bold flex items-center gap-2 hover:translate-x-1 transition-transform"
                        >
                            View Details <ChevronRight size={16} />
                        </button>
                    </div>
                    <BookOpen size={120} className="absolute -bottom-6 -right-6 text-emerald-800 opacity-20 transform -rotate-12" />
                </div>
            </div>

            {/* Middle Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-parchment-200">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-serif font-bold text-gray-900">Memorization Velocity</h3>
                        <select className="bg-parchment-100 text-xs font-bold px-3 py-1.5 rounded-lg outline-none border-none cursor-pointer">
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {[40, 60, 45, 80, 90, 30, 70].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                <div className="w-full bg-parchment-50 rounded-t-lg relative overflow-hidden h-full">
                                    <div 
                                        className="absolute bottom-0 left-0 w-full bg-emerald-800 rounded-t-lg transition-all duration-1000 group-hover:bg-emerald-700" 
                                        style={{ height: `${h}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Wk {i+1}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-parchment-200">
                    <h3 className="text-xl font-serif font-bold text-gray-900 mb-6">Recently Perfected</h3>
                    <div className="space-y-4">
                        {[
                            { num: 18, name: 'Al-Kahf', verses: '1 - 10', arab: 'الحمد لله الذي أنزل على عبده الكتاب...' },
                            { num: 67, name: 'Al-Mulk', verses: '1 - 5', arab: 'تبارك الذي bideh الملك...' },
                            { num: 36, name: 'Ya-Sin', verses: '1 - 12', arab: 'يس والقرآن' }
                        ].map((s, i) => (
                            <div key={i} 
                                onClick={() => handleSuratChange(s.num)}
                                className={`p-4 rounded-2xl border-l-4 flex gap-4 transition-all hover:bg-parchment-50 cursor-pointer ${
                                    i === 0 ? 'border-emerald-700 bg-emerald-50/30' : i === 1 ? 'border-amber-500 bg-amber-50/30' : 'border-emerald-700 bg-emerald-50/30'
                                }`}
                            >
                                <div className="bg-white w-10 h-10 rounded-lg shadow-sm flex items-center justify-center text-xs font-bold border border-parchment-200 flex-shrink-0">
                                    {s.num}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-sm text-gray-900">{s.name}</p>
                                    <p className="text-[10px] text-gray-500 font-medium mb-2">Verses {s.verses}</p>
                                    <p className="font-arabic text-emerald-900 text-sm truncate leading-relaxed">{s.arab}</p>
                                </div>
                            </div>
                        ))}
                        <button 
                            onClick={() => setActiveSection('mushaf')}
                            className="w-full py-3 mt-4 border-2 border-parchment-200 rounded-xl text-sm font-bold text-emerald-800 hover:bg-parchment-50 transition-colors"
                        >
                            View All Memorized Verses
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Quote */}
            <div className="bg-gray-900 rounded-3xl p-10 relative overflow-hidden group shadow-2xl">
                <img 
                    src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1200" 
                    className="absolute inset-0 w-full h-full object-cover opacity-30 transition-transform duration-1000 group-hover:scale-105"
                    alt="Mosque background"
                />
                <div className="relative z-10 text-center max-w-2xl mx-auto">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-bold mb-4 block">Scholarly Insight</span>
                    <h2 className="text-3xl sm:text-4xl font-serif italic text-white leading-relaxed mb-6">
                        "The best among you are those who learn the Qur'an and teach it."
                    </h2>
                    <p className="text-gray-400 text-sm font-medium">— Sahih al-Bukhari</p>
                </div>
                <div className="absolute top-6 right-6">
                    <div className="bg-emerald-600/50 text-white p-3 rounded-xl shadow-lg">
                        <Sparkles size={24} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
