"use client";

import Image from "next/image";
import type { TournamentMatch } from "@/lib/types";
import { flagEmoji } from "@/lib/teams";

interface MatchCardProps {
  match: TournamentMatch;
  onSelect?: (match: TournamentMatch) => void;
}

function statusLabel(status: TournamentMatch["status"]) {
  if (status === "live") return "LIVE";
  if (status === "finished") return "Beendet";
  if (status === "postponed") return "Verschoben";
  return "Anstehend";
}

export function MatchCard({ match, onSelect }: MatchCardProps) {
  const score =
    match.homeScore !== null && match.awayScore !== null
      ? `${match.homeScore} : ${match.awayScore}`
      : "– : –";

  return (
    <button
      type="button"
      onClick={() => onSelect?.(match)}
      className="glass w-full rounded-2xl p-4 text-left transition hover:border-[var(--accent)]/40"
    >
      <div className="mb-3 flex items-center justify-between gap--2 text-xs text-[var(--muted)]">
        <span>
          {match.group ? `Gruppe ${match.group}` : match.round}
          {match.venue ? ` · ${match.venue}` : ""}
        </span>
        <span
          className={
            match.status === "live"
              ? "font-semibold text-[var(--live)]"
              : match.status === "finished"
                ? "text-[var(--muted)]"
                : "text-[var(--accent)]"
          }
        >
          {statusLabel(match.status)}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center gap-2">
          {match.homeBadge ? (
            <Image src={match.homeBadge} alt="" width={28} height={28} className="rounded-full" />
          ) : (
            <span className="text-xl">{flagEmoji(match.homeTeam)}</span>
          )}
          <span className="truncate font-medium">{match.homeTeam}</span>
        </div>
        <div className="font-mono text-lg font-semibold">{score}</div>
        <div className="flex items-center justify-end gap-2 text-right">
          <span className="truncate font-medium">{match.awayTeam}</span>
          {match.awayBadge ? (
            <Image src={match.awayBadge} alt="" width={28} height={28} className="rounded-full" />
          ) : (
            <span className="text-xl">{flagEmoji(match.awayTeam)}</span>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-[var(--muted)]">
        {new Date(match.kickoff).toLocaleString("de-DE", {
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </button>
  );
}
