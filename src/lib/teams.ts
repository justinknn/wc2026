export const GROUP_IDS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
] as const;

export const TEAM_ALIASES: Record<string, string> = {
  "Bosnia-Herzegovina": "Bosnia & Herzegovina",
  "Bosnia and Herzegovina": "Bosnia & Herzegovina",
  "Korea Republic": "South Korea",
  Czechia: "Czech Republic",
  "Côte d'Ivoire": "Ivory Coast",
  "Cote d'Ivoire": "Ivory Coast",
  "Congo DR": "DR Congo",
  "United States": "USA",
  "United States of America": "USA",
  Curacao: "Curaçao",
  Turkiye: "Turkey",
  "Cabo Verde": "Cape Verde",
};

export function normalizeTeam(name: string): string {
  return TEAM_ALIASES[name.trim()] ?? name.trim();
}

export function groupLetter(group?: string): string | null {
  if (!group) return null;
  const match = group.match(/([A-L])$/i);
  return match ? match[1].toUpperCase() : null;
}

export function flagEmoji(team: string): string {
  const flags: Record<string, string> = {
    Mexico: "🇲🇽",
    "South Africa": "🇿🇦",
    "South Korea": "🇰🇷",
    "Czech Republic": "🇨🇿",
    Canada: "🇨🇦",
    "Bosnia & Herzegovina": "🇧🇦",
    Qatar: "🇶🇦",
    Switzerland: "🇨🇭",
    Brazil: "🇧🇷",
    Morocco: "🇲🇦",
    Haiti: "🇭🇹",
    Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    USA: "🇺🇸",
    Australia: "🇦🇺",
    Paraguay: "🇵🇾",
    Turkey: "🇹🇷",
    Turkiye: "🇹🇷",
    Germany: "🇩🇪",
    Ecuador: "🇪🇨",
    "Ivory Coast": "🇨🇮",
    Curaçao: "🇨🇼",
    Netherlands: "🇳🇱",
    Japan: "🇯🇵",
    Sweden: "🇸🇪",
    Tunisia: "🇹🇳",
    Belgium: "🇧🇪",
    Egypt: "🇪🇬",
    Iran: "🇮🇷",
    "New Zealand": "🇳🇿",
    Spain: "🇪🇸",
    Uruguay: "🇺🇾",
    "Saudi Arabia": "🇸🇦",
    "Cape Verde": "🇨🇻",
    France: "🇫🇷",
    Norway: "🇳🇴",
    Senegal: "🇸🇳",
    Iraq: "🇮🇶",
    Argentina: "🇦🇷",
    Austria: "🇦🇹",
    Algeria: "🇩🇿",
    Jordan: "🇯🇴",
    Portugal: "🇵🇹",
    Colombia: "🇨🇴",
    "DR Congo": "🇨🇩",
    Uzbekistan: "🇺🇿",
    England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    Croatia: "🇭🇷",
    Ghana: "🇬🇭",
    Panama: "🇵🇦",
  };
  return flags[normalizeTeam(team)] ?? "🏳️";
}

export const ROUND_LABELS: Record<string, string> = {
  r32: "Runde der 32",
  r16: "Achtelfinale",
  qf: "Viertelfinale",
  sf: "Halbfinale",
  third: "Spiel um Platz 3",
  final: "Finale",
};

export const ROUND_ORDER = ["r32", "r16", "qf", "sf", "final"] as const;
