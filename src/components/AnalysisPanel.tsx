"use client";

import { useMemo, useState } from "react";
import type { TeamScenario } from "@/lib/types";
import { flagEmoji } from "@/lib/teams";
import { useFollowedTeam } from "@/hooks/useFollowedTeam";

const STATUS_LABELS: Record<TeamScenario["status"], string> = {
  qualified: "Qualifiziert",
  likely: "Wahrscheinlich",
  in_contention: "Im Rennen",
  unlikely: "Unwahrscheinlich",
  eliminated: "Ausgeschieden",
};

const STATUS_COLORS: Record<TeamScenario["status"], string> = {
  qualified: "text-[var(--accent)] border-[var(--accent)]/40 bg-[var(--accent)]/10",
  likely: "text-emerald-300 border-emerald-500/40 bg-emerald-500/10",
  in_contention: "text-[var(--gold)] border-[var(--gold)]/40 bg-[var(--gold)]/10",
  unlikely: "text-orange-300 border-orange-500/40 bg-orange-500/10",
  eliminated: "text-[var(--muted)] border-[var(--border)] bg-[var(--surface)]",
};

interface AnalysisPanelProps {
  scenarios: TeamScenario[];
}

export function AnalysisPanel({ scenarios }: AnalysisPanelProps) {
  const [query, setQuery] = useState("");
  const { followedTeam, setFollowedTeam } = useFollowedTeam();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return scenarios;
    return scenarios.filter(
      (s) => s.team.toLowerCase().includes(q) || s.group.toLowerCase().includes(q),
    );
  }, [query, scenarios]);

  const highlighted = followedTeam
    ? scenarios.find((s) => s.team === followedTeam)
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Qualifikations-Analyse</h2>
          <p className="text-sm text-[var(--muted)]">
            Simuliert alle verbleibenden Gruppenszenarien · Annex-C-Drittplatzierte inklusive
          </p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Team suchen (z. B. Portugal)"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)] md:max-w-xs"
        />
      </div>

      {highlighted && (
        <section className="glass rounded-2xl border border-[var(--accent)]/40 p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{flagEmoji(highlighted.team)}</span>
              <div>
                <h3 className="font-semibold">{highlighted.team}</h3>
                <p className="text-xs text-[var(--muted)]">
                  Gruppe {highlighted.group} · Platz {highlighted.position} · {highlighted.points} Pkt.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFollowedTeam(null)}
              className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]"
            >
              Nicht mehr folgen
            </button>
          </div>
          <ScenarioCard scenario={highlighted} featured />
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((scenario) => (
          <ScenarioCard
            key={`${scenario.group}-${scenario.team}`}
            scenario={scenario}
            isFollowed={followedTeam === scenario.team}
            onFollow={() => setFollowedTeam(scenario.team)}
          />
        ))}
      </div>
    </div>
  );
}

function ScenarioCard({
  scenario,
  featured = false,
  isFollowed = false,
  onFollow,
}: {
  scenario: TeamScenario;
  featured?: boolean;
  isFollowed?: boolean;
  onFollow?: () => void;
}) {
  return (
    <article
      className={`glass rounded-2xl p-4 ${featured ? "" : "transition hover:border-[var(--accent)]/30"} ${
        isFollowed ? "ring-1 ring-[var(--accent)]/50" : ""
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{flagEmoji(scenario.team)}</span>
          <div>
            <h3 className="font-medium">{scenario.team}</h3>
            <p className="text-xs text-[var(--muted)]">
              Gr. {scenario.group} · #{scenario.position} · {scenario.points} Pkt.
            </p>
          </div>
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_COLORS[scenario.status]}`}
        >
          {STATUS_LABELS[scenario.status]}
        </span>
      </div>

      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between text-xs text-[var(--muted)]">
          <span>K.-o.-Chance</span>
          <span className="font-mono text-white">{scenario.qualificationChance}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--gold)] transition-all duration-500"
            style={{ width: `${scenario.qualificationChance}%` }}
          />
        </div>
      </div>

      <p className="mb-3 text-sm leading-relaxed">{scenario.summary}</p>

      <ul className="space-y-1.5 text-xs text-[var(--muted)]">
        {scenario.scenarios.slice(0, featured ? 6 : 4).map((line) => (
          <li key={line} className="flex gap-2">
            <span className="text-[var(--accent)]">›</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {scenario.knockoutPath && (
        <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--gold)]">
          {scenario.knockoutPath}
        </p>
      )}

      {!featured && onFollow && (
        <button
          type="button"
          onClick={onFollow}
          className={`mt-4 w-full rounded-xl px-3 py-2 text-xs transition ${
            isFollowed
              ? "bg-[var(--accent)] text-black"
              : "border border-[var(--border)] text-[var(--muted)] hover:text-white"
          }`}
        >
          {isFollowed ? "★ Dein Team" : "Team folgen"}
        </button>
      )}
    </article>
  );
}
