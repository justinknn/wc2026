"use client";

import Image from "next/image";
import type { TournamentMatch } from "@/lib/types";
import { MatchCard } from "@/components/MatchCard";

interface MatchListProps {
  matches: TournamentMatch[];
  title: string;
  emptyText?: string;
  onSelect?: (match: TournamentMatch) => void;
  highlightTeams?: string[];
}

export function MatchList({ matches, title, emptyText, onSelect, highlightTeams = [] }: MatchListProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className="text-sm text-[var(--muted)]">{matches.length} Spiele</span>
      </div>
      {matches.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-[var(--muted)]">
          {emptyText ?? "Keine Spiele in dieser Ansicht."}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onSelect={onSelect}
              highlightTeams={highlightTeams}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface MatchDetailProps {
  match: TournamentMatch | null;
  onClose: () => void;
}

export function MatchDetail({ match, onClose }: MatchDetailProps) {
  if (!match) return null;

  const score =
    match.homeScore !== null && match.awayScore !== null
      ? `${match.homeScore} : ${match.awayScore}`
      : "– : –";

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-black/70 p-0 sm:items-center sm:justify-center sm:p-4">
      <div className="glass max-h-[90vh] w-full overflow-y-auto rounded-t-3xl p-5 sm:max-w-xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Spieldetails</h3>
          <button type="button" onClick={onClose} className="rounded-full px-3 py-1 text-sm text-[var(--muted)]">
            Schließen
          </button>
        </div>

        {match.thumb && (
          <div className="relative mb-4 h-40 overflow-hidden rounded-2xl">
            <Image src={match.thumb} alt="" fill className="object-cover" />
          </div>
        )}

        <div className="mb-4 text-center">
          <p className="text-sm text-[var(--muted)]">{match.round}</p>
          <p className="mt-2 font-mono text-3xl font-bold">{score}</p>
          <p className="mt-1 text-lg">
            {match.homeTeam} vs {match.awayTeam}
          </p>
        </div>

        <div className="grid gap-3 text-sm">
          <div className="rounded-xl bg-[var(--surface-2)] p-3">
            <p className="text-[var(--muted)]">Stadion</p>
            <p>{match.venue ?? "—"}</p>
          </div>
          <div className="rounded-xl bg-[var(--surface-2)] p-3">
            <p className="text-[var(--muted)]">Anstoß</p>
            <p>
              {new Date(match.kickoff).toLocaleString("de-DE", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {match.videoUrl && (
            <a
              href={match.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black"
            >
              Highlights ansehen
            </a>
          )}
          <a
            href="https://www.zdf.de/sport"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)]"
          >
            ZDF Sport (extern)
          </a>
          <a
            href="https://www.magentasport.de/"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)]"
          >
            MagentaSport (extern)
          </a>
        </div>
      </div>
    </div>
  );
}
