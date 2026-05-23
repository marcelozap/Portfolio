'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Briefcase,
  Cpu,
  Disc3,
  FolderKanban,
  Search,
  Sparkles,
  TerminalSquare,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PROJECTS } from '@/lib/projects';

interface CommandItem {
  id: string;
  label: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
  group: string;
}

interface CommandPaletteContextValue {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const Ctx = createContext<CommandPaletteContextValue | null>(null);

export function useCommandPalette() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCommandPalette must be used within provider');
  return c;
}

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const openTerminal = () => {
  window.dispatchEvent(new CustomEvent('xiv:terminal:open'));
};

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setVisible(false);
    setQuery('');
    setCursor(0);
  }, []);

  const open = useCallback(() => {
    setVisible(true);
    setTimeout(() => inputRef.current?.focus(), 60);
  }, []);

  const toggle = useCallback(() => {
    setVisible((v) => !v);
    if (!visible) setTimeout(() => inputRef.current?.focus(), 60);
  }, [visible]);

  const items: CommandItem[] = useMemo(() => {
    const nav: CommandItem[] = [
      {
        id: 'goto-hero',
        label: 'Jump to Hero',
        icon: Sparkles,
        group: 'Navigate',
        action: () => scrollTo('hero'),
      },
      {
        id: 'goto-about',
        label: 'About Marcelo',
        icon: User,
        group: 'Navigate',
        action: () => scrollTo('about'),
      },
      {
        id: 'goto-experience',
        label: 'Experience',
        icon: Briefcase,
        group: 'Navigate',
        action: () => scrollTo('experience'),
      },
      {
        id: 'goto-engineering',
        label: 'Capabilities & systems',
        icon: Cpu,
        group: 'Navigate',
        action: () => scrollTo('engineering'),
      },
      {
        id: 'goto-projects',
        label: 'Projects',
        icon: FolderKanban,
        group: 'Navigate',
        action: () => scrollTo('projects'),
      },
      {
        id: 'goto-music',
        label: 'Sound & composition',
        icon: Disc3,
        group: 'Navigate',
        action: () => scrollTo('music'),
      },
    ];

    const proj: CommandItem[] = PROJECTS.map((p) => ({
      id: `project-${p.id}`,
      label: `Open ${p.name}`,
      hint: p.tagline,
      icon: FolderKanban,
      group: 'Projects',
      keywords: [p.domain, p.status, ...p.stack],
      action: () => {
        scrollTo('projects');
        window.dispatchEvent(new CustomEvent<string>('xiv:project:open', { detail: p.id }));
      },
    }));

    const actions: CommandItem[] = [
      {
        id: 'open-terminal',
        label: 'Open Terminal',
        hint: 'Press ` to toggle',
        icon: TerminalSquare,
        group: 'Actions',
        action: openTerminal,
      },
    ];

    return [...nav, ...proj, ...actions];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const hay = [it.label, it.hint ?? '', it.group, ...(it.keywords ?? [])]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
        return;
      }
      if (e.key === 'Escape' && visible) {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle, close, visible]);

  const value = useMemo(() => ({ open, close, toggle }), [open, close, toggle]);

  const run = (idx: number) => {
    const item = filtered[idx];
    if (!item) return;
    item.action();
    close();
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => (c + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => (c - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(cursor);
    }
  };

  // group items by group for rendering
  const grouped = useMemo(() => {
    const map = new Map<string, { item: CommandItem; index: number }[]>();
    filtered.forEach((item, index) => {
      const arr = map.get(item.group) ?? [];
      arr.push({ item, index });
      map.set(item.group, arr);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-start justify-center pt-[18vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <button
              aria-label="Close palette"
              onClick={close}
              className="absolute inset-0 cursor-default bg-bg/70 backdrop-blur-md"
            />

            <motion.div
              role="dialog"
              aria-label="Command palette"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="glass-strong relative z-10 mx-4 w-full max-w-xl overflow-hidden shadow-glow-lg"
            >
              <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
                <Search className="size-4 text-ink-muted" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Search work, projects, sections…"
                  className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
                />
                <kbd className="rounded border border-white/10 bg-bg-subtle px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
                  ESC
                </kbd>
              </div>

              <div className="max-h-[55vh] overflow-y-auto py-2">
                {filtered.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-ink-muted">No matches.</div>
                )}
                {grouped.map(([group, entries]) => (
                  <div key={group} className="px-1 py-1">
                    <div className="px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                      {group}
                    </div>
                    {entries.map(({ item, index }) => {
                      const Icon = item.icon;
                      const isActive = cursor === index;
                      return (
                        <button
                          key={item.id}
                          onMouseEnter={() => setCursor(index)}
                          onClick={() => run(index)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition',
                            isActive
                              ? 'bg-white/[0.05] text-ink'
                              : 'text-ink-muted hover:bg-white/[0.03] hover:text-ink',
                          )}
                        >
                          <Icon className="size-4 shrink-0 text-accent/80" />
                          <span className="flex-1 truncate">
                            {item.label}
                            {item.hint && (
                              <span className="ml-2 text-xs text-ink-faint">{item.hint}</span>
                            )}
                          </span>
                          {isActive && <ArrowRight className="size-3.5 shrink-0 text-accent" />}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2 font-mono text-[10px] text-ink-faint">
                <span>↑↓ navigate · ↵ select · ⌘K toggle</span>
                <span>portfolio · palette</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}
