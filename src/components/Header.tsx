"use client";

import type { TournamentData } from "@/lib/types";

interface HeaderProps {
  data?: TournamentData;
  activeTab: string;
}

export function Header({ data, activeTab }: HeaderProps) {
  const liveCount = data?.liveMatches.length ?? 0;
  const updated = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">FIFA World Cup</p>
          <h1 className="text-xl font-semibold md:text-2xl">
            WM 2026 <span className="text-[var(--gold)]">Live</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {liveCount > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--live)]/40 bg-[var(--live)]/10 px-3 py-1 text-[var(--live)]">
              <span className="live-pulse h-2 w-2 rounded-full bg-[var(--live)]" />
              {liveCount} live
            </span>
          )}
          <span className="hidden text-[var(--muted)] sm:inline">
            {activeTab} · Update {updated}
          </span>
        </div>
      </div>
    </header>
  );
}
