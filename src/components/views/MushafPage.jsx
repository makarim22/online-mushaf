import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause, Bookmark, Share2, Eye, EyeOff, Loader2, BookOpen, Volume2, Brain } from 'lucide-react'

// Static mapping of Juz starting page numbers (Madani Mushaf standard)
const JUZ_START_PAGES = [
    1, 22, 42, 62, 82, 102, 121, 142, 162, 182,
    201, 222, 242, 262, 282, 302, 322, 342, 362, 382,
    402, 422, 442, 462, 482, 502, 522, 542, 562, 582
]

const readerPaths = {
    "01": "Abdullah-Al-Juhany",
    "02": "Abdul-Muhsin-Al-Qasim",
    "03": "Abdurrahman-as-Sudais",
    "04": "Ibrahim-Al-Dossari",
    "05": "Misyari-Rasyid-Al-Afasi",
    "06": "Yasser-Al-Dosari"
}

const MushafPage = ({
    selectedReader,
    darkMode,
    arabicFont,
    bookmarks,
    toggleBookmark,
    handleShare,
    suratList,
    fontSize,
    userStats,
    setUserStats,
    updateReadActivity
}) => {
    const [pageNumber, setPageNumber] = useState(userStats?.lastReadPage || 1)
    const [loading, setLoading] = useState(true)
    const [layoutData, setLayoutData] = useState(null)
    const [verses, setVerses] = useState([])
    const [chapters, setChapters] = useState([])
    const [showTranslation, setShowTranslation] = useState(true)
    const [isHifzMode, setIsHifzMode] = useState(false)
    
    // Playback States
    const [isPlaying, setIsPlaying] = useState(false)
    const [playingVerseKey, setPlayingVerseKey] = useState(null)
    const [playingWordId, setPlayingWordId] = useState(null)
    const [hoveredWordKey, setHoveredWordKey] = useState(null)
    const [selectedVerseKey, setSelectedVerseKey] = useState(null)
    const [fetchError, setFetchError] = useState(null)
    
    const audioRef = useRef(null)
    const wordAudioRef = useRef(null)
    const isPlayingRef = useRef(false)
    const pageVersesRef = useRef([])
    
    useEffect(() => {
        isPlayingRef.current = isPlaying
    }, [isPlaying])

    // Load chapters list on mount to map Surah IDs to start pages
    useEffect(() => {
        const loadChapters = async () => {
            const url = 'https://api.quran.com/api/v4/chapters?language=id'
            try {
                const cache = await caches.open('mushaf-pages-v2')
                const cachedRes = await cache.match(url)
                if (cachedRes) {
                    const data = await cachedRes.json()
                    setChapters(data.chapters || [])
                    return
                }
                const res = await fetch(url)
                if (res.ok) {
                    const clone = res.clone()
                    const data = await res.json()
                    setChapters(data.chapters || [])
                    await cache.put(url, clone)
                }
            } catch (e) {
                console.error("Gagal memuat daftar surah:", e)
            }
        }
        loadChapters()
    }, [])

    // Helper: Fetch with cache support
    const fetchWithCache = async (url, cacheName) => {
        const cache = await caches.open(cacheName);
        const cachedRes = await cache.match(url);
        if (cachedRes) {
            return await cachedRes.json();
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const clone = res.clone();
        await cache.put(url, clone);
        return await res.json();
    }

    // Fetch layout and metadata whenever pageNumber changes
    useEffect(() => {
        const fetchPageData = async () => {
            setLoading(true)
            setFetchError(null)
            setSelectedVerseKey(null)
            
            // Stop playback on page change
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.src = ""
            }
            setIsPlaying(false)
            setPlayingVerseKey(null)

            const pageStr = String(pageNumber).padStart(3, '0')
            const layoutUrl = `/mushaf/page-${pageStr}.json`
            const metadataUrl = `https://api.quran.com/api/v4/verses/by_page/${pageNumber}?language=id&words=true&translations=33&fields=text_uthmani&word_fields=text_uthmani`

            try {
                const [layoutJson, metadataJson] = await Promise.all([
                    fetchWithCache(layoutUrl, 'mushaf-layouts-v1'),
                    fetchWithCache(metadataUrl, 'mushaf-pages-v2')
                ])

                setLayoutData(layoutJson)
                setVerses(metadataJson.verses || [])
            } catch (e) {
                console.error("Error loading page resources:", e)
                setFetchError(e.message || "Gagal memuat data halaman.")
                setLayoutData(null)
                setVerses([])
            } finally {
                setLoading(false)
            }
        }

        fetchPageData()
    }, [pageNumber])

    // Track Last Read Page
    useEffect(() => {
        if (setUserStats && userStats?.lastReadPage !== pageNumber) {
            setUserStats(prev => ({ ...prev, lastReadPage: pageNumber }))
        }
    }, [pageNumber, setUserStats, userStats?.lastReadPage])

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.src = ""
            }
        }
    }, [])

    // Map Quran.com words to a coordinates lookup table (location key format "S:V:W")
    const quranComWordsMap = {}
    verses.forEach(verse => {
        verse.words.forEach(word => {
            const key = `${verse.verse_key}:${word.position}`
            quranComWordsMap[key] = word
        })
    })

    // Parse unique verse keys from layout data to set up playback loop order
    const getUniqueVerseKeys = (lines) => {
        if (!lines) return []
        const keysSet = new Set()
        lines.forEach(line => {
            if (line.type === 'text' && line.words) {
                line.words.forEach(w => {
                    const parts = w.location.split(':')
                    if (parts.length >= 2) {
                        keysSet.add(`${parts[0]}:${parts[1]}`)
                    }
                })
            }
        })
        return Array.from(keysSet).sort((a, b) => {
            const [sA, vA] = a.split(':').map(Number)
            const [sB, vB] = b.split(':').map(Number)
            return sA !== sB ? sA - sB : vA - vB
        })
    }

    const uniqueVerseKeys = getUniqueVerseKeys(layoutData?.lines)
    useEffect(() => {
        pageVersesRef.current = uniqueVerseKeys
    }, [uniqueVerseKeys])

    // Helper: Play word pronunciation deterministically to avoid Quran.com API audio_url waqaf index shift bug
    const playWordAudio = (wordKey) => {
        if (!wordKey) return
        
        if (wordAudioRef.current) {
            wordAudioRef.current.pause()
            wordAudioRef.current.src = ""
        }

        setPlayingWordId(wordKey)
        
        const [surah, verse, word] = wordKey.split(':')
        const s = surah.padStart(3, '0')
        const v = verse.padStart(3, '0')
        const w = word.padStart(3, '0')
        const fullUrl = `https://audio.qurancdn.com/wbw/${s}_${v}_${w}.mp3`
        
        const audio = new Audio(fullUrl)
        wordAudioRef.current = audio
        
        audio.play().catch(e => console.error("Error playing word audio:", e))
        audio.onended = () => setPlayingWordId(null)
        audio.onerror = () => setPlayingWordId(null)
    }

    // Helper: Play verse recitation
    const playVerseAudio = (verseKey) => {
        const [surahNum, verseNum] = verseKey.split(':').map(Number)
        const sStr = String(surahNum).padStart(3, '0')
        const vStr = String(verseNum).padStart(3, '0')
        const readerName = readerPaths[selectedReader] || "Misyari-Rasyid-Al-Afasi"
        const audioUrl = `https://cdn.equran.id/audio-partial/${readerName}/${sStr}${vStr}.mp3`

        if (audioRef.current) {
            audioRef.current.pause()
        }

        setPlayingVerseKey(verseKey)
        const audio = new Audio(audioUrl)
        audioRef.current = audio
        
        // Track Activity
        if (updateReadActivity) {
            const surahInfo = suratList.find(s => s.nomor === surahNum)
            const surahName = surahInfo ? surahInfo.namaLatin : `Surah ${surahNum}`
            updateReadActivity(surahNum, surahName, verseNum)
        }

        audio.play().catch(err => {
            console.error("Playback error:", err)
            handleNextVersePlay(verseKey)
        })

        audio.onended = () => {
            handleNextVersePlay(verseKey)
        }

        audio.onerror = () => {
            console.error("Audio error for verse:", verseKey)
            handleNextVersePlay(verseKey)
        }
    }

    const handleNextVersePlay = (currentKey) => {
        if (!isPlayingRef.current) return
        
        const currentKeys = pageVersesRef.current
        const currentIndex = currentKeys.indexOf(currentKey)
        
        if (currentIndex !== -1 && currentIndex < currentKeys.length - 1) {
            const nextKey = currentKeys[currentIndex + 1]
            playVerseAudio(nextKey)
        } else {
            // End of page reached - auto advance
            if (pageNumber < 604) {
                setPageNumber(prev => prev + 1)
                setTimeout(() => {
                    setIsPlaying(true)
                }, 1000)
            } else {
                setIsPlaying(false)
                setPlayingVerseKey(null)
            }
        }
    }

    const togglePlayback = () => {
        if (isPlaying) {
            if (audioRef.current) {
                audioRef.current.pause()
            }
            setIsPlaying(false)
        } else {
            setIsPlaying(true)
            isPlayingRef.current = true
            const startKey = playingVerseKey || uniqueVerseKeys[0]
            if (startKey) {
                playVerseAudio(startKey)
            }
        }
    }

    // Auto-scroll when playingVerseKey changes
    useEffect(() => {
        if (playingVerseKey) {
            // Scroll Translation
            const transEl = document.getElementById(`trans-${playingVerseKey}`)
            if (transEl) {
                transEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            }
            
            // Scroll Mushaf Verse Marker
            const markerEl = document.getElementById(`verse-marker-${playingVerseKey}`)
            if (markerEl) {
                // block: 'center' keeps the verse in the middle of the screen
                markerEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }
    }, [playingVerseKey])

    // Navigation Handlers
    const prevPage = () => {
        if (pageNumber > 1) setPageNumber(prev => prev - 1)
    }

    const nextPage = () => {
        if (pageNumber < 604) setPageNumber(prev => prev + 1)
    }

    const handleJuzChange = (e) => {
        const juzIndex = Number(e.target.value) - 1
        if (juzIndex >= 0 && juzIndex < 30) {
            setPageNumber(JUZ_START_PAGES[juzIndex])
        }
    }

    const handleSurahChange = (e) => {
        const surahId = Number(e.target.value)
        const chapter = chapters.find(c => c.id === surahId)
        if (chapter && chapter.pages) {
            setPageNumber(chapter.pages[0])
        }
    }

    // Get current Juz and Surah details based on page content
    const firstVerseKey = uniqueVerseKeys[0] || "1:1"
    const firstVerseSurahNum = parseInt(firstVerseKey.split(':')[0])
    
    // We can lookup Juz number from the first verse's metadata
    const currentJuz = verses.find(v => v.verse_key === firstVerseKey)?.juz_number || 1
    const currentSurahInfo = suratList.find(s => s.nomor === firstVerseSurahNum)

    // Helper: Split word text, waqaf mark, and verse end number (e.g. "إِخْرَاجُهُمْ ۚ" or "تَشْهَدُونَ ٨٤")
    const splitWordText = (rawText) => {
        if (!rawText) return { text: '', waqaf: null, verseNum: null }
        
        // Remove small low/high meem (iqlab markers) per user request
        let text = rawText.replace(/[ۭۢ]/g, '').trim()
        let verseNum = null
        let waqaf = null

        // 1. Extract verse number (e.g. "يُؤْمِنُونَ ٨٨")
        const numMatch = text.match(/^(.*?)\s+([١٢٣٤٥٦٧٨٩٠]+)$/)
        if (numMatch) {
            text = numMatch[1].trim()
            verseNum = numMatch[2]
        }

        // 2. Extract waqaf mark (e.g. "إِخْرَاجُهُمْ ۚ")
        const waqafMatch = text.match(/^(.*?)\s*([ۚۖۗۘۙۜۛۧۨ])$/)
        if (waqafMatch) {
            text = waqafMatch[1].trim()
            waqaf = waqafMatch[2]
        }

        return { text, waqaf, verseNum }
    }

    // Helper: Determine Surah Info for Surah Header Banner
    const getSurahForHeader = (lines, idx) => {
        // 1. Search forward on current page
        for (let j = idx + 1; j < lines.length; j++) {
            if (lines[j].type === 'text' && lines[j].verseRange) {
                return parseInt(lines[j].verseRange.split(':')[0])
            }
        }
        // 2. Look forward to next page start chapter
        if (pageNumber < 604 && chapters.length > 0) {
            const nextPageNum = pageNumber + 1
            const nextCh = chapters.find(ch => ch.pages && ch.pages[0] === nextPageNum)
            if (nextCh) return nextCh.id
        }
        // 3. Fallback to parsing from current header object if present
        if (lines[idx].surah) {
            return parseInt(lines[idx].surah)
        }
        return firstVerseSurahNum
    }

    return (
        <div className="flex flex-col min-h-screen bg-parchment-50 dark:bg-slate-950 transition-colors duration-500 pb-20">
            {/* Top Toolbar */}
            <div className="px-4 sm:px-8 py-5 border-b border-parchment-100 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-30 shadow-sm transition-colors duration-500">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Page Selectors */}
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <select 
                            value={currentJuz}
                            onChange={handleJuzChange}
                            className="bg-parchment-50 dark:bg-slate-800 border border-parchment-200 dark:border-slate-700 text-gray-800 dark:text-white rounded-xl px-3 py-2 text-sm font-serif outline-none"
                        >
                            {Array.from({ length: 30 }, (_, i) => (
                                <option key={i} value={i + 1}>Juz {i + 1}</option>
                            ))}
                        </select>

                        <select 
                            value={firstVerseSurahNum}
                            onChange={handleSurahChange}
                            className="bg-parchment-50 dark:bg-slate-800 border border-parchment-200 dark:border-slate-700 text-gray-800 dark:text-white rounded-xl px-3 py-2 text-sm font-serif outline-none"
                        >
                            {chapters.map(ch => (
                                <option key={ch.id} value={ch.id}>
                                    {ch.id}. {ch.name_simple}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Central Page Navigation */}
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={prevPage}
                            disabled={pageNumber === 1}
                            className="p-2 rounded-xl bg-parchment-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 disabled:opacity-30 hover:scale-105 active:scale-95 transition-all"
                            title="Halaman Sebelumnya"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">Halaman</span>
                            <input 
                                type="number" 
                                min="1" 
                                max="604" 
                                value={pageNumber} 
                                onChange={(e) => {
                                    const val = Math.max(1, Math.min(604, Number(e.target.value)))
                                    if (val) setPageNumber(val)
                                }}
                                className="w-16 text-center font-bold bg-parchment-50 dark:bg-slate-800 border border-parchment-200 dark:border-slate-700 rounded-xl py-1 text-sm text-amber-900 dark:text-amber-100 outline-none"
                            />
                            <span className="text-xs text-gray-400">/ 604</span>
                        </div>

                        <button 
                            onClick={nextPage}
                            disabled={pageNumber === 604}
                            className="p-2 rounded-xl bg-parchment-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 disabled:opacity-30 hover:scale-105 active:scale-95 transition-all"
                            title="Halaman Selanjutnya"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Toolbar Actions */}
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={togglePlayback}
                            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 hover:scale-105 ${
                                isPlaying 
                                ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900/50' 
                                : 'bg-emerald-900 text-white hover:bg-emerald-800'
                            }`}
                        >
                            {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                            <span>{isPlaying ? 'Mute/Pause' : 'Putar Halaman'}</span>
                        </button>

                        <button 
                            onClick={() => setShowTranslation(!showTranslation)}
                            className="p-2.5 rounded-xl border border-parchment-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-400 transition-all shadow-sm cursor-pointer"
                            title={showTranslation ? "Sembunyikan Terjemahan" : "Tampilkan Terjemahan"}
                        >
                            {showTranslation ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        
                        <button 
                            onClick={() => setIsHifzMode(!isHifzMode)}
                            className={`p-2.5 rounded-xl border transition-all shadow-sm cursor-pointer ${
                                isHifzMode 
                                ? 'bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-400' 
                                : 'border-parchment-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-400'
                            }`}
                            title={isHifzMode ? "Matikan Mode Hafalan" : "Aktifkan Mode Hafalan"}
                        >
                            <Brain size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Panel: Mushaf Page */}
                <div className={`transition-all duration-300 ${showTranslation ? 'lg:col-span-7' : 'lg:col-span-8 lg:col-start-3'} w-full`}>
                    
                    {loading ? (
                        <div className="h-[600px] bg-white dark:bg-slate-900/40 rounded-3xl border border-parchment-100 dark:border-slate-800/50 flex flex-col items-center justify-center p-8 shadow-sm">
                            <Loader2 size={40} className="text-amber-800 animate-spin mb-4" />
                            <p className="font-serif italic text-gray-500">Memuat halaman {pageNumber}...</p>
                        </div>
                    ) : fetchError ? (
                        <div className="h-[600px] bg-white dark:bg-slate-900/40 rounded-3xl border border-parchment-100 dark:border-slate-800/50 flex flex-col items-center justify-center p-8 text-center shadow-sm">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mb-4 text-red-600">
                                <Volume2 size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Gagal Memuat Halaman</h3>
                            <p className="text-sm text-gray-500 max-w-sm">{fetchError}</p>
                        </div>
                    ) : (
                        <div className="border-4 sm:border-[12px] border-amber-900/5 dark:border-slate-800 shadow-xl rounded-2xl sm:rounded-[2.5rem] relative bg-[#fdfaf4] dark:bg-slate-900/40 overflow-hidden transition-all duration-300">
                            
                            {/* Inner Decorative Frame */}
                            <div className="border border-amber-600/10 dark:border-amber-500/10 m-0.5 sm:m-2 p-2 sm:p-6 rounded-xl sm:rounded-[2rem] min-h-[650px] flex flex-col justify-between" style={{ containerType: 'inline-size' }}>
                                
                                {/* Header Info */}
                                <div className="flex justify-between items-center text-amber-800/60 dark:text-amber-400/60 font-serif border-b border-amber-500/10 dark:border-amber-500/5 pb-2 mb-6" style={{ fontSize: '2.4cqw' }}>
                                    <span>Juz {currentJuz}</span>
                                    <span className="font-bold">{currentSurahInfo?.namaLatin || "Mushaf"}</span>
                                </div>

                                {/* Quran Lines Container */}
                                <div className="flex-1 flex flex-col justify-center py-4">
                                    {layoutData?.lines?.map((line, idx) => {
                                        if (line.type === 'surah-header') {
                                            const sId = getSurahForHeader(layoutData.lines, idx)
                                            const sInfo = suratList.find(s => s.nomor === sId)
                                            return (
                                                <div key={`header-${idx}`} className="my-6 text-center select-none w-full">
                                                    <div className="bg-amber-50 dark:bg-slate-800 border-2 border-amber-500/20 dark:border-amber-800/30 rounded-2xl p-4 relative overflow-hidden max-w-md mx-auto shadow-inner">
                                                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#b45309_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                                        <span className="font-arabic text-emerald-950 dark:text-emerald-300 block mb-1" style={{ fontSize: '4.8cqw' }}>
                                                            {line.text}
                                                        </span>
                                                        <span className="font-bold uppercase tracking-widest text-amber-800 dark:text-amber-400" style={{ fontSize: '2cqw' }}>
                                                            Surah {sId} • {sInfo?.jumlahAyat || 0} Ayat
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        }

                                        if (line.type === 'basmala') {
                                            return (
                                                <div key={`basmala-${idx}`} className="font-arabic text-gray-800 dark:text-parchment-50 mt-6 mb-4 select-none opacity-80 text-center w-full" style={{ fontSize: '6cqw' }}>
                                                    ﷽
                                                </div>
                                            )
                                        }

                                        // Render regular text line
                                        return (
                                            <div 
                                                key={`line-${idx}`} 
                                                className="flex flex-row-reverse flex-nowrap justify-center gap-x-[0.5cqw] py-1 select-none w-full overflow-visible whitespace-nowrap"
                                            >
                                                {line.words?.map((word, wIdx) => {
                                                    const wordKey = word.location
                                                    const qWord = quranComWordsMap[wordKey]
                                                    
                                                    // Parse verse key from location (format "S:V:W")
                                                    const parts = wordKey.split(':')
                                                    const verseKey = parts.length >= 2 ? `${parts[0]}:${parts[1]}` : null

                                                    const isWordPlaying = playingWordId === wordKey
                                                    const isVerseHighlighted = playingVerseKey === verseKey || selectedVerseKey === verseKey

                                                    // Split word text, waqaf mark, and verse end number
                                                    const { text: wordText, waqaf, verseNum } = splitWordText(word.word)

                                                    return (
                                                        <div 
                                                            key={`word-${wIdx}`} 
                                                            className="flex flex-row-reverse items-center relative group py-1"
                                                            onMouseEnter={() => setHoveredWordKey(wordKey)}
                                                            onMouseLeave={() => setHoveredWordKey(null)}
                                                        >
                                                            {/* Main Word Text */}
                                                            <span 
                                                                onClick={() => {
                                                                    playWordAudio(wordKey)
                                                                    if (verseKey) setSelectedVerseKey(verseKey)
                                                                }}
                                                                className={`${arabicFont} text-gray-800 dark:text-parchment-50 cursor-pointer transition-all duration-300 hover:text-amber-600 dark:hover:text-amber-400 p-0.5 px-[0.1cqw] rounded-[0.5cqw] ${
                                                                    isWordPlaying 
                                                                    ? 'text-emerald-700 dark:text-emerald-400 scale-105 font-bold shadow-sm' 
                                                                    : isVerseHighlighted 
                                                                    ? 'bg-amber-100/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 font-medium' 
                                                                    : ''
                                                                } ${
                                                                    isHifzMode && !isWordPlaying
                                                                    ? 'blur-[6px] opacity-50 hover:blur-none hover:opacity-100'
                                                                    : ''
                                                                }`}
                                                                style={{ fontSize: `calc(3.4cqw * ${fontSize / 28})` }}
                                                            >
                                                                {wordText}
                                                            </span>

                                                            {/* Waqaf Mark (Rendered between words, lowered for baseline alignment) */}
                                                            {waqaf && (
                                                                <span 
                                                                    className={`${arabicFont} text-amber-600 dark:text-amber-400 select-none pointer-events-none inline-block align-middle transform translate-y-[0.35em] font-normal`}
                                                                    style={{ 
                                                                        fontSize: `calc(2.6cqw * ${fontSize / 28})`,
                                                                        marginRight: '0.4cqw',
                                                                        marginLeft: '0'
                                                                    }}
                                                                >
                                                                    {waqaf}
                                                                </span>
                                                            )}

                                                            {/* Verse End Marker */}
                                                            {verseNum && (
                                                                <span 
                                                                    id={`verse-marker-${verseKey}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        if (verseKey) {
                                                                            setSelectedVerseKey(verseKey)
                                                                            playVerseAudio(verseKey)
                                                                        }
                                                                    }}
                                                                    className={`font-arabic ml-1 cursor-pointer transition-all hover:scale-110 active:scale-95 text-amber-800 dark:text-amber-400 select-none bg-amber-50 dark:bg-amber-950/20 border border-amber-600/30 rounded-full flex items-center justify-center`}
                                                                    style={{ 
                                                                        width: '5.2cqw', 
                                                                        height: '5.2cqw', 
                                                                        fontSize: '2.4cqw',
                                                                        marginLeft: '0.8cqw'
                                                                    }}
                                                                    title={`Putar Ayat ${verseKey}`}
                                                                >
                                                                    {verseNum}
                                                                </span>
                                                            )}

                                                            {/* Word Tooltip */}
                                                            {hoveredWordKey === wordKey && qWord && qWord.char_type_name === 'word' && (
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 bg-white dark:bg-slate-900 border border-amber-500/20 dark:border-slate-800 rounded-xl shadow-2xl p-2.5 z-[100] text-center pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-150">
                                                                    <p className="text-[10px] font-bold text-amber-900 dark:text-amber-300 mb-0.5 tracking-wide">{qWord.transliteration?.text}</p>
                                                                    <p className="text-[9px] text-gray-500 dark:text-slate-400 leading-tight font-serif">{qWord.translation?.text}</p>
                                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-white dark:border-t-slate-900"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Footer Page Number */}
                                <div className="flex justify-center items-center mt-6 border-t border-amber-500/10 dark:border-amber-500/5 pt-4">
                                    <div className="relative flex items-center justify-center border-2 border-amber-600/20 dark:border-amber-500/20 rounded-full font-serif font-bold text-amber-900 dark:text-amber-100 bg-[#fdfaf4] dark:bg-slate-900 shadow-sm" style={{ fontSize: '3cqw', width: '7cqw', height: '7cqw' }}>
                                        {pageNumber}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Translations Drawer */}
                {showTranslation && (
                    <div className="col-span-1 lg:col-span-5 h-[680px] flex flex-col bg-white dark:bg-slate-900 border border-parchment-100 dark:border-slate-800 rounded-3xl shadow-lg transition-all duration-300">
                        <div className="px-6 py-5 border-b border-parchment-100 dark:border-slate-800/80 bg-parchment-50/30 dark:bg-slate-900/50 rounded-t-3xl flex justify-between items-center">
                            <div>
                                <h3 className="text-md font-serif font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <BookOpen size={18} className="text-amber-700" />
                                    Terjemahan Kemenag
                                </h3>
                                <p className="text-[10px] text-gray-400">Halaman {pageNumber}</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <Loader2 size={24} className="text-amber-800 animate-spin" />
                                </div>
                            ) : verses.map((verse) => {
                                const [sNum, vNum] = verse.verse_key.split(':').map(Number)
                                const surahName = suratList.find(s => s.nomor === sNum)?.namaLatin || "Surah"
                                const translationText = verse.translations?.[0]?.text || ""
                                const isHighlighted = playingVerseKey === verse.verse_key || selectedVerseKey === verse.verse_key
                                const isBookmarked = bookmarks.some(b => b.key === `${sNum}-${vNum}`)

                                // Construct raw verse object for toggleBookmark/handleShare
                                const rawAyat = {
                                    nomorAyat: vNum,
                                    teksArab: verse.text_uthmani,
                                    teksIndonesia: translationText,
                                    surahNomor: sNum,
                                    surahName: surahName
                                }

                                return (
                                    <div 
                                        key={verse.id}
                                        id={`trans-${verse.verse_key}`}
                                        onClick={() => setSelectedVerseKey(verse.verse_key)}
                                        className={`p-4 rounded-2xl cursor-pointer border transition-all duration-300 ${
                                            isHighlighted 
                                            ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-500/20 dark:border-amber-800/30 shadow-sm ring-1 ring-amber-500/10' 
                                            : 'border-transparent hover:bg-parchment-50/50 dark:hover:bg-slate-800/30'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                                                {surahName} {sNum}:{vNum}
                                            </span>
                                            
                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        playVerseAudio(verse.verse_key)
                                                    }}
                                                    className={`p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors ${
                                                        playingVerseKey === verse.verse_key ? 'text-emerald-600' : 'text-gray-400 hover:text-emerald-600'
                                                    }`}
                                                    title="Putar Ayat"
                                                >
                                                    <Play size={14} />
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        toggleBookmark(rawAyat)
                                                    }}
                                                    className={`p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors ${
                                                        isBookmarked ? 'text-amber-600' : 'text-gray-400 hover:text-amber-600'
                                                    }`}
                                                    title="Simpan Ayat"
                                                >
                                                    <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleShare(rawAyat)
                                                    }}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-800 transition-all"
                                                    title="Bagikan"
                                                >
                                                    <Share2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <p className="text-xs sm:text-sm text-gray-700 dark:text-slate-200 leading-relaxed font-serif">
                                            {translationText}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MushafPage
