import type { GroupStanding } from "@/lib/types";
import { flagEmoji } from "@/lib/teams";

export function GroupTables({ groups }: { groups: GroupStanding[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {groups.map((group) => (
        <section key={group.group} className="glass rounded-2xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Gruppe {group.group}</h2>
            <span className="text-xs text-[var(--muted)]">A–L Format</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[280px] text-sm">
              <thead className="text-left text-[var(--muted)]">
                <tr>
                  <th className="pb-2">#</th>
                  <th className="pb-2">Team</th>
                  <th className="pb-2 text-center">Sp</th>
                  <th className="pb-2 text-center">Pkt</th>
                  <th className="pb-2 text-center">TD</th>
                  <th className="pb-2 text-center">FP</th>
                </tr>
              </thead>
              <tbody>
                {group.teams.map((team, index) => (
                  <tr
                    key={team.team}
                    className={`border-t border-[var(--border)]/60 ${
                      index < 2 ? "text-white" : index === 2 ? "text-[var(--gold)]" : "text-[var(--muted)]"
                    }`}
                  >
                    <td className="py-2 pr-2 font-mono">{team.position}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <span>{flagEmoji(team.team)}</span>
                        <span className="truncate">{team.team}</span>
                      </div>
                      {team.tiebreakerNote && (
                        <p className="mt-1 text-[10px] text-[var(--gold)]">{team.tiebreakerNote}</p>
                      )}
                    </td>
                    <td className="py-2 text-center font-mono">{team.played}</td>
                    <td className="py-2 text-center font-mono font-semibold">{team.points}</td>
                    <td className="py-2 text-center font-mono">
                      {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                    </td>
                    <td className="py-2 text-center font-mono" title="Fair-Play-Punkte">
                      {team.fairPlay}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted)]">
            Top 2 qualifiziert · 3. Platz kann als eine der 8 besten Dritten ins Achtelfinale
          </p>
        </section>
      ))}
    </div>
  );
}
