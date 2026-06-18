"use client";

import { useMemo, useState } from "react";
import type { BracketData, BracketMatch } from "@/lib/types";
import { ROUND_LABELS, ROUND_ORDER } from "@/lib/teams";
import { BracketMatchCard } from "@/components/bracket/BracketMatchCard";

interface RoundSwiperProps {
  bracket: BracketData;
  highlightTeam?: string | null;
  onSelectMatch?: (match: BracketMatch) => void;
}

export function RoundSwiper({ bracket, highlightTeam, onSelectMatch }: RoundSwiperProps) {
  const rounds = useMemo(
    () =>
      ROUND_ORDER.map((key) => ({
        key,
        label: ROUND_LABELS[key],
        matches: bracket.matches.filter((m) => m.roundKey === key),
      })).filter((round) => round.matches.length > 0),
    [bracket.matches],
  );

  const [index, setIndex] = useState(0);
  const current = rounds[index] ?? rounds[0];

  if (!current) {
    return <div className="glass rounded-2xl p-6 text-[var(--muted)]">Noch kein K.-o.-Baum verfügbar.</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Turnierbaum</h2>
        <p className="text-sm text-[var(--muted)]">
          Wische durch die Runden · {bracket.isProjected ? "Live-Projektion" : "Final"}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className="rounded-full bg-[var(--surface)] px-4 py-2 text-sm disabled:opacity-40"
        >
          Zurück
        </button>
        <div className="text-center">
          <p className="font-semibold text-[var(--gold)]">{current.label}</p>
          <div className="mt-2 flex justify-center gap-2">
            {rounds.map((round, i) => (
              <button
                key={round.key}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-2 w-2 rounded-full ${i === index ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
                aria-label={round.label}
              />
            ))}
          </div>
        </div>
        <button
          type="button"
          disabled={index >= rounds.length - 1}
          onClick={() => setIndex((i) => Math.min(rounds.length - 1, i + 1))}
          className="rounded-full bg-[var(--surface)] px-4 py-2 text-sm disabled:opacity-40"
        >
          Weiter
        </button>
      </div>

      <div className="grid gap-3">
        {current.matches.map((match) => (
          <BracketMatchCard key={match.id} match={match} highlightTeam={highlightTeam} onSelect={onSelectMatch} />
        ))}
      </div>

      {bracket.advancingThirdGroups.length > 0 && (
        <div className="glass rounded-2xl p-4 text-sm text-[var(--muted)]">
          <p className="mb-1 font-medium text-white">Aktuelle Top-8 Drittplatzierte (Gruppen)</p>
          <p>{bracket.advancingThirdGroups.join(", ")}</p>
        </div>
      )}
    </div>
  );
}
