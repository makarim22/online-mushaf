const AUDIO_CACHE_NAME = 'hifdzi-audio-v1';

export const offlineService = {
    /**
     * Downloads and caches all audio files for a specific surah
     */
    async downloadSurahAudio(surahNomor, ayatList, readerId, onProgress) {
        console.log(`Starting download for Surah ${surahNomor}...`);
        const cache = await caches.open(AUDIO_CACHE_NAME);
        let completed = 0;
        const total = ayatList.length;

        for (const ayat of ayatList) {
            const audioUrl = ayat.audio[readerId];
            if (!audioUrl) continue;

            try {
                // Check if already in cache
                const response = await cache.match(audioUrl);
                if (!response) {
                    console.log(`Fetching (no-cors): ${audioUrl}`);
                    // We use mode: 'no-cors' to bypass CORS restrictions for audio
                    // This creates an 'opaque' response which can be stored in Cache API
                    const res = await fetch(audioUrl, { mode: 'no-cors' });
                    await cache.put(audioUrl, res);
                }
            } catch (error) {
                console.error(`Failed to download audio for ayah ${ayat.nomorAyat}:`, error);
                // Continue with next ayah even if one fails
            }

            completed++;
            if (onProgress) onProgress(Math.round((completed / total) * 100));
        }
        console.log(`Download for Surah ${surahNomor} completed.`);
    },

    /**
     * Checks if a specific audio URL is cached
     */
    async isAudioCached(audioUrl) {
        try {
            const cache = await caches.open(AUDIO_CACHE_NAME);
            const response = await cache.match(audioUrl);
            return !!response;
        } catch (e) {
            return false;
        }
    },

    /**
     * Checks if an entire surah is downloaded
     */
    async isSurahDownloaded(ayatList, readerId) {
        if (!ayatList || ayatList.length === 0) return false;
        try {
            const cache = await caches.open(AUDIO_CACHE_NAME);
            for (const ayat of ayatList) {
                const audioUrl = ayat.audio[readerId];
                if (!audioUrl) continue;
                const response = await cache.match(audioUrl);
                if (!response) return false;
            }
            return true;
        } catch (e) {
            return false;
        }
    },

    /**
     * Removes a surah from audio cache
     */
    async removeSurahAudio(ayatList, readerId) {
        const cache = await caches.open(AUDIO_CACHE_NAME);
        for (const ayat of ayatList) {
            const audioUrl = ayat.audio[readerId];
            if (audioUrl) await cache.delete(audioUrl);
        }
        console.log(`Offline data removed.`);
    }
};
