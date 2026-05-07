import { useState, useRef, useEffect } from 'react'
import { 
    BookOpen, ChevronDown, ChevronLeft, ChevronRight, Bookmark, Copy, 
    Volume2, Pause, Play, Search, Settings as SettingsIcon, X, RotateCcw, Moon, Sun, 
    Sparkles, Loader2, BookMarked, Square, Home, BarChart2, User, Share2, Info, LogOut, CheckCircle
} from 'lucide-react'

// Modular Components
import Dashboard from './components/views/Dashboard'
import Settings from './components/views/Settings'
import Mushaf from './components/views/Mushaf'
import Sidebar from './components/layout/Sidebar'
import FloatingPlayer from './components/audio/FloatingPlayer'
import TafsirModal from './components/ui/TafsirModal'
import SemanticSearchModal from './components/ui/SemanticSearchModal'
import SavedVerses from './components/views/SavedVerses'

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
    const [playerPos, setPlayerPos] = useState({ x: 20, y: window.innerHeight - 160 })
    const [isMushafExpanded, setIsMushafExpanded] = useState(true)
    const [isDragging, setIsDragging] = useState(false)
    const dragOffset = useRef({ x: 0, y: 0 })

    const audioRef = useRef(null)
    const isPlayingFullSurahRef = useRef(false)
    const repeatCountRef = useRef(1)

    useEffect(() => {
        isPlayingFullSurahRef.current = isPlayingFullSurah
    }, [isPlayingFullSurah])

    useEffect(() => {
        repeatCountRef.current = repeatCount
    }, [repeatCount])
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
            
            // Update selectedSurat with full data (including deskripsi)
            if (data.data) {
                const { ayat, ...surahInfo } = data.data
                setSelectedSurat(prev => ({ ...prev, ...surahInfo }))
            }
            
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
        
        // Handle Resume/Pause toggle for the same verse
        if (playingAyat === ayahKey) {
            if (audioRef.current) {
                if (audioRef.current.paused) {
                    audioRef.current.play()
                    if (fullSurah) setIsPlayingFullSurah(true)
                    return
                } else if (!fullSurah) {
                    // Only pause if NOT trying to trigger full surah (which might just be a resume)
                    audioRef.current.pause()
                    setIsPlayingFullSurah(false)
                    setPlayingAyat(null)
                    return
                }
            }
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
            // Use refs to get latest state without closure issues
            const currentRepeatCount = repeatCountRef.current
            const isFullSurahActive = isPlayingFullSurahRef.current

            // Handle Repeat Logic
            if (currentRepeatCount > 1 && currentRepeat < currentRepeatCount - 1) {
                setCurrentRepeat(prev => prev + 1)
                audio.currentTime = 0
                audio.play()
                return
            }

            // Reset repeat count for this verse
            setCurrentRepeat(0)

            // Handle Full Surah / Next Verse Logic
            if (fullSurah || isFullSurahActive) {
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
            } else if (currentRepeatCount === 0) { // Loop current verse infinitely
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
        } else {
            // If we have a paused audio and we're on the same surah, resume it
            if (audioRef.current && playingAyat) {
                audioRef.current.play()
                setIsPlayingFullSurah(true)
            } else if (ayatList.length > 0) {
                playAyahAudio(ayatList[0], true)
            }
        }
    }

    const toggleBookmark = (ayat) => {
        // If ayat is a bookmark object (from SavedVerses), it has 'key' property
        // If it's a raw ayat object (from AyahCard), we construct the key
        const key = ayat.key || `${selectedSurat?.nomor}-${ayat.nomorAyat}`
        
        setBookmarks(prev => {
            const exists = prev.find(b => b.key === key)
            if (exists) {
                return prev.filter(b => b.key !== key)
            } else {
                // Only allow adding if we have the full context
                if (ayat.key) return prev // Should not happen
                
                const bookmarkData = {
                    key,
                    surahNomor: selectedSurat.nomor,
                    surahName: selectedSurat.namaLatin,
                    ayatNomor: ayat.nomorAyat,
                    teksArab: ayat.teksArab,
                    teksIndonesia: ayat.teksIndonesia
                }
                return [...prev, bookmarkData]
            }
        })
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

    // Component logic moved to modular files

     if (loading) {
        return (
            <div className="h-screen bg-parchment-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="text-amber-800 mx-auto animate-spin mb-4" />
                    <p className="font-serif font-bold text-amber-900 dark:text-amber-100 tracking-widest">Initializing Mushaf...</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`min-h-screen flex font-sans transition-colors duration-500 ${darkMode ? 'dark bg-slate-900' : 'bg-parchment-50'}`}>
            <Sidebar 
                isSidebarOpen={isSidebarOpen} 
                setIsSidebarOpen={setIsSidebarOpen} 
                activeSection={activeSection} 
                setActiveSection={setActiveSection}
                setShowVectorSearch={setShowVectorSearch}
            />

            <div className="flex-1 flex flex-col overflow-hidden relative transition-all duration-500">
                <header className="px-4 sm:px-8 py-4 sm:py-6 border-b border-parchment-100 dark:border-slate-800/50 bg-white dark:bg-slate-950 sticky top-0 z-40 transition-colors duration-500 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 max-w-2xl">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-parchment-100 dark:border-slate-700 text-amber-800 dark:text-amber-400 hover:bg-parchment-50 dark:hover:bg-slate-700 transition-all"
                        >
                            <ChevronRight size={20} className={isSidebarOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                        </button>
                        
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search surah"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white dark:bg-slate-800 border-2 border-parchment-100 dark:border-slate-700 rounded-2xl py-2.5 pl-12 pr-4 outline-none focus:border-amber-500/50 transition-all text-sm shadow-sm dark:text-white"
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
                                                            if (targetAyah) {
                                                                setTimeout(() => {
                                                                    const element = document.getElementById(`ayah-${surah.nomor}-${targetAyah}`)
                                                                    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                                                }, 800)
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
                                                            {targetAyah && <span className="text-[9px] text-amber-700 dark:text-amber-50 font-bold uppercase tracking-widest">Jump to Ayah</span>}
                                                        </div>
                                                    </button>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setShowVectorSearch(true)} className="p-2.5 text-gray-400 dark:text-white hover:text-amber-800 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all" title="Semantic Search">
                            <Sparkles size={20} />
                        </button>
                        <button onClick={() => setActiveSection('settings')} className="p-2.5 text-gray-400 dark:text-white hover:text-amber-800 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all">
                            <SettingsIcon size={20} className="dark:text-white" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    {activeSection === 'home' && <Dashboard setActiveSection={setActiveSection} handleSuratChange={handleSuratChange} />}
                    {activeSection === 'mushaf' && (
                        <Mushaf 
                            selectedSurat={selectedSurat}
                            handleSuratChange={handleSuratChange}
                            toggleFullSurahPlayback={toggleFullSurahPlayback}
                            isPlayingFullSurah={isPlayingFullSurah}
                            ayatList={ayatList}
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
                    )}
                    {activeSection === 'settings' && (
                        <Settings 
                            darkMode={darkMode} setDarkMode={setDarkMode}
                            arabicFont={arabicFont} setArabicFont={setArabicFont}
                            fontSize={fontSize} setFontSize={setFontSize}
                            latinFontSize={latinFontSize} setLatinFontSize={setLatinFontSize}
                            selectedReader={selectedReader} setSelectedReader={setSelectedReader}
                            readers={readers}
                            verseHighlight={verseHighlight} setVerseHighlight={setVerseHighlight}
                            wordByWord={wordByWord} setWordByWord={setWordByWord}
                            showTranslation={showTranslation} setShowTranslation={setShowTranslation}
                        />
                    )}
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
                    {activeSection === 'bookmarks' && (
                        <SavedVerses 
                            bookmarks={bookmarks}
                            toggleBookmark={toggleBookmark}
                            handleSuratChange={handleSuratChange}
                            setActiveSection={setActiveSection}
                        />
                    )}
                </main>

                <FloatingPlayer 
                    isDragging={isDragging}
                    playerPos={playerPos}
                    handleMouseDown={handleMouseDown}
                    handleSuratChange={handleSuratChange}
                    selectedSurat={selectedSurat}
                    repeatCount={repeatCount}
                    setRepeatCount={setRepeatCount}
                    isPlayingFullSurah={isPlayingFullSurah}
                    toggleFullSurahPlayback={toggleFullSurahPlayback}
                    playingAyat={playingAyat}
                    setActiveSection={setActiveSection}
                />

                <TafsirModal 
                    showTafsirModal={showTafsirModal}
                    setShowTafsirModal={setShowTafsirModal}
                    selectedTafsirAyat={selectedTafsirAyat}
                    selectedSurat={selectedSurat}
                    loadingTafsir={loadingTafsir}
                    tafsirSuratCache={tafsirSuratCache}
                    arabicFont={arabicFont}
                />

                <SemanticSearchModal 
                    showVectorSearch={showVectorSearch}
                    setShowVectorSearch={setShowVectorSearch}
                    vectorQuery={vectorQuery}
                    setVectorQuery={setVectorQuery}
                    handleVectorSearch={handleVectorSearch}
                    isVectorSearching={isVectorSearching}
                    vectorResults={vectorResults}
                    handleSuratChange={handleSuratChange}
                />

                {/* Toast Notification */}
                {copyFeedback && (
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-emerald-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-700">
                            <CheckCircle size={18} className="text-emerald-400" />
                            <span className="text-sm font-bold tracking-wide">{copyFeedback}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
