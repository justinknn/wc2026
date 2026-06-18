"use client";

import type { BracketData, BracketMatch } from "@/lib/types";
import { BracketCanvas } from "@/components/bracket/BracketCanvas";
import { RoundSwiper } from "@/components/bracket/RoundSwiper";

interface BracketViewProps {
  bracket: BracketData;
  highlightTeam?: string | null;
  onSelectMatch?: (match: BracketMatch) => void;
}

export function BracketView({ bracket, highlightTeam, onSelectMatch }: BracketViewProps) {
  return (
    <>
      <div className="hidden lg:block">
        <BracketCanvas bracket={bracket} highlightTeam={highlightTeam} onSelectMatch={onSelectMatch} />
      </div>
      <div className="lg:hidden">
        <RoundSwiper bracket={bracket} highlightTeam={highlightTeam} onSelectMatch={onSelectMatch} />
      </div>
    </>
  );
}
