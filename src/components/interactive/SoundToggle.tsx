'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const AUDIO_SRC = '/audio/ambient.mp3';

export function SoundToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = 0.24;
    audio.preload = 'none';
    audioRef.current = audio;
    setReady(true);

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (enabled) {
      audio.pause();
      setEnabled(false);
      return;
    }

    try {
      await audio.play();
      setEnabled(true);
    } catch {
      setEnabled(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!ready}
      aria-pressed={enabled}
      aria-label={enabled ? 'Turn sound off' : 'Turn sound on'}
      title="Toggle original ambient site audio"
      className="fixed bottom-5 left-5 z-[60] inline-flex items-center gap-2 rounded-full border border-white/10 bg-bg-elevated/85 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted shadow-glow backdrop-blur-xl transition hover:border-accent/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
    >
      {enabled ? <Volume2 className="size-3.5 text-accent" /> : <VolumeX className="size-3.5" />}
      <span>{enabled ? 'Sound on' : 'Sound off'}</span>
    </button>
  );
}
