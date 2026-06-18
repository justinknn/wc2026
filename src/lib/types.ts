export type GroupId =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L";

export type MatchStatus = "scheduled" | "live" | "finished" | "postponed";

export interface TeamStanding {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  fairPlay: number;
  yellowCards: number;
  redCards: number;
  position: number;
  form: ("W" | "D" | "L")[];
  tiebreakerNote?: string;
}

export interface GroupStanding {
  group: GroupId;
  teams: TeamStanding[];
}

export interface MatchEvent {
  type: "goal" | "yellow" | "red" | "substitution" | "other";
  minute: string;
  player?: string;
  team: "home" | "away";
  detail?: string;
}

export interface TournamentMatch {
  id: string;
  matchNo?: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  date: string;
  time?: string;
  kickoff: string;
  group?: GroupId;
  round: string;
  stage: "group" | "knockout";
  venue?: string;
  minute?: string;
  homeBadge?: string;
  awayBadge?: string;
  thumb?: string;
  poster?: string;
  videoUrl?: string;
  events?: MatchEvent[];
}

export interface BracketSlot {
  type: "team" | "winner" | "placeholder";
  team?: string;
  label: string;
  badge?: string;
  group?: GroupId;
  position?: 1 | 2 | 3;
}

export interface BracketMatch {
  id: string;
  matchNo: number;
  round: string;
  roundKey: "r32" | "r16" | "qf" | "sf" | "third" | "final";
  home: BracketSlot;
  away: BracketSlot;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  kickoff: string;
  venue?: string;
  winnerAdvancesTo?: number;
  feedsFrom?: [number, number];
  liveData?: TournamentMatch;
}

export interface BracketData {
  matches: BracketMatch[];
  advancingThirdGroups: GroupId[];
  annexKey: string | null;
  isProjected: boolean;
}

export type ScenarioStatus = "qualified" | "likely" | "in_contention" | "unlikely" | "eliminated";

export interface TeamScenario {
  team: string;
  group: GroupId;
  position: number;
  points: number;
  played: number;
  remaining: number;
  status: ScenarioStatus;
  summary: string;
  scenarios: string[];
  qualificationChance: number;
  knockoutPath?: string;
  fairPlayNote?: string;
  nextMatch?: {
    opponent: string;
    kickoff: string;
    isHome: boolean;
  };
}

export interface TournamentData {
  updatedAt: string;
  groups: GroupStanding[];
  matches: TournamentMatch[];
  liveMatches: TournamentMatch[];
  bracket: BracketData;
  scenarios: TeamScenario[];
}

export interface KnockoutTemplate {
  num: number;
  round: string;
  slot1: string;
  slot2: string;
  kickoff: string;
  ground: string;
}

export interface AnnexCData {
  _meta: { combinations: number };
  assignments: Record<string, Record<string, string>>;
}
