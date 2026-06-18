import annexCData from "@/data/annex-c-assignments.json";
import tournamentStatic from "@/data/tournament-static.json";
import type {
  AnnexCData,
  BracketData,
  BracketMatch,
  BracketSlot,
  GroupId,
  GroupStanding,
  KnockoutTemplate,
  TournamentMatch,
} from "@/lib/types";
import { getAdvancingThirdGroups } from "@/lib/standings";
import { normalizeTeam } from "@/lib/teams";

const annexC = annexCData as AnnexCData;
const knockoutTemplate = tournamentStatic.knockout as KnockoutTemplate[];

const ROUND_KEY_MAP: Record<string, BracketMatch["roundKey"]> = {
  "Round of 32": "r32",
  "Round of 16": "r16",
  Quarterfinal: "qf",
  Quarterfinals: "qf",
  "Semi-final": "sf",
  Semifinals: "sf",
  "Match for third place": "third",
  Final: "final",
};

const FEEDS_INTO: Record<number, number> = {
  73: 89, 74: 89, 75: 90, 76: 97, 77: 89, 78: 91, 79: 92, 80: 99,
  81: 94, 82: 94, 83: 96, 84: 93, 85: 95, 86: 93, 87: 95, 88: 96,
  89: 101, 90: 101, 91: 102, 92: 102, 93: 103, 94: 103, 95: 104, 96: 104,
  97: 98, 98: 104, 99: 100, 100: 100, 101: 104, 102: 104,
};

function teamFromGroup(groups: GroupStanding[], group: GroupId, position: 1 | 2 | 3): BracketSlot {
  const standing = groups.find((g) => g.group === group)?.teams[position - 1];
  if (!standing) {
    return { type: "placeholder", label: `${position}. Gruppe ${group}`, group, position };
  }
  return { type: "team", team: standing.team, label: standing.team, group, position };
}

function resolveAnnexThird(
  groups: GroupStanding[],
  advancingThirdGroups: GroupId[],
  groupWinner: GroupId,
): BracketSlot {
  const key = [...advancingThirdGroups].sort().join(",");
  const lookup = annexC.assignments[key];
  const thirdGroupCode = lookup?.[`1${groupWinner}`];
  if (!thirdGroupCode) return { type: "placeholder", label: "3. Platz (Annex C)" };
  const thirdGroup = thirdGroupCode.replace("3", "") as GroupId;
  return teamFromGroup(groups, thirdGroup, 3);
}

function parseSlot(slot: string, groups: GroupStanding[], advancingThirdGroups: GroupId[]): BracketSlot {
  if (slot.startsWith("W")) {
    return { type: "winner", label: `Sieger Spiel ${slot.slice(1)}` };
  }
  if (slot.startsWith("L")) {
    return { type: "winner", label: `Verlierer Spiel ${slot.slice(1)}` };
  }
  const groupPos = slot.match(/^([12])([A-L])$/);
  if (groupPos) {
    return teamFromGroup(groups, groupPos[2] as GroupId, Number(groupPos[1]) as 1 | 2);
  }
  if (slot.startsWith("3")) {
    const annexMatch = slot.match(/3rd place.*|3([A-L])/);
    if (annexMatch?.[1]) {
      return resolveAnnexThird(groups, advancingThirdGroups, annexMatch[1] as GroupId);
    }
    const groupWinner = slot.includes("/") ? null : (slot.replace("3", "") as GroupId);
    if (groupWinner && groupWinner.length === 1) {
      return resolveAnnexThird(groups, advancingThirdGroups, groupWinner);
    }
  }
  if (slot.includes("3rd") || slot.startsWith("3")) {
    const winnerLetter = slot.match(/1([A-L])/)?.[1] ?? slot.match(/^3([A-L])/)?.[1];
    if (winnerLetter) return resolveAnnexThird(groups, advancingThirdGroups, winnerLetter as GroupId);
  }
  return { type: "placeholder", label: slot };
}

function resolveWinnerSlot(slot: BracketSlot, matchResults: Map<number, TournamentMatch>): BracketSlot {
  if (slot.type !== "winner" || !slot.label.includes("Spiel")) return slot;
  const isLoser = slot.label.startsWith("Verlierer");
  const matchNo = Number(slot.label.match(/\d+/)?.[0]);
  const result = matchResults.get(matchNo);
  if (!result || result.homeScore === null || result.awayScore === null) return slot;
  if (result.homeScore === result.awayScore) return slot;

  const winner = result.homeScore > result.awayScore ? result.homeTeam : result.awayTeam;
  const team = isLoser ? (winner === result.homeTeam ? result.awayTeam : result.homeTeam) : winner;
  const badge =
    team === result.homeTeam ? result.homeBadge : team === result.awayTeam ? result.awayBadge : undefined;
  return { type: "team", team, label: team, badge };
}

function enrichSlot(slot: BracketSlot, liveMatch?: TournamentMatch): BracketSlot {
  if (slot.type !== "team" || !liveMatch) return slot;
  const badge =
    slot.team === liveMatch.homeTeam
      ? liveMatch.homeBadge
      : slot.team === liveMatch.awayTeam
        ? liveMatch.awayBadge
        : slot.badge;
  return { ...slot, badge };
}

const ANNEX_SLOT_MAP: Record<number, GroupId> = {
  74: "E", 77: "I", 79: "A", 80: "L", 81: "D", 82: "G", 85: "B", 87: "K",
};

function parseTemplateSlot(
  templateNum: number,
  slot: string,
  groups: GroupStanding[],
  advancingThirdGroups: GroupId[],
): BracketSlot {
  if (slot.startsWith("W") || slot.startsWith("L")) return parseSlot(slot, groups, advancingThirdGroups);
  const groupPos = slot.match(/^([12])([A-L])$/);
  if (groupPos) return teamFromGroup(groups, groupPos[2] as GroupId, Number(groupPos[1]) as 1 | 2);
  if (slot.startsWith("3") && ANNEX_SLOT_MAP[templateNum]) {
    return resolveAnnexThird(groups, advancingThirdGroups, ANNEX_SLOT_MAP[templateNum]);
  }
  return parseSlot(slot, groups, advancingThirdGroups);
}

export function buildBracket(groups: GroupStanding[], matches: TournamentMatch[]): BracketData {
  const advancingThirdGroups = getAdvancingThirdGroups(groups);
  const annexKey = advancingThirdGroups.length === 8 ? [...advancingThirdGroups].sort().join(",") : null;
  const matchResults = new Map<number, TournamentMatch>();
  for (const match of matches) if (match.matchNo) matchResults.set(match.matchNo, match);

  const groupStageComplete = groups.every((g) =>
    g.teams.length >= 4 && g.teams.every((t) => t && t.played >= 3),
  );

  const bracketMatches: BracketMatch[] = knockoutTemplate.map((template) => {
    let home = parseTemplateSlot(template.num, template.slot1, groups, advancingThirdGroups);
    let away = parseTemplateSlot(template.num, template.slot2, groups, advancingThirdGroups);
    home = resolveWinnerSlot(home, matchResults);
    away = resolveWinnerSlot(away, matchResults);
    const liveData = matchResults.get(template.num);
    home = enrichSlot(home, liveData);
    away = enrichSlot(away, liveData);

    return {
      id: `m${template.num}`,
      matchNo: template.num,
      round: template.round,
      roundKey: ROUND_KEY_MAP[template.round] ?? "r32",
      home,
      away,
      homeScore: liveData?.homeScore ?? null,
      awayScore: liveData?.awayScore ?? null,
      status: liveData?.status ?? "scheduled",
      kickoff: liveData?.kickoff ?? template.kickoff,
      venue: liveData?.venue ?? template.ground,
      winnerAdvancesTo: FEEDS_INTO[template.num],
      liveData,
    };
  });

  return { matches: bracketMatches, advancingThirdGroups, annexKey, isProjected: !groupStageComplete };
}

export function getTeamBadge(matches: TournamentMatch[], team: string): string | undefined {
  const normalized = normalizeTeam(team);
  for (const match of matches) {
    if (match.homeTeam === normalized && match.homeBadge) return match.homeBadge;
    if (match.awayTeam === normalized && match.awayBadge) return match.awayBadge;
  }
  return undefined;
}
