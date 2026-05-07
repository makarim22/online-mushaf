import React from 'react'
import { ChevronLeft, ChevronRight, RotateCcw, Pause, Play, Settings } from 'lucide-react'

const FloatingPlayer = ({
    isDragging,
    playerPos,
    handleMouseDown,
    handleSuratChange,
    selectedSurat,
    repeatCount,
    setRepeatCount,
    isPlayingFullSurah,
    toggleFullSurahPlayback,
    playingAyat,
    setActiveSection
}) => {
    return (
        <div 
            className={`fixed z-[100] w-full sm:max-w-[300px] select-none transition-all duration-300 ${isDragging ? 'transition-none' : ''}`}
            style={typeof window !== 'undefined' && window.innerWidth >= 640 ? { 
                left: `${playerPos.x}px`, 
                top: `${playerPos.y}px`,
            } : {
                bottom: '1.5rem',
                left: '0',
                padding: '0 1rem'
            }}
        >
            <div className="bg-gray-900/95 text-white rounded-2xl shadow-2xl p-4 flex flex-col border border-white/10 backdrop-blur-xl">
                {/* Drag Handle (Desktop only) */}
                <div 
                    onMouseDown={handleMouseDown}
                    className="hidden sm:flex w-full justify-center pb-2 cursor-grab active:cursor-grabbing group mb-2"
                >
                    <div className="w-12 h-1.5 bg-white/10 group-hover:bg-amber-500/50 rounded-full transition-colors" />
                </div>
                
                <div className="flex items-center justify-between px-2">
                    <button 
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all disabled:opacity-20" 
                        onClick={() => handleSuratChange(selectedSurat.nomor - 1)} 
                        disabled={!selectedSurat || selectedSurat.nomor === 1}
                        title="Previous Surah"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setRepeatCount(prev => prev === 1 ? 3 : prev === 3 ? 5 : prev === 5 ? 0 : 1)} 
                            className={`p-1.5 transition-colors flex flex-col items-center gap-0.5 min-w-[32px] ${repeatCount > 1 || repeatCount === 0 ? 'text-amber-500' : 'text-gray-400 hover:text-white'}`}
                        >
                            <RotateCcw size={18} />
                            <span className="text-[8px] font-bold uppercase tracking-tighter leading-none">{repeatCount === 0 ? 'Loop' : `${repeatCount}x`}</span>
                        </button>

                        <button 
                            onClick={toggleFullSurahPlayback}
                            className="w-11 h-11 bg-amber-600 rounded-2xl flex items-center justify-center hover:bg-amber-500 transition-all shadow-lg active:scale-95 group"
                        >
                            {isPlayingFullSurah 
                                ? <Pause size={20} fill="currentColor" /> 
                                : <Play size={20} fill="currentColor" className="ml-1" />
                            }
                        </button>

                        <button 
                            onClick={() => setActiveSection('settings')} 
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                            title="Player Settings"
                        >
                            <Settings size={18} />
                        </button>
                    </div>

                    <button 
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all disabled:opacity-20" 
                        onClick={() => handleSuratChange(selectedSurat.nomor + 1)} 
                        disabled={!selectedSurat || selectedSurat.nomor === 114}
                        title="Next Surah"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FloatingPlayer
