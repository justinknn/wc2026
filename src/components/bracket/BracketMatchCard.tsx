"use client";

import Image from "next/image";
import type { BracketMatch, BracketSlot } from "@/lib/types";
import { flagEmoji } from "@/lib/teams";

function SlotLine({ slot }: { slot: BracketSlot }) {
  const label = slot.type === "team" ? slot.team ?? slot.label : slot.label;
  return (
    <div className="flex min-h-8 items-center gap-2 truncate text-sm">
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
  onSelect,
}: {
  match: BracketMatch;
  compact?: boolean;
  onSelect?: (match: BracketMatch) => void;
}) {
  const score =
    match.homeScore !== null && match.awayScore !== null
      ? `${match.homeScore}:${match.awayScore}`
      : null;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(match)}
      className={`glass w-full rounded-xl border text-left transition hover:border-[var(--accent)]/50 ${
        match.status === "live" ? "border-[var(--live)]/60" : "border-[var(--border)]"
      } ${compact ? "p-2" : "p-3"}`}
    >
      <div className="mb-2 flex items-center justify-between text-[10px] text-[var(--muted)]">
        <span>Spiel {match.matchNo}</span>
        {match.status === "live" && <span className="text-[var(--live)] live-pulse">LIVE</span>}
      </div>
      <SlotLine slot={match.home} />
      <div className="my-1 flex items-center justify-center font-mono text-xs text-[var(--gold)]">
        {score ?? "vs"}
      </div>
      <SlotLine slot={match.away} />
    </button>
  );
}
