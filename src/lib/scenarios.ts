import type { GroupId, GroupStanding, TeamScenario, TournamentMatch } from "@/lib/types";
import { buildBracket } from "@/lib/bracket";
import { computeGroupStandings, getAdvancingThirdGroups } from "@/lib/standings";
type Outcome = "home" | "draw" | "away";

function remainingGroupMatches(matches: TournamentMatch[], group: GroupId) {
  return matches.filter((m) => m.group === group && m.homeScore === null);
}

function applyOutcome(match: TournamentMatch, outcome: Outcome): TournamentMatch {
  const [homeScore, awayScore] =
    outcome === "home" ? [1, 0] : outcome === "away" ? [0, 1] : [0, 0];
  return { ...match, homeScore, awayScore, status: "finished" };
}

function enumerateOutcomes(count: number): Outcome[][] {
  if (count === 0) return [[]];
  const smaller = enumerateOutcomes(count - 1);
  const results: Outcome[][] = [];
  for (const tail of smaller) {
    for (const outcome of ["home", "draw", "away"] as Outcome[]) {
      results.push([outcome, ...tail]);
    }
  }
  return results;
}

function simulateGroupOutcomes(
  matches: TournamentMatch[],
  group: GroupId,
  outcomes: Outcome[],
): GroupStanding {
  const pending = remainingGroupMatches(matches, group);
  const simulated = [...matches];
  for (let i = 0; i < pending.length; i++) {
    const idx = simulated.findIndex((m) => m.id === pending[i].id);
    if (idx >= 0) simulated[idx] = applyOutcome(pending[i], outcomes[i]);
  }
  return computeGroupStandings(simulated).find((g) => g.group === group)!;
}

function teamPosition(group: GroupStanding, team: string): number {
  return group.teams.find((t) => t.team === team)?.position ?? 99;
}

function isThirdQualified(groups: GroupStanding[], group: GroupId): boolean {
  return getAdvancingThirdGroups(groups).includes(group);
}

function nextMatchForTeam(matches: TournamentMatch[], team: string) {
  const upcoming = matches
    .filter((m) => m.stage === "group" && m.homeScore === null)
    .filter((m) => m.homeTeam === team || m.awayTeam === team)
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff))[0];

  if (!upcoming) return undefined;

  return {
    opponent: upcoming.homeTeam === team ? upcoming.awayTeam : upcoming.homeTeam,
    kickoff: upcoming.kickoff,
    isHome: upcoming.homeTeam === team,
    match: upcoming,
  };
}

function buildScenarioMessages(
  team: string,
  group: GroupId,
  stats: {
    top2: number;
    thirdAdvances: number;
    eliminated: number;
    total: number;
  },
  standing: GroupStanding["teams"][0],
  next?: ReturnType<typeof nextMatchForTeam>,
): { status: TeamScenario["status"]; summary: string; scenarios: string[] } {
  const scenarios: string[] = [];
  const { top2, thirdAdvances, eliminated, total } = stats;
  const qualRate = Math.round(((top2 + thirdAdvances) / total) * 100);

  if (top2 === total) {
    return {
      status: "qualified",
      summary: `${team} ist als Gruppen-${standing.position <= 2 ? "Top-2" : "Platz"} mathematisch für das Achtelfinale qualifiziert.`,
      scenarios: ["Qualifikation über die Top 2 ist in allen verbleibenden Szenarien gesichert."],
    };
  }

  if (top2 + thirdAdvances === 0) {
    return {
      status: "eliminated",
      summary: `${team} kann das Achtelfinale in keinem verbleibenden Gruppenszenario mehr erreichen.`,
      scenarios: ["Ausscheiden steht in allen simulierten Ausgängen der restlichen Gruppenspiele fest."],
    };
  }

  if (next) {
    scenarios.push(
      `Nächstes Spiel: ${next.isHome ? "Heim" : "Auswärts"} gegen ${next.opponent} (${new Date(next.kickoff).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })})`,
    );
  }

  if (top2 > 0) {
    scenarios.push(
      `In ${top2} von ${total} Szenarien (${Math.round((top2 / total) * 100)}%) reicht Platz 1 oder 2.`,
    );
  }

  if (thirdAdvances > 0) {
    scenarios.push(
      `In ${thirdAdvances} von ${total} Szenarien qualifiziert sich der 3. Platz als eine der 8 besten Dritten (Annex C).`,
    );
  }

  if (eliminated > 0) {
    scenarios.push(
      `In ${eliminated} von ${total} Szenarien (${Math.round((eliminated / total) * 100)}%) scheidet ${team} aus.`,
    );
  }

  if (standing.tiebreakerNote) {
    scenarios.push(`Tiebreaker-Hinweis: ${standing.tiebreakerNote}`);
  }

  if (standing.yellowCards > 0 || standing.fairPlay !== 0) {
    scenarios.push(
      `Fair-Play: ${standing.fairPlay} Punkte (${standing.yellowCards} Gelb, ${standing.redCards} Rot) – kann bei Punktgleichheit entscheiden.`,
    );
  }

  let status: TeamScenario["status"] = "in_contention";
  if (qualRate >= 75) status = "likely";
  if (qualRate <= 25) status = "unlikely";

  return {
    status,
    summary: `${team} hat aktuell eine K.-o.-Chance von ca. ${qualRate}% über alle verbleibenden Gruppenszenarien.`,
    scenarios,
  };
}

export function computeTeamScenarios(
  matches: TournamentMatch[],
  groups: GroupStanding[],
): TeamScenario[] {
  const scenarios: TeamScenario[] = [];

  for (const groupStanding of groups) {
    const pending = remainingGroupMatches(matches, groupStanding.group);
    const outcomeCombos = enumerateOutcomes(pending.length);

    for (const teamStanding of groupStanding.teams) {
      const team = teamStanding.team;
      let top2 = 0;
      let thirdAdvances = 0;
      let eliminated = 0;

      if (pending.length === 0) {
        const allGroups = groups;
        const pos = teamStanding.position;
        if (pos <= 2) top2 = 1;
        else if (pos === 3 && isThirdQualified(allGroups, groupStanding.group)) thirdAdvances = 1;
        else eliminated = 1;
      } else {
        for (const outcomes of outcomeCombos) {
          const simulatedGroup = simulateGroupOutcomes(matches, groupStanding.group, outcomes);
          const allGroups = groups.map((g) =>
            g.group === groupStanding.group ? simulatedGroup : g,
          );
          const pos = teamPosition(simulatedGroup, team);

          if (pos <= 2) top2 += 1;
          else if (pos === 3 && isThirdQualified(allGroups, groupStanding.group)) thirdAdvances += 1;
          else eliminated += 1;
        }
      }

      const total = top2 + thirdAdvances + eliminated || 1;
      const next = nextMatchForTeam(matches, team);
      const { status, summary, scenarios: lines } = buildScenarioMessages(
        team,
        groupStanding.group,
        { top2, thirdAdvances, eliminated, total },
        teamStanding,
        next,
      );

      let knockoutPath: string | undefined;
      if (status !== "eliminated") {
        const bracket = buildBracket(groups, matches);
        const r32 = bracket.matches.find(
          (m) =>
            m.roundKey === "r32" &&
            (m.home.team === team || m.away.team === team),
        );
        if (r32) {
          knockoutPath = `Projiziert: Spiel ${r32.matchNo} (${r32.home.label} vs ${r32.away.label})`;
        }
      }

      scenarios.push({
        team,
        group: groupStanding.group,
        position: teamStanding.position,
        points: teamStanding.points,
        played: teamStanding.played,
        remaining: 3 - teamStanding.played,
        status,
        summary,
        scenarios: lines,
        knockoutPath,
        nextMatch: next
          ? {
              opponent: next.opponent,
              kickoff: next.kickoff,
              isHome: next.isHome,
            }
          : undefined,
        fairPlayNote:
          teamStanding.tiebreakerNote ??
          (teamStanding.fairPlay !== 0
            ? `Fair-Play: ${teamStanding.fairPlay}`
            : undefined),
        qualificationChance: Math.round(((top2 + thirdAdvances) / total) * 100),
      });
    }
  }

  return scenarios.sort((a, b) => {
    const statusOrder = { qualified: 0, likely: 1, in_contention: 2, unlikely: 3, eliminated: 4 };
    const diff = statusOrder[a.status] - statusOrder[b.status];
    if (diff !== 0) return diff;
    return b.qualificationChance - a.qualificationChance;
  });
}

export function getLiveScenarioUpdates(
  scenarios: TeamScenario[],
  liveMatches: TournamentMatch[],
): TeamScenario[] {
  if (liveMatches.length === 0) return scenarios;

  return scenarios.map((scenario) => {
    const live = liveMatches.find(
      (m) =>
        m.group === scenario.group &&
        (m.homeTeam === scenario.team || m.awayTeam === scenario.team),
    );
    if (!live) return scenario;

    return {
      ...scenario,
      summary: `LIVE: ${scenario.team} spielt gerade (${live.homeScore ?? 0}:${live.awayScore ?? 0}). ${scenario.summary}`,
      scenarios: [
        `Laufendes Spiel gegen ${live.homeTeam === scenario.team ? live.awayTeam : live.homeTeam}.`,
        ...scenario.scenarios,
      ],
    };
  });
}
