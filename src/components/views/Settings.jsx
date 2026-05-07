import React from 'react'
import { Moon, Sun, Info, Play, Bookmark, Share2 } from 'lucide-react'

const Settings = ({ 
    darkMode, setDarkMode, 
    arabicFont, setArabicFont, 
    fontSize, setFontSize, 
    latinFontSize, setLatinFontSize,
    selectedReader, setSelectedReader,
    readers,
    verseHighlight, setVerseHighlight,
    wordByWord, setWordByWord,
    showTranslation, setShowTranslation
}) => {
    return (
        <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-right-4 duration-700">            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-10">
                    {/* Appearance */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-parchment-200">
                        <div className="flex items-center gap-3 mb-8">
                            <Moon size={24} className="text-amber-700" />
                            <h3 className="text-2xl font-serif font-bold text-gray-900">Appearance</h3>
                        </div>
                        
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Theme Mode</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                            <button 
                                onClick={() => setDarkMode(false)}
                                className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                                    !darkMode ? 'border-amber-800 bg-amber-50/50 text-amber-900 dark:text-amber-200 font-bold' : 'border-parchment-100 hover:border-parchment-200 text-gray-500'
                                }`}
                            >
                                <Sun size={20} /> Light Parchment
                            </button>
                            <button 
                                onClick={() => setDarkMode(true)}
                                className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                                    darkMode ? 'border-amber-800 bg-amber-800/20 text-amber-900 dark:text-amber-200 font-bold' : 'border-parchment-100 hover:border-parchment-200 text-gray-500'
                                }`}
                            >
                                <Moon size={20} /> Deep Night
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">Arabic Calligraphy Style</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { id: 'font-amiri', name: 'Amiri Quran' },
                                        { id: 'font-scheherazade', name: 'Scheherazade' },
                                        { id: 'font-lateef', name: 'Lateef' },
                                        { id: 'font-noto', name: 'Noto Naskh' }
                    
                                    ].map(f => (
                                        <button 
                                            key={f.id}
                                            onClick={() => setArabicFont(f.id)}
                                            className={`px-4 py-2.5 rounded-xl border-2 text-sm font-serif transition-all ${
                                                arabicFont === f.id 
                                                ? 'border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 font-bold' 
                                                : 'border-parchment-100 dark:border-slate-800 text-gray-500 hover:border-parchment-200'
                                            }`}
                                        >
                                            {f.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Arabic Font Size</p>
                                    <span className="text-sm font-bold text-amber-800 dark:text-amber-200">{fontSize}px</span>
                                </div>
                                <input 
                                    type="range" min="20" max="60" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))}
                                    className="w-full h-2 sm:h-1.5 bg-parchment-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-800 dark:accent-amber-500"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Latin Font Size (Translation)</p>
                                    <span className="text-sm font-bold text-amber-800 dark:text-amber-200">{latinFontSize}px</span>
                                </div>
                                <input 
                                    type="range" min="12" max="30" value={latinFontSize} onChange={e => setLatinFontSize(parseInt(e.target.value))}
                                    className="w-full h-2 sm:h-1.5 bg-parchment-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-800 dark:accent-amber-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Reading Experience */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-parchment-200">
                        <div className="flex items-center gap-3 mb-8">
                            <Info size={24} className="text-emerald-700" />
                            <h3 className="text-2xl font-serif font-bold text-emerald-900">Reading Experience</h3>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Selected Qari (Reciter)</p>
                                <select 
                                    value={selectedReader} 
                                    onChange={(e) => setSelectedReader(e.target.value)}
                                    className="w-full bg-parchment-50 dark:bg-gray-800 border-2 border-parchment-100 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-serif font-bold outline-none focus:border-emerald-700 transition-colors cursor-pointer"
                                >
                                    {Object.entries(readers).map(([id, name]) => (
                                        <option key={id} value={id}>{name}</option>
                                    ))}
                                </select>
                            </div>
                            {[
                                { id: 'verseHighlight', label: 'Verse Highlight', desc: 'Subtle glow behind the active ayah', val: verseHighlight, set: setVerseHighlight },
                                { id: 'wordByWord', label: 'Word-by-Word Translation', desc: 'Show meaning under each Arabic word', val: wordByWord, set: setWordByWord },
                                { id: 'showTranslation', label: 'Show Translation', desc: 'Display meaning in Indonesian', val: showTranslation, set: setShowTranslation }
                            ].map(opt => (
                                <div key={opt.id} className="flex items-center justify-between group">
                                    <div>
                                        <p className="font-bold text-gray-800 group-hover:text-emerald-800 transition-colors">{opt.label}</p>
                                        <p className="text-xs text-gray-400 font-medium">{opt.desc}</p>
                                    </div>
                                    <button 
                                        onClick={() => opt.set(!opt.val)}
                                        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${opt.val ? 'bg-emerald-700' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${opt.val ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="space-y-8">
                    <div className="text-right">
                        <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-4">Live Preview</p>
                        <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-parchment-100 relative overflow-hidden group">
                            <div className="absolute top-4 left-4 bg-emerald-100 text-emerald-800 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">Sample View</div>
                            <div className="text-center mb-8">
                                <span className="text-[10px] bg-amber-50 text-amber-800 px-3 py-1 rounded-full font-bold">Surah Al-Fatiha</span>
                            </div>
                            <p className={`${arabicFont} text-center leading-[2] mb-8 text-gray-800`} style={{ fontSize: `${fontSize}px` }}>
                                اَلْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَۙ
                            </p>
                            <p className="font-serif italic text-center text-gray-700 leading-relaxed px-4" style={{ fontSize: `${latinFontSize}px` }}>
                                "All praise is due to Allah, the Lord of all the worlds."
                            </p>
                            <p className="text-center text-[10px] text-gray-400 font-bold mt-4 uppercase tracking-widest">[1:2]</p>
                            
                            <div className="mt-10 flex justify-center gap-4">
                                <button className="p-3 bg-parchment-50 rounded-xl text-emerald-800 hover:bg-emerald-100 transition-colors"><Play size={18} fill="currentColor" /></button>
                                <button className="p-3 bg-parchment-50 rounded-xl text-amber-700 hover:bg-amber-100 transition-colors"><Bookmark size={18} /></button>
                                <button className="p-3 bg-parchment-50 rounded-xl text-gray-400 hover:bg-parchment-100 transition-colors"><Share2 size={18} /></button>
                            </div>
                        </div>
                    </div>

                    <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-video group">
                        <img 
                            src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800" 
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            alt="Reading background"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                            <p className="text-white font-serif italic text-lg leading-relaxed">
                                Customize your focus, elevate your hifdz journey.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings
