import { useState, useRef, useEffect } from 'react'
import { 
    BookOpen, ChevronDown, ChevronLeft, ChevronRight, Bookmark, Copy, 
    Volume2, Pause, Play, Search, Settings, X, RotateCcw, Moon, Sun, 
    Sparkles, Loader2, BookMarked, Square, Home, BarChart2, User, Share2, Info, LogOut
} from 'lucide-react'

export default function QuranPage() {
    // Navigation State
    const [activeSection, setActiveSection] = useState('mushaf') // 'home', 'mushaf', 'progress', 'settings'

    // Data States
    const [suratList, setSuratList] = useState([])
    const [selectedSurat, setSelectedSurat] = useState(null)
    const [ayatList, setAyatList] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingAyat, setLoadingAyat] = useState(false)
    const [playingAyat, setPlayingAyat] = useState(null)
    const [selectedReader, setSelectedReader] = useState("01")
    const [bookmarks, setBookmarks] = useState([])
    const [copyFeedback, setCopyFeedback] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [isPlayingFullSurah, setIsPlayingFullSurah] = useState(false)
    const [audioProgress, setAudioProgress] = useState(0)
    const [currentRepeat, setCurrentRepeat] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    
    // UI Settings
    const [fontSize, setFontSize] = useState(28) // Number for slider
    const [latinFontSize, setLatinFontSize] = useState(18)
    const [darkMode, setDarkMode] = useState(false)
    const [arabicFont, setArabicFont] = useState('font-amiri')
    const [showTransliteration, setShowTransliteration] = useState(true)
    const [showTranslation, setShowTranslation] = useState(true)
    const [verseHighlight, setVerseHighlight] = useState(true)
    const [wordByWord, setWordByWord] = useState(false)
    const [isMuted, setIsMuted] = useState(false)

    // Tafsir States
    const [tafsirData, setTafsirData] = useState({})
    const [loadingTafsir, setLoadingTafsir] = useState(false)
    const [showTafsirModal, setShowTafsirModal] = useState(false)
    const [selectedTafsirAyat, setSelectedTafsirAyat] = useState(null)
    const [tafsirSuratCache, setTafsirSuratCache] = useState({})
    const [repeatCount, setRepeatCount] = useState(1) // 1, 3, 5, Infinity
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [playerPos, setPlayerPos] = useState({ x: window.innerWidth / 2 - 160, y: window.innerHeight - 100 })
    const [isDragging, setIsDragging] = useState(false)
    const dragOffset = useRef({ x: 0, y: 0 })

    const audioRef = useRef(null)
    const versesPerPage = 10

    const readers = {
        "01": "Abdullah Al-Juhany",
        "02": "Abdul Muhsin Al-Qasim",
        "03": "Abdurrahman as-Sudais",
        "04": "Ibrahim Al-Dossari",
        "05": "Misyari Rasyid Al-Afasi",
        "06": "Yasser Al-Dosari"
    }

    // Fetching Logic (Same as before)
    useEffect(() => {
        const fetchSurat = async () => {
            try {
                const response = await fetch("https://equran.id/api/v2/surat")
                const data = await response.json()
                setSuratList(data.data || [])
                const alFatihah = data.data?.find(s => s.nomor === 1)
                if (alFatihah) {
                    setSelectedSurat(alFatihah)
                    fetchAyat(alFatihah.nomor)
                }
            } catch (error) {
                console.error("Error fetching surat:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchSurat()
    }, [])

    const fetchAyat = async (suratNomor) => {
        setLoadingAyat(true)
        try {
            const response = await fetch(`https://equran.id/api/v2/surat/${suratNomor}`)
            const data = await response.json()
            setAyatList(data.data?.ayat || [])
            setCurrentPage(1)
        } catch (error) {
            console.error("Error fetching ayat:", error)
            setAyatList([])
        } finally {
            setLoadingAyat(false)
        }
    }

    const handleSuratChange = (suratNomor) => {
        const surat = suratList.find(s => s.nomor === suratNomor)
        if (surat) {
            setSelectedSurat(surat)
            fetchAyat(surat.nomor)
            setPlayingAyat(null)
            setIsPlayingFullSurah(false)
            if (audioRef.current) audioRef.current.pause()
        }
    }

    const playAyahAudio = (ayat, fullSurah = false) => {
        if (!ayat?.audio || !ayat.audio[selectedReader]) return
        const ayahKey = `${selectedSurat?.nomor}-${ayat.nomorAyat}`
        
        if (playingAyat === ayahKey && !fullSurah) {
            audioRef.current?.pause()
            setPlayingAyat(null)
            setIsPlayingFullSurah(false)
            return
        }

        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.onended = null
        }

        setPlayingAyat(ayahKey)
        if (fullSurah) setIsPlayingFullSurah(true)

        const audio = new Audio(ayat.audio[selectedReader])
        audioRef.current = audio
        audio.muted = isMuted
        audio.play()

        audio.onended = () => {
            // Handle Repeat Logic
            if (repeatCount > 1 && currentRepeat < repeatCount - 1) {
                setCurrentRepeat(prev => prev + 1)
                audio.currentTime = 0
                audio.play()
                return
            }

            // Reset repeat count for this verse
            setCurrentRepeat(0)

            // Handle Full Surah / Next Verse Logic
            if (fullSurah || isPlayingFullSurah) {
                const currentIndex = ayatList.findIndex(a => a.nomorAyat === ayat.nomorAyat)
                if (currentIndex < ayatList.length - 1) {
                    playAyahAudio(ayatList[currentIndex + 1], true)
                    // Scroll to next ayah
                    const nextAyah = ayatList[currentIndex + 1]
                    const element = document.getElementById(`ayah-${selectedSurat.nomor}-${nextAyah.nomorAyat}`)
                    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                } else {
                    setPlayingAyat(null)
                    setIsPlayingFullSurah(false)
                }
            } else if (repeatCount === 0) { // Loop current verse infinitely
                audio.currentTime = 0
                audio.play()
            } else {
                setPlayingAyat(null)
            }
        }
    }

    const toggleFullSurahPlayback = () => {
        if (isPlayingFullSurah) {
            audioRef.current?.pause()
            setIsPlayingFullSurah(false)
            setPlayingAyat(null)
        } else if (ayatList.length > 0) {
            playAyahAudio(ayatList[0], true)
        }
    }

    const toggleBookmark = (ayat) => {
        const key = `${selectedSurat?.nomor}-${ayat.nomorAyat}`
        setBookmarks(prev => prev.includes(key) ? prev.filter(b => b !== key) : [...prev, key])
    }

    // --- Tafsir Logic ---
    const fetchTafsir = async (suratNomor) => {
        if (tafsirSuratCache[suratNomor]) return tafsirSuratCache[suratNomor]
        setLoadingTafsir(true)
        try {
            const response = await fetch(`https://equran.id/api/v2/tafsir/${suratNomor}`)
            const data = await response.json()
            const indexed = {}
            data.data?.tafsir?.forEach(t => { indexed[t.ayat] = t.teks })
            setTafsirSuratCache(prev => ({ ...prev, [suratNomor]: indexed }))
            return indexed
        } catch (error) {
            console.error("Error fetching tafsir:", error)
            return {}
        } finally {
            setLoadingTafsir(false)
        }
    }

    const handleShowTafsir = async (ayat) => {
        setSelectedTafsirAyat(ayat)
        setShowTafsirModal(true)
        if (!tafsirSuratCache[selectedSurat?.nomor]) {
            await fetchTafsir(selectedSurat?.nomor)
        }
    }

    // --- Vector Search Logic ---
    const [showVectorSearch, setShowVectorSearch] = useState(false)
    const [vectorQuery, setVectorQuery] = useState("")
    const [vectorResults, setVectorResults] = useState([])
    const [isVectorSearching, setIsVectorSearching] = useState(false)

    const handleVectorSearch = async () => {
        if (!vectorQuery.trim()) return
        setIsVectorSearching(true)
        
        // Ensure query starts with "ayat tentang" for better API results if not already present
        let query = vectorQuery.trim()
        if (!query.toLowerCase().startsWith("ayat tentang")) {
            query = `ayat tentang ${query}`
        }

        try {
            const response = await fetch("https://equran.id/api/vector", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cari: query, batas: 5, tipe: ["ayat"], skorMin: 0.5 })
            })
            const data = await response.json()
            setVectorResults(data.hasil || data.data || [])
        } catch (error) {
            console.error("Vector search error:", error)
        } finally {
            setIsVectorSearching(false)
        }
    }

    const handleShare = (ayat) => {
        const text = `Quran [${selectedSurat.nomor}:${ayat.nomorAyat}] - ${selectedSurat.namaLatin}\n\n${ayat.teksArab}\n\n${ayat.teksIndonesia}\n\nRead more at: ${window.location.href}`
        navigator.clipboard.writeText(text)
        setCopyFeedback("Copied to clipboard!")
        setTimeout(() => setCopyFeedback(null), 2000)
    }


    const handleMouseDown = (e) => {
        setIsDragging(true)
        dragOffset.current = {
            x: e.clientX - playerPos.x,
            y: e.clientY - playerPos.y
        }
    }

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return
            setPlayerPos({
                x: e.clientX - dragOffset.current.x,
                y: e.clientY - dragOffset.current.y
            })
        }
        const handleMouseUp = () => setIsDragging(false)

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging])

    const SidebarItem = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => {
                setActiveSection(id)
                setIsSidebarOpen(false)
            }}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
                activeSection === id 
                ? 'bg-parchment-200 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 font-bold shadow-sm' 
                : 'text-gray-500 hover:bg-parchment-200/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-parchment-50'
            }`}
        >
            <Icon size={22} className={activeSection === id ? 'text-amber-800 dark:text-amber-200' : 'text-gray-400'} />
            <span className="text-lg font-serif">{label}</span>
        </button>
    )

    const DashboardView = () => (
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
                            { num: 67, name: 'Al-Mulk', verses: '1 - 5', arab: 'تبارك الذي بيده الملك...' },
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

    const MushafView = () => (
        <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-700">
            {/* Mushaf Header */}
            <div className="px-8 py-10 text-center relative">
                <div className="absolute left-8 top-1/2 -translate-y-1/2 flex gap-2">
                    <button 
                        onClick={() => handleSuratChange(selectedSurat.nomor - 1)}
                        disabled={selectedSurat?.nomor === 1}
                        className="p-3 rounded-full hover:bg-parchment-100 text-gray-400 hover:text-amber-800 transition-all disabled:opacity-0"
                    >
                        <ChevronLeft size={24} />
                    </button>
                </div>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex gap-2">
                    <button 
                        onClick={() => handleSuratChange(selectedSurat.nomor + 1)}
                        disabled={selectedSurat?.nomor === 114}
                        className="p-3 rounded-full hover:bg-parchment-100 text-gray-400 hover:text-amber-800 transition-all disabled:opacity-0"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                <p className="text-[10px] uppercase tracking-[0.4em] text-amber-800 font-bold mb-2">Surah {selectedSurat?.nomor}</p>
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{selectedSurat?.namaLatin}</h1>
                <p className="text-sm text-gray-500 font-serif italic mb-6">{selectedSurat?.arti}</p>
                <div className="flex justify-center mb-8">
                    <button 
                        onClick={toggleFullSurahPlayback}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${
                            isPlayingFullSurah 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                            : 'bg-emerald-900 text-white hover:bg-emerald-800'
                        }`}
                    >
                        {isPlayingFullSurah ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                        {isPlayingFullSurah ? 'Playing Surah...' : 'Play Full Surah'}
                    </button>
                </div>
                {selectedSurat?.nomor !== 9 && (
                    <div className="font-arabic text-4xl text-gray-800 dark:text-parchment-50 mb-8 select-none">
                        ﷽
                    </div>
                )}
                <div className="h-px w-32 bg-amber-200 mx-auto opacity-50"></div>
            </div>

            {/* Ayah List */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-32">
                <div className="max-w-4xl mx-auto space-y-12">
                    {ayatList.map((ayat, idx) => {
                        const isPlaying = playingAyat === `${selectedSurat?.nomor}-${ayat.nomorAyat}`
                        return (
                            <div 
                                key={idx} 
                                id={`ayah-${selectedSurat?.nomor}-${ayat.nomorAyat}`}
                                className={`group relative transition-all duration-500 p-8 rounded-3xl ${
                                    isPlaying && verseHighlight 
                                    ? 'bg-emerald-50/50 dark:bg-emerald-900/20 shadow-sm border border-emerald-100 dark:border-emerald-800/50 ring-1 ring-emerald-50 dark:ring-emerald-900/30' 
                                    : 'hover:bg-parchment-50 dark:hover:bg-gray-800/20'
                                }`}
                            >
                                <div className="flex justify-between items-start gap-8 mb-8">
                                    <div className="w-10 h-10 rounded-full border-2 border-emerald-500/10 dark:border-emerald-500/20 flex items-center justify-center font-bold text-xs text-emerald-800 dark:text-emerald-400 flex-shrink-0 shadow-inner">
                                        {ayat.nomorAyat}
                                    </div>
                                    <div className="flex-1 text-right">
                                        <p 
                                            className={`${arabicFont} text-right leading-[2.5] tracking-wide text-gray-800 dark:text-parchment-50 transition-all duration-300`}
                                            style={{ fontSize: `${fontSize}px` }}
                                        >
                                            {ayat.teksArab}
                                        </p>
                                    </div>
                                </div>

                                {showTranslation && (
                                    <div className="border-l-2 border-amber-200/30 pl-6">
                                        <p 
                                            className="font-serif italic text-gray-700 dark:text-gray-300 leading-relaxed"
                                            style={{ fontSize: `${latinFontSize}px` }}
                                        >
                                            {ayat.teksIndonesia}
                                        </p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold mt-2 tracking-widest uppercase">
                                            [{selectedSurat?.nomor}:{ayat.nomorAyat}]
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons (Visible on hover or if playing) */}
                                <div className={`absolute right-4 top-8 flex gap-2 transition-all duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    <button onClick={() => handleShowTafsir(ayat)} className="p-2 rounded-lg hover:bg-white text-gray-400 hover:text-emerald-700 transition-colors" title="Tafsir">
                                        <BookMarked size={18} />
                                    </button>
                                    <button onClick={() => toggleBookmark(ayat)} className={`p-2 rounded-lg transition-colors ${bookmarks.includes(`${selectedSurat?.nomor}-${ayat.nomorAyat}`) ? 'bg-amber-100 text-amber-600' : 'hover:bg-white text-gray-400'}`}>
                                        <Bookmark size={18} fill={bookmarks.includes(`${selectedSurat?.nomor}-${ayat.nomorAyat}`) ? 'currentColor' : 'none'} />
                                    </button>
                                    <button onClick={() => handleShare(ayat)} className="p-2 rounded-lg hover:bg-white text-gray-400 hover:text-blue-600 transition-colors" title="Share">
                                        <Share2 size={18} />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Floating Audio Bar */}
            <div 
                className="fixed z-[100] w-full max-w-sm px-4 select-none"
                style={{ 
                    left: `${playerPos.x}px`, 
                    top: `${playerPos.y}px`, 
                    transition: isDragging ? 'none' : 'all 0.1s ease-out'
                }}
            >
                <div className="bg-gray-900/95 text-white rounded-2xl shadow-2xl p-4 flex flex-col border border-white/10 backdrop-blur-xl">
                    {/* Drag Handle */}
                    <div 
                        onMouseDown={handleMouseDown}
                        className="w-full flex justify-center pb-2 cursor-grab active:cursor-grabbing group mb-2"
                    >
                        <div className="w-12 h-1.5 bg-white/10 group-hover:bg-amber-500/50 rounded-full transition-colors" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <button className="p-2 text-gray-400 hover:text-white transition-colors" onClick={() => handleSuratChange(selectedSurat.nomor - 1)} disabled={selectedSurat.nomor === 1}><ChevronLeft size={20} /></button>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setRepeatCount(prev => prev === 1 ? 3 : prev === 3 ? 5 : prev === 5 ? 0 : 1)} 
                                className={`p-2 transition-colors flex flex-col items-center gap-0.5 ${repeatCount > 1 || repeatCount === 0 ? 'text-amber-500' : 'text-gray-400 hover:text-white'}`}
                            >
                                <RotateCcw size={18} />
                                <span className="text-[8px] font-bold">{repeatCount === 0 ? 'Loop' : `${repeatCount}x`}</span>
                            </button>
                            <button 
                                onClick={toggleFullSurahPlayback}
                                className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center hover:bg-amber-500 transition-all shadow-lg active:scale-90"
                            >
                                {isPlayingFullSurah ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                            </button>
                            <button className="p-2 text-gray-400 hover:text-white transition-colors" onClick={() => handleSuratChange(selectedSurat.nomor + 1)} disabled={selectedSurat.nomor === 114}><ChevronRight size={20} /></button>
                        </div>
                        <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                            <button onClick={() => setActiveSection('progress')} className="p-2 text-gray-400 hover:text-white transition-colors"><BarChart2 size={18} /></button>
                            <button onClick={() => setActiveSection('settings')} className="p-2 text-gray-400 hover:text-white transition-colors"><Settings size={18} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const SettingsView = () => (
        <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-right-4 duration-700">
            <h1 className="text-4xl font-serif font-bold text-amber-900 mb-10 italic">Settings</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-10">
                    {/* Appearance */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-parchment-200">
                        <div className="flex items-center gap-3 mb-8">
                            <Moon size={24} className="text-amber-700" />
                            <h3 className="text-2xl font-serif font-bold text-gray-900">Appearance</h3>
                        </div>
                        
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Theme Mode</p>
                        <div className="grid grid-cols-2 gap-4 mb-10">
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
                                <div className="grid grid-cols-2 gap-3">
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
                                    className="w-full h-1.5 bg-parchment-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-800 dark:accent-amber-500"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Latin Font Size (Translation)</p>
                                    <span className="text-sm font-bold text-amber-800 dark:text-amber-200">{latinFontSize}px</span>
                                </div>
                                <input 
                                    type="range" min="12" max="30" value={latinFontSize} onChange={e => setLatinFontSize(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-parchment-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-800 dark:accent-amber-500"
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

    if (loading) {
        return (
            <div className="h-screen bg-parchment-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="text-amber-800 mx-auto animate-spin mb-4" />
                    <p className="font-serif font-bold text-amber-900 tracking-widest">Initializing Mushaf...</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`flex h-screen overflow-hidden transition-colors duration-500 ${darkMode ? 'dark bg-slate-950 text-parchment-50' : 'bg-parchment-50 text-gray-900'}`}>
            {/* Sidebar Overlay (Mobile) */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:static inset-y-0 left-0 w-64 bg-parchment-100 dark:bg-slate-900 border-r border-parchment-200 dark:border-slate-800 flex flex-col flex-shrink-0 z-[70] transition-all duration-500 
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-serif font-bold text-amber-900 dark:text-amber-200 italic">Mushaf Digital</h1>
                    </div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 font-bold italic">API by equran.id</p>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <SidebarItem id="home" icon={Home} label="Home" />
                    <SidebarItem id="mushaf" icon={BookOpen} label="Mushaf" />
                    <SidebarItem id="progress" icon={BarChart2} label="Hifdz Progress" />
                    <SidebarItem id="settings" icon={Settings} label="Settings" />
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Search Header */}
                <header className={`h-20 border-b flex items-center justify-between px-4 sm:px-8 z-40 transition-colors duration-500 shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-parchment-200'}`}>
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 mr-2 text-gray-400 hover:text-amber-800 dark:hover:text-white lg:hidden transition-colors"
                    >
                        <Home size={24} />
                    </button>
                    <div className="flex-1 max-w-xl">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-800 transition-colors" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search ayahs, surahs, or meaning..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className={`w-full border-none rounded-xl py-2.5 pl-12 pr-4 text-sm font-serif outline-none ring-1 transition-all ${
                                        darkMode 
                                        ? 'bg-slate-950 text-white ring-slate-800 placeholder:text-slate-500' 
                                        : 'bg-parchment-100/50 text-gray-900 ring-parchment-200 placeholder:text-gray-400'
                                    }`}
                                />
                            
                            {searchQuery && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-parchment-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="max-h-96 overflow-y-auto p-2">
                                        {suratList
                                            .filter(s => {
                                                const query = searchQuery.toLowerCase()
                                                if (query.includes(':')) {
                                                    const [sNum] = query.split(':')
                                                    return s.nomor.toString() === sNum
                                                }
                                                return s.namaLatin.toLowerCase().includes(query) || s.nomor.toString() === query
                                            })
                                            .map(surah => {
                                                const query = searchQuery.toLowerCase()
                                                let targetAyah = null
                                                if (query.includes(':')) {
                                                    const [, aNum] = query.split(':')
                                                    if (aNum) targetAyah = parseInt(aNum)
                                                }

                                                return (
                                                    <button 
                                                        key={surah.nomor}
                                                        onClick={() => {
                                                            handleSuratChange(surah.nomor)
                                                            setSearchQuery("")
                                                            setActiveSection('mushaf')
                                                            // Logic to scroll to ayah if targetAyah exists could be added here or in a useEffect
                                                            if (targetAyah) {
                                                                setTimeout(() => {
                                                                    const element = document.getElementById(`ayah-${surah.nomor}-${targetAyah}`)
                                                                    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                                                }, 800) // Delay to wait for fetchAyat
                                                            }
                                                        }}
                                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-parchment-50 dark:hover:bg-gray-800/50 transition-colors text-left group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="w-8 h-8 rounded-lg bg-parchment-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-amber-800 dark:text-amber-200 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50">{surah.nomor}</span>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900 dark:text-parchment-50">
                                                                    {surah.namaLatin} {targetAyah ? `: ${targetAyah}` : ''}
                                                                </p>
                                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-serif italic">{surah.arti}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="font-arabic text-xl text-emerald-900 dark:text-emerald-400 block">{surah.nama}</span>
                                                            {targetAyah && <span className="text-[9px] text-amber-700 dark:text-amber-500 font-bold uppercase tracking-widest">Jump to Ayah</span>}
                                                        </div>
                                                    </button>
                                                )
                                            })
                                        }
                                        {suratList.filter(s => s.namaLatin.toLowerCase().includes(searchQuery.toLowerCase()) || s.nomor.toString() === searchQuery).length === 0 && (
                                            <div className="p-4 text-center text-gray-400 text-xs font-serif">No surahs found for "{searchQuery}"</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setShowVectorSearch(true)}
                            className="p-2.5 text-gray-400 dark:text-white hover:text-amber-800 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all" 
                            title="Semantic Search"
                        >
                            <Sparkles size={20} className="dark:text-white" />
                        </button>
                        <button onClick={() => setActiveSection('settings')} className="hidden sm:block p-2.5 text-gray-400 dark:text-white hover:text-amber-800 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all">
                            <Settings size={20} className="dark:text-white" />
                        </button>
                        <button 
                            onClick={() => setActiveSection('settings')}
                            className="w-8 h-8 rounded-xl bg-emerald-400 flex items-center justify-center text-emerald-900 shadow-sm border border-emerald-500/20 cursor-pointer hover:bg-emerald-300 transition-colors"
                        >
                            <User size={16} />
                        </button>
                    </div>
                </header>

                {/* View Content */}
                <main className="flex-1 overflow-y-auto">
                    {activeSection === 'home' && <DashboardView />}
                    {activeSection === 'mushaf' && <MushafView />}
                    {activeSection === 'settings' && <SettingsView />}
                    {activeSection === 'progress' && (
                        <div className="p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <h1 className="text-4xl font-serif font-bold text-amber-900 mb-10 italic">Hifdz Progress</h1>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-parchment-200">
                                    <h3 className="text-xl font-serif font-bold text-gray-900 mb-6">Memorization Summary</h3>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 dark:text-gray-400 font-serif">Total Ayahs Perfected</span>
                                            <span className="font-bold text-emerald-700 dark:text-emerald-400">1,240 Ayahs</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 dark:text-gray-400 font-serif">Revision Accuracy</span>
                                            <span className="font-bold text-amber-600 dark:text-amber-400">94.2%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 dark:text-gray-400 font-serif">Active Hifdz Streak</span>
                                            <span className="font-bold text-gray-900 dark:text-white">12 Days</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl">
                                    <h3 className="text-xl font-serif font-bold mb-6 text-emerald-100">Milestones</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 bg-emerald-800/40 p-4 rounded-2xl border border-emerald-700/50">
                                            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white"><Sparkles size={20} /></div>
                                            <div>
                                                <p className="text-sm font-bold">1/3 of Quran Completed</p>
                                                <p className="text-[10px] text-emerald-200 uppercase tracking-widest">Achieved 2 weeks ago</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 opacity-50 p-4 rounded-2xl border border-emerald-700/20">
                                            <div className="w-10 h-10 rounded-xl bg-gray-600 flex items-center justify-center text-white"><BookOpen size={20} /></div>
                                            <div>
                                                <p className="text-sm font-bold">Half of Quran Goal</p>
                                                <p className="text-[10px] text-emerald-200 uppercase tracking-widest">Est. 3 months remaining</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                {/* Modals */}
                {showTafsirModal && selectedTafsirAyat && (
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
                )}

                {showVectorSearch && (
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
                                                <p className="font-arabic text-xl text-right leading-loose mb-4 text-gray-800 dark:text-parchment-50">
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
                )}
            </div>
        </div>
    )
}

function PlusIcon({ size }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5v14"/></svg>
}
