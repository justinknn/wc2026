"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef } from "react";
import type { TournamentMatch } from "@/lib/types";
import { flagEmoji } from "@/lib/teams";

interface MatchCardProps {
  match: TournamentMatch;
  onSelect?: (match: TournamentMatch) => void;
  highlightTeams?: string[];
}

function statusLabel(status: TournamentMatch["status"]) {
  if (status === "live") return "LIVE";
  if (status === "finished") return "Beendet";
  if (status === "postponed") return "Verschoben";
  return "Anstehend";
}

function AnimatedScore({
  home,
  away,
  flash,
}: {
  home: number | null;
  away: number | null;
  flash: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const text =
    home !== null && away !== null ? `${home} : ${away}` : "– : –";

  if (reduceMotion) {
    return <div className="font-mono text-lg font-semibold">{text}</div>;
  }

  return (
    <motion.div
      key={text}
      initial={flash ? { scale: 1.35, color: "var(--live)" } : false}
      animate={{ scale: 1, color: "var(--text)" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="font-mono text-lg font-semibold"
    >
      {text}
    </motion.div>
  );
}

export function MatchCard({ match, onSelect, highlightTeams = [] }: MatchCardProps) {
  const prevScore = useRef<string | null>(null);
  const scoreKey = `${match.homeScore}-${match.awayScore}`;
  const flash = prevScore.current !== null && prevScore.current !== scoreKey && match.status === "live";

  useEffect(() => {
    prevScore.current = scoreKey;
  }, [scoreKey]);

  const homeHighlighted = highlightTeams.includes(match.homeTeam);
  const awayHighlighted = highlightTeams.includes(match.awayTeam);

  return (
    <button
      type="button"
      onClick={() => onSelect?.(match)}
      className={`glass w-full rounded-2xl p-4 text-left transition hover:border-[var(--accent)]/40 ${
        homeHighlighted || awayHighlighted ? "ring-1 ring-[var(--accent)]/40" : ""
      } ${match.status === "live" ? "border-[var(--live)]/30" : ""}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
        <span>
          {match.group ? `Gruppe ${match.group}` : match.round}
          {match.venue ? ` · ${match.venue}` : ""}
        </span>
        <span
          className={
            match.status === "live"
              ? "inline-flex items-center gap-1.5 font-semibold text-[var(--live)]"
              : match.status === "finished"
                ? "text-[var(--muted)]"
                : "text-[var(--accent)]"
          }
        >
          {match.status === "live" && <span className="live-pulse h-2 w-2 rounded-full bg-[var(--live)]" />}
          {statusLabel(match.status)}
          {match.status === "live" && match.minute ? ` ${match.minute}'` : ""}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className={`flex items-center gap-2 ${homeHighlighted ? "text-[var(--accent)]" : ""}`}>
          {match.homeBadge ? (
            <Image src={match.homeBadge} alt="" width={28} height={28} className="rounded-full" />
          ) : (
            <span className="text-xl">{flagEmoji(match.homeTeam)}</span>
          )}
          <span className="truncate font-medium">{match.homeTeam}</span>
        </div>
        <AnimatedScore home={match.homeScore} away={match.awayScore} flash={flash} />
        <div className={`flex items-center justify-end gap-2 text-right ${awayHighlighted ? "text-[var(--accent)]" : ""}`}>
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
