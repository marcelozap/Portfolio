'use client';

export function PersistentAudioPlayer() {
  return (
    <aside
      className="bg-bg/88 fixed bottom-4 left-1/2 z-50 w-[min(520px,calc(100vw-32px))] -translate-x-1/2 border border-line p-3 backdrop-blur-xl"
      aria-label="MaloSound audio player"
    >
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          Original MaloSound by Marcelo
        </span>
        <span className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
          Victoria 9:08 PM
        </span>
      </div>
      <audio className="h-9 w-full" controls preload="metadata" src="/audio/vicotira9-08pm.mp3">
        <a href="/audio/vicotira9-08pm.mp3">Play MaloSound audio</a>
      </audio>
    </aside>
  );
}
