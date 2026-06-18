"use client";

import { useQuery } from "@tanstack/react-query";
import type { TournamentData } from "@/lib/types";

export function useTournamentData() {
  return useQuery<TournamentData>({
    queryKey: ["tournament"],
    queryFn: async () => {
      const res = await fetch("/api/tournament");
      if (!res.ok) throw new Error("Daten konnten nicht geladen werden");
      return res.json();
    },
    refetchInterval: (query) => {
      const live = query.state.data?.liveMatches?.length ?? 0;
      return live > 0 ? 15_000 : 30_000;
    },
  });
}
