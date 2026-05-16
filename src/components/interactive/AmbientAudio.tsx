'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const AMBIENT_URL = '/audio/ambient.mp3';

/**
 * Chill ambient layer + subtle off-center drums. Browsers block audio until a
 * gesture — tap "Sound" once to start.
 *
 * Optional file: place `public/audio/ambient.mp3` (looped). If missing, falls
 * back to a soft synthesized pad.
 * One-time whisper "XIV" via speech synthesis (low volume), same gesture.
 */
export function AmbientAudio() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const padNodesRef = useRef<{ stop: () => void } | null>(null);
  const drumTimerRef = useRef<number | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const xivSpokenRef = useRef(false);

  const stopSynth = useCallback(() => {
    padNodesRef.current?.stop();
    padNodesRef.current = null;
    if (drumTimerRef.current != null) {
      window.clearInterval(drumTimerRef.current);
      drumTimerRef.current = null;
    }
  }, []);

  const startSynthPad = useCallback((ctx: AudioContext) => {
    const master = ctx.createGain();
    master.gain.value = 0.08;
    const padPan = ctx.createStereoPanner();
    padPan.pan.value = 0;
    master.connect(padPan);
    padPan.connect(ctx.destination);

    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    oscA.type = 'sine';
    oscB.type = 'sine';
    oscA.frequency.value = 110;
    oscB.frequency.value = 164.81;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    const g = ctx.createGain();
    g.gain.value = 0.45;
    oscA.connect(filter);
    oscB.connect(filter);
    filter.connect(g);
    g.connect(master);
    oscA.start();
    oscB.start();

    let t0 = ctx.currentTime;
    const lfo = () => {
      t0 = ctx.currentTime;
      filter.frequency.cancelScheduledValues(t0);
      filter.frequency.setValueAtTime(320, t0);
      filter.frequency.linearRampToValueAtTime(520, t0 + 14);
      filter.frequency.linearRampToValueAtTime(320, t0 + 28);
    };
    lfo();
    const id = window.setInterval(lfo, 28000);

    padNodesRef.current = {
      stop: () => {
        window.clearInterval(id);
        try {
          oscA.stop();
          oscB.stop();
        } catch {
          /* noop */
        }
      },
    };
  }, []);

  const scheduleDrums = useCallback((ctx: AudioContext) => {
    const drumGain = ctx.createGain();
    drumGain.gain.value = 0.06;
    const drumPan = ctx.createStereoPanner();
    drumPan.pan.value = -0.42;
    drumGain.connect(drumPan);
    drumPan.connect(ctx.destination);

    const bpm = 58;
    const step = (60 / bpm) * 0.5 * 1000;
    let tick = 0;

    const playKick = (time: number) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(52, time);
      o.frequency.exponentialRampToValueAtTime(28, time + 0.06);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.9, time);
      g.gain.exponentialRampToValueAtTime(0.01, time + 0.22);
      o.connect(g);
      g.connect(drumGain);
      o.start(time);
      o.stop(time + 0.25);
    };

    const playHat = (time: number) => {
      const n = ctx.createBufferSource();
      const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.04), ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.35;
      n.buffer = buf;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 7000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.22, time);
      g.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
      n.connect(hp);
      hp.connect(g);
      g.connect(drumGain);
      n.start(time);
      n.stop(time + 0.06);
    };

    drumTimerRef.current = window.setInterval(() => {
      const now = ctx.currentTime + 0.02;
      if (tick % 4 === 0) playKick(now);
      if (tick % 4 === 2) playHat(now);
      tick += 1;
    }, step);
  }, []);

  const speakXivOnce = useCallback(() => {
    if (xivSpokenRef.current) return;
    xivSpokenRef.current = true;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance('XIV');
    u.volume = 0.12;
    u.rate = 0.85;
    u.pitch = 0.95;
    window.setTimeout(() => {
      try {
        window.speechSynthesis.speak(u);
      } catch {
        /* noop */
      }
    }, 2200);
  }, []);

  const startAudio = useCallback(async () => {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    let ctx = ctxRef.current;
    if (!ctx) {
      ctx = new AC();
      ctxRef.current = ctx;
    }
    if (ctx.state === 'suspended') await ctx.resume();

    stopSynth();
    let usedFile = false;

    try {
      const res = await fetch(AMBIENT_URL, { method: 'HEAD' });
      if (res.ok) {
        const el = new Audio(AMBIENT_URL);
        el.loop = true;
        el.volume = 0.22;
        try {
          await el.play();
          audioElRef.current = el;
          usedFile = true;
        } catch {
          usedFile = false;
        }
      }
    } catch {
      usedFile = false;
    }

    if (!usedFile) startSynthPad(ctx);
    scheduleDrums(ctx);
    speakXivOnce();
    setOn(true);
  }, [scheduleDrums, speakXivOnce, startSynthPad, stopSynth]);

  const stopAll = useCallback(() => {
    stopSynth();
    const el = audioElRef.current;
    if (el) {
      el.pause();
      el.src = '';
      audioElRef.current = null;
    }
    void ctxRef.current?.suspend();
    setOn(false);
  }, [stopSynth]);

  useEffect(() => () => stopAll(), [stopAll]);

  return (
    <button
      type="button"
      onClick={() => (on ? stopAll() : void startAudio())}
      title="Original ambient score by Marcelo Zapata (Logic). Toggle playback."
      className="fixed bottom-5 left-5 z-[60] flex items-center gap-2 rounded-full border border-white/10 bg-bg-elevated/85 px-3 py-2 font-mono text-[11px] text-ink-muted shadow-glow backdrop-blur-xl transition hover:border-accent/40 hover:text-ink"
      aria-pressed={on}
      aria-label={
        on
          ? 'Mute ambient audio (original composition by Marcelo Zapata)'
          : 'Play ambient audio (original composition by Marcelo Zapata)'
      }
    >
      {on ? <Volume2 className="size-3.5 text-accent" /> : <VolumeX className="size-3.5" />}
      <span className="hidden sm:inline">{on ? 'Sound on' : 'Sound'}</span>
    </button>
  );
}
