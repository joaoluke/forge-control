import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';
import { convertFileSrc } from '@tauri-apps/api/core';

interface AudioFile {
    name: string;
    path: string;
    parent_path: string;
}

// --- SVG Icon Components ---
const IconFolder = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    </svg>
);

const IconMusic = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
    </svg>
);

const IconDisc = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const IconMusicLarge = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
    </svg>
);

const IconSkipBack = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M19 20L9 12l10-8v16zM5 19V5h2v14H5z" />
    </svg>
);

const IconSkipForward = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M5 4l10 8-10 8V4zm12-1h2v18h-2V3z" />
    </svg>
);

const IconPlay = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const IconPause = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
);

const IconPlaySmall = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const IconVolume2 = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
);

const IconVolume1 = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
);

const IconVolumeX = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
);

const IconSoundWave = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse text-blue-400">
        <path d="M2 12h2m4-4v8m4-12v16m4-12v8m4-4h2" />
    </svg>
);


export function Music() {
    const { t } = useTranslation();
    const [folderPath, setFolderPath] = useState<string | null>(null);
    const [songs, setSongs] = useState<AudioFile[]>([]);
    const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const handleSelectFolder = async () => {
        try {
            const selected = await invoke<string | null>('select_folder');
            if (selected) {
                setFolderPath(selected);
                const files = await invoke<AudioFile[]>('list_audio_files', { path: selected });
                setSongs(files);
                setCurrentSongIndex(-1);
                setIsPlaying(false);
            }
        } catch (error) {
            console.error('Error selecting folder:', error);
        }
    };

    const playSong = async (index: number) => {
        setCurrentSongIndex(index);
        setIsPlaying(true);
        if (audioRef.current) {
            try {
                audioRef.current.src = convertFileSrc(songs[index].path);
                audioRef.current.load();
                await audioRef.current.play();
            } catch (error) {
                console.error('Playback error:', error);
                setIsPlaying(false);
            }
        }
    };

    const togglePlay = () => {
        if (!songs.length || currentSongIndex === -1) return;

        if (isPlaying) {
            audioRef.current?.pause();
        } else {
            audioRef.current?.play();
        }
        setIsPlaying(!isPlaying);
    };

    const nextSong = () => {
        if (!songs.length) return;
        const nextIndex = (currentSongIndex + 1) % songs.length;
        playSong(nextIndex);
    };

    const prevSong = () => {
        if (!songs.length) return;
        const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        playSong(prevIndex);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress(audioRef.current.currentTime);
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setProgress(time);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 text-white">
            {/* Header */}
            <div className="p-8 pb-4">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">{t('music.title')}</h1>
                        <p className="text-slate-400">{t('music.description')}</p>
                    </div>
                    <button
                        onClick={handleSelectFolder}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                        <IconFolder /> {t('music.selectFolder')}
                    </button>
                </div>

                {folderPath && (
                    <div className="bg-slate-800/50 backdrop-blur-md rounded-lg p-3 border border-slate-700/50 flex items-center gap-3">
                        <span className="text-slate-500 text-sm font-mono truncate">
                            {folderPath}
                        </span>
                        <span className="bg-slate-700 text-xs px-2 py-1 rounded text-slate-300">
                            {songs.length} {t('music.songs')}
                        </span>
                    </div>
                )}
            </div>

            {/* Playlist */}
            <div className="flex-1 overflow-y-auto px-8 py-4">
                {!songs.length ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                        <IconMusicLarge />
                        <p>{t('music.noSongs')}</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-slate-500 text-sm uppercase tracking-wider">
                                <th className="pb-2 pl-4 w-12">#</th>
                                <th className="pb-2">{t('processes.table.name')}</th>
                                <th className="pb-2">Path</th>
                                <th className="pb-2 w-12"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {songs.map((song, index) => (
                                <tr
                                    key={song.path}
                                    onClick={() => playSong(index)}
                                    className={`group cursor-pointer hover:bg-slate-800 transition-colors ${currentSongIndex === index ? 'bg-blue-600/20 text-blue-400' : ''
                                        }`}
                                >
                                    <td className="py-3 pl-4 rounded-l-lg border-y border-l border-transparent group-hover:border-slate-700">
                                        {currentSongIndex === index && isPlaying ? (
                                            <IconSoundWave />
                                        ) : (
                                            index + 1
                                        )}
                                    </td>
                                    <td className="py-3 font-medium border-y border-transparent group-hover:border-slate-700">
                                        {song.name.replace(/\.[^/.]+$/, "")}
                                    </td>
                                    <td className="py-3 text-slate-500 text-sm truncate max-w-xs border-y border-transparent group-hover:border-slate-700">
                                        {song.parent_path}
                                    </td>
                                    <td className="py-3 pr-4 rounded-r-lg border-y border-r border-transparent group-hover:border-slate-700">
                                        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-white">
                                            <IconPlaySmall />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Playback Bar */}
            <div className="bg-slate-800/90 backdrop-blur-xl border-t border-slate-700 p-4 px-8 flex items-center justify-between gap-8 h-24">
                {/* Info Area */}
                <div className="flex items-center gap-4 w-1/4">
                    <div className="w-14 h-14 bg-slate-700 rounded-md flex items-center justify-center text-slate-400 shadow-inner">
                        {currentSongIndex !== -1 ? <IconMusic /> : <IconDisc />}
                    </div>
                    <div className="flex-1 min-w-0">
                        {currentSongIndex !== -1 ? (
                            <>
                                <h4 className="font-semibold text-sm truncate">
                                    {songs[currentSongIndex].name.replace(/\.[^/.]+$/, "")}
                                </h4>
                                <p className="text-slate-400 text-xs truncate">
                                    {songs[currentSongIndex].parent_path.split('/').pop() || 'Unknown Album'}
                                </p>
                            </>
                        ) : (
                            <p className="text-slate-500 text-sm font-medium">Forge Music</p>
                        )}
                    </div>
                </div>

                {/* Controls Area */}
                <div className="flex flex-col items-center gap-2 flex-1 max-w-md">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={prevSong}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <IconSkipBack />
                        </button>
                        <button
                            onClick={togglePlay}
                            className="bg-white text-black w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                        >
                            {isPlaying ? <IconPause /> : <IconPlay />}
                        </button>
                        <button
                            onClick={nextSong}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <IconSkipForward />
                        </button>
                    </div>
                    <div className="w-full flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-mono w-10 text-right">
                            {formatTime(progress)}
                        </span>
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={progress}
                            onChange={handleSeek}
                            className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <span className="text-[10px] text-slate-500 font-mono w-10">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                {/* Volume Area */}
                <div className="flex items-center gap-3 w-1/4 justify-end">
                    <span className="text-slate-400">
                        {volume === 0 ? <IconVolumeX /> : volume < 0.5 ? <IconVolume1 /> : <IconVolume2 />}
                    </span>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>
            </div>

            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onEnded={nextSong}
                onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
                onError={(e) => console.error('Audio element error:', e.currentTarget.error)}
            />
        </div>
    );
}
