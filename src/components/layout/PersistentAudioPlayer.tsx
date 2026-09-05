'use client';

import { Music2, Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const LOOP_SECONDS = 74;

export function PersistentAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const hasExpandedRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = 0.2;
  }, []);

  useEffect(() => {
    if (isExpanded) {
      hasExpandedRef.current = true;
      closeButtonRef.current?.focus();
    } else if (hasExpandedRef.current) {
      openButtonRef.current?.focus();
    }
  }, [isExpanded]);

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
      className="fixed bottom-3 right-3 z-50 sm:bottom-4 sm:right-4"
      aria-label="MaloSound audio player"
    >
      {!isExpanded && (
        <button
          ref={openButtonRef}
          type="button"
          onClick={() => setIsExpanded(true)}
          aria-label="Open MaloSound player"
          aria-expanded={false}
          aria-controls="malosound-player-controls"
          title="Open MaloSound player"
          className="relative flex size-11 items-center justify-center rounded-full border border-[#d8b66f]/45 bg-[#080b10]/95 text-[#d8b66f] shadow-lg backdrop-blur-xl transition hover:border-[#72eaff] hover:text-[#72eaff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#72eaff]"
        >
          <Music2 className="size-4" aria-hidden="true" />
          {isPlaying && (
            <span
              className="absolute right-0 top-0 size-2 rounded-full bg-[#72eaff]"
              aria-hidden="true"
            />
          )}
        </button>
      )}
      {isExpanded && (
        <div
          id="malosound-player-controls"
          className="w-[min(240px,calc(100vw-24px))] border border-[#d8b66f]/30 bg-[#080b10]/95 p-2.5 text-[#f7f1ff] shadow-2xl backdrop-blur-xl"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setIsExpanded(false);
          }}
        >
          <div className="mb-2 flex items-center justify-between border-b border-[#d8b66f]/20 pb-1">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#d8b66f]">
              <Music2 className="size-4" aria-hidden="true" />
              MaloSound
            </p>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setIsExpanded(false)}
              aria-label="Close MaloSound player"
              aria-expanded={true}
              aria-controls="malosound-player-controls"
              title="Close MaloSound player"
              className="flex size-11 shrink-0 items-center justify-center text-[#d8b66f] transition hover:text-[#72eaff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#72eaff]"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <p className="min-w-0 flex-1 truncate text-sm font-medium">Output 1-2</p>
            <button
              type="button"
              onClick={togglePlayback}
              aria-label={isPlaying ? 'Pause Output 1-2' : 'Play Output 1-2'}
              title={isPlaying ? 'Pause Output 1-2' : 'Play Output 1-2'}
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#72eaff] text-[#080b10] transition hover:bg-[#f7f1ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#72eaff]"
            >
              {isPlaying ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute Output 1-2' : 'Mute Output 1-2'}
              title={isMuted ? 'Unmute Output 1-2' : 'Mute Output 1-2'}
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#d8b66f]/40 text-[#d8b66f] transition hover:border-[#72eaff] hover:text-[#72eaff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#72eaff]"
            >
              {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
          </div>
        </div>
      )}
      <audio
        ref={audioRef}
        className="sr-only"
        preload="auto"
        aria-label="Output 1-2"
        src="/audio/output-1-2.m4a"
        onTimeUpdate={(event) => {
          if (event.currentTarget.currentTime >= LOOP_SECONDS) event.currentTarget.currentTime = 0;
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      >
        <a href="/audio/output-1-2.m4a">Play Output 1-2</a>
      </audio>
    </aside>
  );
}
