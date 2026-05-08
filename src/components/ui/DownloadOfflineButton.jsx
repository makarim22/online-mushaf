import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { offlineService } from '../../services/offlineService';

const DownloadOfflineButton = ({ selectedSurat, ayatList, selectedReader }) => {
    const [status, setStatus] = useState('idle'); // idle, downloading, downloaded
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        checkStatus();
    }, [selectedSurat, selectedReader, ayatList]);

    const checkStatus = async () => {
        if (!ayatList || ayatList.length === 0) return;
        const isDownloaded = await offlineService.isSurahDownloaded(ayatList, selectedReader);
        setStatus(isDownloaded ? 'downloaded' : 'idle');
    };

    const handleDownload = async () => {
        if (status === 'downloading') return;
        
        setStatus('downloading');
        setProgress(0);
        
        try {
            await offlineService.downloadSurahAudio(
                selectedSurat.nomor, 
                ayatList, 
                selectedReader, 
                (p) => setProgress(p)
            );
            setStatus('downloaded');
        } catch (error) {
            console.error("Download failed:", error);
            setStatus('idle');
        }
    };

    const handleRemove = async (e) => {
        e.stopPropagation();
        if (window.confirm(`Hapus data offline untuk Surah ${selectedSurat.namaLatin}?`)) {
            await offlineService.removeSurahAudio(ayatList, selectedReader);
            setStatus('idle');
            setProgress(0);
        }
    };

    if (status === 'downloading') {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-xl text-xs font-bold border border-amber-200 dark:border-amber-800 animate-pulse">
                <Loader2 size={14} className="animate-spin" />
                <span>Downloading {progress}%</span>
            </div>
        );
    }

    if (status === 'downloaded') {
        return (
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 size={14} />
                    <span>Offline Ready</span>
                </div>
                <button 
                    onClick={handleRemove}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    title="Remove offline data"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        );
    }

    return (
        <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-400 hover:bg-parchment-50 dark:hover:bg-slate-700 rounded-xl text-xs font-bold border border-parchment-100 dark:border-slate-700 transition-all shadow-sm"
        >
            <Download size={14} />
            <span>Available Offline?</span>
        </button>
    );
};

export default DownloadOfflineButton;
