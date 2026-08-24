'use client';

export function PersistentAudioPlayer() {
  return (
    <aside
      className="bg-bg/88 fixed bottom-4 right-4 z-50 hidden w-[min(360px,calc(100vw-32px))] border border-line p-2.5 backdrop-blur-xl lg:block"
      aria-label="MaloSound audio player"
    >
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          MaloSound preview
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
