import { NextResponse } from "next/server";
import { fetchAllMatches } from "@/lib/api";
import { buildBracket } from "@/lib/bracket";
import { computeTeamScenarios, getLiveScenarioUpdates } from "@/lib/scenarios";
import { computeGroupStandings } from "@/lib/standings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const matches = await fetchAllMatches();
    const groups = computeGroupStandings(matches);
    const bracket = buildBracket(groups, matches);
    const liveMatches = matches.filter((m) => m.status === "live");
    const scenarios = getLiveScenarioUpdates(
      computeTeamScenarios(matches, groups),
      liveMatches,
    );

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      groups,
      matches,
      liveMatches,
      bracket,
      scenarios,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unbekannter Fehler" },
      { status: 500 },
    );
  }
}
