import type { GroupId, MatchStatus, TournamentMatch } from "@/lib/types";
import { normalizeTeam } from "@/lib/teams";
import tournamentStatic from "@/data/tournament-static.json";

const WCUP_API = "https://wcup2026.org/api/data.php";
const SPORTSDB_API = "https://www.thesportsdb.com/api/v1/json/3";
const OPENFOOTBALL_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

const CACHE_MS = 20_000;
let cache: { data: TournamentMatch[]; at: number } | null = null;

interface SportsDbEvent {
  idEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strStatus: string;
  dateEvent: string;
  strTime: string;
  strTimestamp: string;
  strVenue: string;
  strHomeTeamBadge?: string;
  strAwayTeamBadge?: string;
  strThumb?: string;
  strPoster?: string;
  strVideo?: string;
  intRound?: string;
}

function mapStatus(status: string): MatchStatus {
  const value = status.toUpperCase();
  if (["LIVE", "IN PLAY", "1H", "2H", "HT"].includes(value)) return "live";
  if (["FT", "FINISHED", "AET", "PEN"].includes(value)) return "finished";
  if (["POSTPONED", "CANC"].includes(value)) return "postponed";
  return "scheduled";
}

function parseScore(value: string | null): number | null {
  if (!value || value === "null") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function mapSportsDbEvent(event: SportsDbEvent): TournamentMatch {
  const round = event.intRound ? Number(event.intRound) : undefined;
  const ko = round
    ? (tournamentStatic.knockout as { num: number; round: string }[]).find((m) => m.num === round)
    : undefined;

  return {
    id: `sdb-${event.idEvent}`,
    matchNo: round && round >= 73 ? round : undefined,
    homeTeam: normalizeTeam(event.strHomeTeam),
    awayTeam: normalizeTeam(event.strAwayTeam),
    homeScore: parseScore(event.intHomeScore),
    awayScore: parseScore(event.intAwayScore),
    status: mapStatus(event.strStatus),
    date: event.dateEvent,
    time: event.strTime,
    kickoff: event.strTimestamp || `${event.dateEvent}T${event.strTime}`,
    round: ko?.round ?? `Spieltag ${event.intRound ?? "?"}`,
    stage: round && round >= 73 ? "knockout" : "group",
    venue: event.strVenue,
    homeBadge: event.strHomeTeamBadge,
    awayBadge: event.strAwayTeamBadge,
    thumb: event.strThumb,
    poster: event.strPoster,
    videoUrl: event.strVideo || undefined,
  };
}

function mapOpenFootballMatch(match: {
  date: string;
  time?: string;
  team1: string;
  team2: string;
  score?: { ft?: [number, number] };
  group?: string;
  ground?: string;
  round?: string;
}): TournamentMatch {
  const hasScore = Boolean(match.score?.ft);
  return {
    id: `of-${match.date}-${match.team1}-${match.team2}`,
    homeTeam: normalizeTeam(match.team1),
    awayTeam: normalizeTeam(match.team2),
    homeScore: hasScore ? match.score!.ft![0] : null,
    awayScore: hasScore ? match.score!.ft![1] : null,
    status: hasScore ? "finished" : "scheduled",
    date: match.date,
    time: match.time,
    kickoff: `${match.date}T00:00:00`,
    group: match.group?.replace("Group ", "") as GroupId | undefined,
    round: match.round ?? "Gruppenphase",
    stage: match.group ? "group" : "knockout",
    venue: match.ground,
  };
}

function matchKey(match: TournamentMatch): string {
  const teams = [match.homeTeam, match.awayTeam].sort().join("|");
  if (match.group) return `group:${match.group}:${teams}`;
  if (match.matchNo) return `ko:${match.matchNo}`;
  return `match:${match.date}:${teams}`;
}

function pickPreferredMatch(a: TournamentMatch, b: TournamentMatch): TournamentMatch {
  const scoreWeight = (match: TournamentMatch) =>
    match.homeScore !== null && match.awayScore !== null ? 10 : 0;
  const sourceWeight = (match: TournamentMatch) => (match.id.startsWith("sdb-") ? 2 : 1);
  const mediaWeight = (match: TournamentMatch) =>
    (match.homeBadge ? 1 : 0) + (match.thumb ? 1 : 0) + (match.videoUrl ? 1 : 0);

  const rank = (match: TournamentMatch) =>
    scoreWeight(match) * 100 + sourceWeight(match) * 10 + mediaWeight(match);

  return rank(b) > rank(a) ? { ...a, ...b } : { ...b, ...a };
}

function mergeMatches(primary: TournamentMatch[], secondary: TournamentMatch[]): TournamentMatch[] {
  const map = new Map<string, TournamentMatch>();

  for (const match of [...secondary, ...primary]) {
    const key = matchKey(match);
    const existing = map.get(key);
    map.set(key, existing ? pickPreferredMatch(existing, match) : match);
  }

  return Array.from(map.values()).sort((a, b) => a.kickoff.localeCompare(b.kickoff));
}

function applyGroups(matches: TournamentMatch[]): TournamentMatch[] {
  const groupTeams = tournamentStatic.groups as Record<string, string[]>;
  const teamToGroup = new Map<string, GroupId>();
  for (const [group, teams] of Object.entries(groupTeams)) {
    for (const team of teams) teamToGroup.set(normalizeTeam(team), group as GroupId);
  }
  return matches.map((match) => {
    if (match.group || match.stage === "knockout") return match;
    const homeGroup = teamToGroup.get(match.homeTeam);
    const awayGroup = teamToGroup.get(match.awayTeam);
    if (homeGroup && homeGroup === awayGroup) return { ...match, group: homeGroup, stage: "group" };
    return match;
  });
}

async function fetchSportsDbMatches(): Promise<TournamentMatch[]> {
  const res = await fetch(`${SPORTSDB_API}/eventsseason.php?id=4429&s=2026`, { next: { revalidate: 20 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.events ?? []).map((e: SportsDbEvent) => mapSportsDbEvent(e));
}

async function fetchOpenFootballMatches(): Promise<TournamentMatch[]> {
  const res = await fetch(OPENFOOTBALL_URL, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.matches ?? []).map(mapOpenFootballMatch);
}

async function fetchLiveStatus(): Promise<Map<string, MatchStatus>> {
  const res = await fetch(`${WCUP_API}?action=live`, { next: { revalidate: 15 } });
  if (!res.ok) return new Map();
  const data = await res.json();
  const map = new Map<string, MatchStatus>();
  for (const match of data.matches ?? []) {
    map.set(`${normalizeTeam(match.team1)}|${normalizeTeam(match.team2)}`, "live");
  }
  return map;
}

export async function fetchAllMatches(): Promise<TournamentMatch[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data;
  const [sportsDbRaw, openFootballRaw, liveStatus] = await Promise.all([
    fetchSportsDbMatches(),
    fetchOpenFootballMatches(),
    fetchLiveStatus(),
  ]);

  const sportsDb = applyGroups(sportsDbRaw);
  const openFootball = applyGroups(openFootballRaw);
  let merged = mergeMatches(sportsDb, openFootball);
  merged = merged.map((m) => {
    const direct = `${m.homeTeam}|${m.awayTeam}`;
    const reverse = `${m.awayTeam}|${m.homeTeam}`;
    if (liveStatus.has(direct) || liveStatus.has(reverse)) {
      return { ...m, status: "live" as const };
    }
    return m;
  });
  cache = { data: merged, at: Date.now() };
  return merged;
}

export async function fetchTournamentSnapshot() {
  const matches = await fetchAllMatches();
  return { matches, liveMatches: matches.filter((m) => m.status === "live"), updatedAt: new Date().toISOString() };
}
