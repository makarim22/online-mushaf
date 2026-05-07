import React from 'react'
import { 
    BookOpen, ChevronRight, Bookmark, 
    Volume2, Search, Settings, X, Moon, Sun, 
    Sparkles, Home, BarChart2, User, Share2, Info, LogOut
} from 'lucide-react'

const SidebarItem = ({ id, icon: Icon, label, activeSection, setActiveSection, setIsSidebarOpen }) => (
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

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, activeSection, setActiveSection, setShowVectorSearch }) => {
    return (
        <>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside className={`fixed lg:static inset-y-0 left-0 bg-parchment-50 dark:bg-slate-950 border-r border-parchment-100 dark:border-slate-800/50 z-[70] transition-all duration-500 ease-in-out transform ${isSidebarOpen ? 'w-80 translate-x-0 opacity-100' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0 opacity-0 pointer-events-none border-none'}`}>
                <div className={`h-full flex flex-col p-8 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 whitespace-nowrap overflow-hidden'}`}>
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-12 h-12 bg-emerald-900 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
                            <BookOpen className="text-parchment-50" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-serif font-bold text-amber-900 dark:text-amber-100 italic leading-none">Hifdzi</h1>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-800 dark:text-emerald-400 font-bold mt-1">Premium Scholar</p>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-2">
                        <SidebarItem id="home" icon={Home} label="Dashboard" activeSection={activeSection} setActiveSection={setActiveSection} setIsSidebarOpen={setIsSidebarOpen} />
                        <SidebarItem id="mushaf" icon={BookOpen} label="Mushaf Reader" activeSection={activeSection} setActiveSection={setActiveSection} setIsSidebarOpen={setIsSidebarOpen} />
                        <SidebarItem id="progress" icon={BarChart2} label="My Progress" activeSection={activeSection} setActiveSection={setActiveSection} setIsSidebarOpen={setIsSidebarOpen} />
                        <div className="h-px bg-parchment-200 dark:bg-slate-800/50 my-6 mx-4"></div>
                        <SidebarItem id="bookmarks" icon={Bookmark} label="Saved Verses" activeSection={activeSection} setActiveSection={setActiveSection} setIsSidebarOpen={setIsSidebarOpen} />
                        <SidebarItem id="settings" icon={Settings} label="Preferences" activeSection={activeSection} setActiveSection={setActiveSection} setIsSidebarOpen={setIsSidebarOpen} />
                    </nav>

                    <div className="mt-auto space-y-4">
                        <button 
                            onClick={() => setShowVectorSearch(true)}
                            className="w-full bg-emerald-900 text-white p-4 rounded-2xl flex items-center gap-4 hover:bg-emerald-800 transition-all shadow-lg group"
                        >
                            <div className="bg-emerald-800 p-2 rounded-xl group-hover:scale-110 transition-transform">
                                <Sparkles size={20} className="text-amber-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold">Ask the Quran</p>
                                <p className="text-[10px] text-emerald-200/60 font-medium">Semantic Search</p>
                            </div>
                        </button>
                        
                        <div className="flex items-center justify-between px-4 pt-4 border-t border-parchment-200 dark:border-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-parchment-200 dark:bg-slate-800 flex items-center justify-center">
                                    <User size={16} className="text-gray-500" />
                                </div>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Scholar Mode</span>
                            </div>
                            <LogOut size={16} className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors" />
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}

export default Sidebar
