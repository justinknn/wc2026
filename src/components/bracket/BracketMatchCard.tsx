"use client";

import Image from "next/image";
import type { BracketMatch, BracketSlot } from "@/lib/types";
import { flagEmoji } from "@/lib/teams";

function SlotLine({ slot, highlightTeam }: { slot: BracketSlot; highlightTeam?: string | null }) {
  const label = slot.type === "team" ? slot.team ?? slot.label : slot.label;
  const highlighted = slot.team === highlightTeam;
  return (
    <div className={`flex min-h-8 items-center gap-2 truncate text-sm ${highlighted ? "text-[var(--accent)] font-semibold" : ""}`}>
      {slot.badge ? (
        <Image src={slot.badge} alt="" width={18} height={18} className="rounded-full" />
      ) : slot.type === "team" ? (
        <span>{flagEmoji(label)}</span>
      ) : (
        <span className="text-[var(--muted)]">?</span>
      )}
      <span className={slot.type === "placeholder" ? "text-[var(--muted)] italic" : ""}>{label}</span>
    </div>
  );
}

export function BracketMatchCard({
  match,
  compact = false,
  highlightTeam,
  onSelect,
}: {
  match: BracketMatch;
  compact?: boolean;
  highlightTeam?: string | null;
  onSelect?: (match: BracketMatch) => void;
}) {
  const score =
    match.homeScore !== null && match.awayScore !== null
      ? `${match.homeScore}:${match.awayScore}`
      : null;

  const highlighted =
    match.home.team === highlightTeam || match.away.team === highlightTeam;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(match)}
      className={`glass w-full rounded-xl border text-left transition hover:border-[var(--accent)]/50 ${
        match.status === "live" ? "border-[var(--live)]/60" : "border-[var(--border)]"
      } ${highlighted ? "ring-1 ring-[var(--accent)]/50" : ""} ${compact ? "p-2" : "p-3"}`}
    >
      <div className="mb-2 flex items-center justify-between text-[10px] text-[var(--muted)]">
        <span>Spiel {match.matchNo}</span>
        {match.status === "live" && <span className="text-[var(--live)] live-pulse">LIVE</span>}
      </div>
      <SlotLine slot={match.home} highlightTeam={highlightTeam} />
      <div className="my-1 flex items-center justify-center font-mono text-xs text-[var(--gold)]">
        {score ?? "vs"}
      </div>
      <SlotLine slot={match.away} highlightTeam={highlightTeam} />
    </button>
  );
}
