"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "wc2026-followed-team";

export function useFollowedTeam() {
  const [followedTeam, setFollowedTeamState] = useState<string | null>(null);

  useEffect(() => {
    setFollowedTeamState(localStorage.getItem(STORAGE_KEY));
  }, []);

  const setFollowedTeam = (team: string | null) => {
    if (team) localStorage.setItem(STORAGE_KEY, team);
    else localStorage.removeItem(STORAGE_KEY);
    setFollowedTeamState(team);
  };

  return { followedTeam, setFollowedTeam, isFollowing: (team: string) => followedTeam === team };
}
