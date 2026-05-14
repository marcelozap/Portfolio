'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { TerminalSquare, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface TerminalLine {
  kind: 'in' | 'out' | 'err' | 'sys';
  text: string;
}

const HELP = [
  'available commands:',
  '  help                 list commands',
  '  whoami               about XIV',
  '  ls projects          list projects',
  '  open <project>       open project (gatekpt | money-machine | rally)',
  '  goto <section>       hero · about · experience · engineering · projects · music',
  '  music                play ambient hint',
  '  clear                wipe terminal',
  '  exit                 close terminal',
];

const WHOAMI = [
  'XIV — developer · builder · creative technologist',
  'late-night focus · systems over noise · infinite iterations',
  'building tools, experiences, and ideas.',
];

const PROJECT_IDS = ['gatekpt', 'money-machine', 'green-machine', 'rally'];
const SECTION_IDS = ['hero', 'about', 'experience', 'engineering', 'projects', 'music'];

/**
 * Persistent terminal dock. Toggle with backtick (`) or via command palette.
 * Routes commands into scrolling/navigation actions on the page.
 */
export function TerminalDock() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<TerminalLine[]>([
    { kind: 'sys', text: 'XIV_OS terminal · type "help" to begin.' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const push = useCallback((line: TerminalLine) => {
    setLines((prev) => [...prev, line]);
  }, []);

  const run = useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      if (!cmd) return;
      push({ kind: 'in', text: `xiv@os:~$ ${cmd}` });
      setHistory((h) => [...h, cmd]);
      setHistoryIdx(null);

      const [head, ...rest] = cmd.split(/\s+/);
      switch (head) {
        case 'help':
          HELP.forEach((l) => push({ kind: 'out', text: l }));
          break;
        case 'whoami':
          WHOAMI.forEach((l) => push({ kind: 'out', text: l }));
          break;
        case 'ls': {
          const target = rest[0];
          if (target === 'projects') {
            PROJECT_IDS.forEach((p) => push({ kind: 'out', text: `· ${p}` }));
          } else {
            push({ kind: 'err', text: 'usage: ls projects' });
          }
          break;
        }
        case 'open': {
          const id = rest[0];
          if (!id || !PROJECT_IDS.includes(id)) {
            push({
              kind: 'err',
              text: `unknown project. try: ${PROJECT_IDS.join(' | ')}`,
            });
            break;
          }
          push({ kind: 'out', text: `opening ${id}…` });
          document
            .getElementById('projects')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.dispatchEvent(new CustomEvent<string>('xiv:project:open', { detail: id }));
          break;
        }
        case 'goto': {
          const id = rest[0];
          if (!id || !SECTION_IDS.includes(id)) {
            push({
              kind: 'err',
              text: `unknown section. try: ${SECTION_IDS.join(' | ')}`,
            });
            break;
          }
          push({ kind: 'out', text: `goto ${id}` });
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        }
        case 'music':
          push({ kind: 'out', text: '~ ambient hum loaded · adjust volume IRL ~' });
          document.getElementById('music')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        case 'clear':
          setLines([{ kind: 'sys', text: 'cleared.' }]);
          break;
        case 'exit':
          setOpen(false);
          break;
        default:
          push({
            kind: 'err',
            text: `command not found: ${head}. try "help".`,
          });
      }
    },
    [push],
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [lines]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (e.key === '`' && !isEditable) {
        e.preventDefault();
        setOpen((v) => !v);
        if (!open) setTimeout(() => inputRef.current?.focus(), 80);
      }
    };
    window.addEventListener('keydown', onKey);

    const openHandler = () => {
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 80);
    };
    window.addEventListener('xiv:terminal:open', openHandler as EventListener);

    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('xiv:terminal:open', openHandler as EventListener);
    };
  }, [open]);

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const next = historyIdx === null ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(next);
      setInput(history[next] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === null) return;
      const next = historyIdx + 1;
      if (next >= history.length) {
        setHistoryIdx(null);
        setInput('');
      } else {
        setHistoryIdx(next);
        setInput(history[next] ?? '');
      }
    }
  };

  return (
    <>
      {/* trigger pill */}
      <button
        aria-label="Toggle terminal"
        onClick={() => {
          setOpen((v) => !v);
          setTimeout(() => inputRef.current?.focus(), 80);
        }}
        className={cn(
          'fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full border border-white/10 bg-bg-elevated/80 px-3 py-2 font-mono text-[11px] text-ink-muted shadow-glow backdrop-blur-xl transition',
          'hover:border-accent/40 hover:text-ink',
        )}
      >
        <TerminalSquare className="size-4" />
        <span>terminal</span>
        <kbd className="rounded border border-white/10 bg-bg-subtle px-1.5 py-0.5 text-[10px]">
          `
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="glass-strong scanline fixed bottom-20 right-5 z-30 w-[min(520px,calc(100vw-2.5rem))] overflow-hidden shadow-glow-lg"
            role="dialog"
            aria-label="XIV terminal"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
              <div className="flex items-center gap-2 font-mono text-[11px] text-ink-muted">
                <span className="size-2 rounded-full bg-signal-red/80" />
                <span className="size-2 rounded-full bg-signal-amber/80" />
                <span className="size-2 rounded-full bg-signal-green/80" />
                <span className="ml-2 tracking-widest">xiv@os · /terminal</span>
              </div>
              <button
                aria-label="Close terminal"
                onClick={() => setOpen(false)}
                className="rounded p-1 text-ink-muted transition hover:bg-white/[0.06] hover:text-ink"
              >
                <X className="size-3.5" />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="h-72 overflow-y-auto px-4 py-3 font-mono text-[12px] leading-relaxed"
            >
              {lines.map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    line.kind === 'in' && 'text-ink',
                    line.kind === 'out' && 'text-ink-muted',
                    line.kind === 'err' && 'text-signal-red/90',
                    line.kind === 'sys' && 'text-accent/80',
                  )}
                >
                  {line.text}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 border-t border-white/[0.06] px-3 py-2 font-mono text-[12px]">
              <span className="text-accent">xiv@os:~$</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onInputKey}
                autoFocus
                spellCheck={false}
                className="flex-1 bg-transparent text-ink placeholder:text-ink-faint focus:outline-none"
                placeholder="try: help · open gatekpt · goto projects"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
