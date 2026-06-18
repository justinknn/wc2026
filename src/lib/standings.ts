import type { GroupId, GroupStanding, TeamStanding, TournamentMatch } from "@/lib/types";
import { GROUP_IDS, normalizeTeam } from "@/lib/teams";
import tournamentStatic from "@/data/tournament-static.json";

function initStanding(team: string): TeamStanding {
  return {
    team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    fairPlay: 0,
    yellowCards: 0,
    redCards: 0,
    position: 0,
    form: [],
  };
}

function compareStandings(a: TeamStanding, b: TeamStanding): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  if (a.fairPlay !== b.fairPlay) return b.fairPlay - a.fairPlay;
  return a.team.localeCompare(b.team);
}

function headToHeadStats(teams: string[], matches: TournamentMatch[]) {
  const stats = new Map<string, { points: number; gd: number; gf: number }>();
  for (const team of teams) stats.set(team, { points: 0, gd: 0, gf: 0 });

  for (const match of matches) {
    if (match.homeScore === null || match.awayScore === null) continue;
    if (!teams.includes(match.homeTeam) || !teams.includes(match.awayTeam)) continue;

    const home = stats.get(match.homeTeam)!;
    const away = stats.get(match.awayTeam)!;
    home.gf += match.homeScore;
    home.gd += match.homeScore - match.awayScore;
    away.gf += match.awayScore;
    away.gd += match.awayScore - match.homeScore;

    if (match.homeScore > match.awayScore) home.points += 3;
    else if (match.homeScore < match.awayScore) away.points += 3;
    else {
      home.points += 1;
      away.points += 1;
    }
  }

  return stats;
}

function resolveTiedGroup(tied: TeamStanding[], groupMatches: TournamentMatch[]): TeamStanding[] {
  if (tied.length <= 1) return tied;

  const h2h = headToHeadStats(
    tied.map((t) => t.team),
    groupMatches,
  );

  const withH2H = tied.map((team) => {
    const stats = h2h.get(team.team) ?? { points: 0, gd: 0, gf: 0 };
    return { ...team, h2hPoints: stats.points, h2hGd: stats.gd, h2hGf: stats.gf };
  });

  withH2H.sort((a, b) => {
    if (b.h2hPoints !== a.h2hPoints) return b.h2hPoints - a.h2hPoints;
    if (b.h2hGd !== a.h2hGd) return b.h2hGd - a.h2hGd;
    if (b.h2hGf !== a.h2hGf) return b.h2hGf - a.h2hGf;
    if (a.fairPlay !== b.fairPlay) return b.fairPlay - a.fairPlay;
    return a.team.localeCompare(b.team);
  });

  return withH2H.map((team, index) => {
    const note =
      index > 0 &&
      team.points === tied[0].points &&
      team.goalDifference === tied[0].goalDifference &&
      team.goalsFor === tied[0].goalsFor &&
      team.fairPlay !== tied[0].fairPlay
        ? `Fair-Play: ${team.fairPlay} vs ${tied[0].fairPlay}`
        : team.tiebreakerNote;

    const { h2hPoints: _hp, h2hGd: _hg, h2hGf: _hf, ...rest } = team;
    return { ...rest, tiebreakerNote: note };
  });
}

function sortGroupTeams(teams: TeamStanding[], groupMatches: TournamentMatch[]): TeamStanding[] {
  const sorted = [...teams].sort(compareStandings);
  const result: TeamStanding[] = [];
  let i = 0;

  while (i < sorted.length) {
    let j = i + 1;
    while (
      j < sorted.length &&
      sorted[j].points === sorted[i].points &&
      sorted[j].goalDifference === sorted[i].goalDifference &&
      sorted[j].goalsFor === sorted[i].goalsFor &&
      sorted[j].fairPlay === sorted[i].fairPlay
    ) {
      j++;
    }
    result.push(...resolveTiedGroup(sorted.slice(i, j), groupMatches));
    i = j;
  }

  return result.map((team, index) => ({ ...team, position: index + 1 }));
}

export function getGroupTeams(): Record<GroupId, string[]> {
  const groups = tournamentStatic.groups as Record<string, string[]>;
  const result = {} as Record<GroupId, string[]>;
  for (const id of GROUP_IDS) {
    result[id] = (groups[id] ?? []).map(normalizeTeam);
  }
  return result;
}

export function computeGroupStandings(matches: TournamentMatch[]): GroupStanding[] {
  const groupTeams = getGroupTeams();
  const standingsMap = new Map<GroupId, Map<string, TeamStanding>>();

  for (const id of GROUP_IDS) {
    const map = new Map<string, TeamStanding>();
    for (const team of groupTeams[id]) map.set(team, initStanding(team));
    standingsMap.set(id, map);
  }

  const groupMatches = matches.filter((m) => m.stage === "group" && m.group);

  for (const match of groupMatches) {
    if (match.homeScore === null || match.awayScore === null) continue;
    const table = standingsMap.get(match.group!)!;
    const home = table.get(match.homeTeam);
    const away = table.get(match.awayTeam);
    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;
    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;
    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;
    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;

    if (match.homeScore > match.awayScore) {
      home.won += 1;
      home.points += 3;
      home.form.unshift("W");
      away.lost += 1;
      away.form.unshift("L");
    } else if (match.homeScore < match.awayScore) {
      away.won += 1;
      away.points += 3;
      away.form.unshift("W");
      home.lost += 1;
      home.form.unshift("L");
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
      home.form.unshift("D");
      away.form.unshift("D");
    }

    for (const event of match.events ?? []) {
      const target = event.team === "home" ? home : away;
      if (event.type === "yellow") {
        target.yellowCards += 1;
        target.fairPlay -= 1;
      }
      if (event.type === "red") {
        target.redCards += 1;
        target.fairPlay -= event.detail?.includes("second") ? 3 : 4;
      }
    }
  }

  return GROUP_IDS.map((group) => {
    const table = standingsMap.get(group)!;
    const teams = sortGroupTeams(
      Array.from(table.values()),
      groupMatches.filter((m) => m.group === group),
    );
    return { group, teams };
  });
}

export function getAdvancingThirdGroups(groups: GroupStanding[]): GroupId[] {
  const thirds = groups.flatMap((g) =>
    g.teams[2] ? [{ group: g.group, team: g.teams[2] }] : [],
  );

  thirds.sort((a, b) => compareStandings(a.team, b.team));
  return thirds.slice(0, 8).map((entry) => entry.group);
}
