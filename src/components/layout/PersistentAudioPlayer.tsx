'use client';

import { Music2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const LOOP_SECONDS = 25;

export function PersistentAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = 0.2;
  }, []);

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setIsPlaying(false);
      }
    } else {
      audio.pause();
    }
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    const nextMuted = !audio.muted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);
  }

  return (
    <aside
      className="bg-bg/90 fixed bottom-3 right-3 z-50 w-[min(240px,calc(100vw-24px))] border border-line p-2.5 shadow-2xl backdrop-blur-xl sm:bottom-4 sm:right-4"
      aria-label="Mi Perrito audio player"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent-warm/15 text-accent-warm">
          <Music2 className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">MaloSound</p>
          <p className="truncate text-sm font-medium text-ink">Mi Perrito</p>
        </div>
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={isPlaying ? 'Pause Mi Perrito' : 'Play Mi Perrito'}
          title={isPlaying ? 'Pause Mi Perrito' : 'Play Mi Perrito'}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-bg transition hover:bg-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {isPlaying ? <Pause className="size-3.5" /> : <Play className="ml-0.5 size-3.5" />}
        </button>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute Mi Perrito' : 'Mute Mi Perrito'}
          title={isMuted ? 'Unmute Mi Perrito' : 'Mute Mi Perrito'}
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line text-ink-muted transition hover:border-accent/60 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {isMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
        </button>
      </div>
      <audio
        className="sr-only"
        preload="auto"
        aria-label="Mi Perrito"
        src="/audio/mi-perrito.mp3"
        onTimeUpdate={(event) => {
          if (event.currentTarget.currentTime >= LOOP_SECONDS) event.currentTarget.currentTime = 0;
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      >
        <a href="/audio/mi-perrito.mp3">Play Mi Perrito</a>
      </audio>
    </aside>
  );
}
