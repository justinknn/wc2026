"use client";

import { useMemo, useState } from "react";
import type { TournamentMatch } from "@/lib/types";
import { BottomNav, type TabId } from "@/components/BottomNav";
import { BracketView } from "@/components/bracket/BracketView";
import { GroupTables } from "@/components/GroupTables";
import { Header } from "@/components/Header";
import { MatchDetail, MatchList } from "@/components/MatchList";
import { useTournamentData } from "@/hooks/useTournamentData";

export function TournamentApp() {
  const { data, isLoading, error, isFetching } = useTournamentData();
  const [tab, setTab] = useState<TabId>("groups");
  const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);

  const upcoming = useMemo(
    () => (data?.matches ?? []).filter((m) => m.status === "scheduled").slice(0, 12),
    [data?.matches],
  );

  const finished = useMemo(
    () =>
      [...(data?.matches ?? [])]
        .filter((m) => m.status === "finished")
        .sort((a, b) => b.kickoff.localeCompare(a.kickoff))
        .slice(0, 18),
    [data?.matches],
  );

  const tabLabel = {
    groups: "Gruppen",
    live: "Live",
    bracket: "Baum",
    matches: "Spiele",
  }[tab];

  return (
    <div className="min-h-screen">
      <Header data={data} activeTab={tabLabel} />
      <BottomNav active={tab} onChange={setTab} liveCount={data?.liveMatches.length ?? 0} />

      <main className="mx-auto max-w-7xl px-4 py-6">
        {isLoading && (
          <div className="glass rounded-2xl p-10 text-center text-[var(--muted)]">
            Lade WM-Daten …
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-[var(--live)]/40 bg-[var(--live)]/10 p-6 text-[var(--live)]">
            {(error as Error).message}
          </div>
        )}

        {data && (
          <>
            {isFetching && (
              <p className="mb-4 text-xs text-[var(--muted)]">Aktualisiere im Hintergrund …</p>
            )}

            {tab === "groups" && <GroupTables groups={data.groups} />}

            {tab === "live" && (
              <MatchList
                matches={data.liveMatches}
                title="Live-Spiele"
                emptyText="Gerade läuft kein Spiel. Die Daten werden alle 30 Sekunden aktualisiert."
                onSelect={setSelectedMatch}
              />
            )}

            {tab === "bracket" && (
              <BracketView
                bracket={data.bracket}
                onSelectMatch={(match) => match.liveData && setSelectedMatch(match.liveData)}
              />
            )}

            {tab === "matches" && (
              <div className="space-y-8">
                <MatchList
                  matches={upcoming}
                  title="Kommende Spiele"
                  onSelect={setSelectedMatch}
                />
                <MatchList
                  matches={finished}
                  title="Ergebnisse"
                  onSelect={setSelectedMatch}
                />
              </div>
            )}
          </>
        )}
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-24 pt-8 text-xs text-[var(--muted)] lg:pb-8">
        Daten: TheSportsDB, openfootball, wcup2026.org · Annex C nach FIFA-Reglement · Keine offizielle FIFA-App
      </footer>

      <MatchDetail match={selectedMatch} onClose={() => setSelectedMatch(null)} />
    </div>
  );
}
