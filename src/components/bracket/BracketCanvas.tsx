"use client";

import { useEffect, useRef, useState } from "react";
import type { BracketData, BracketMatch } from "@/lib/types";
import { ROUND_LABELS, ROUND_ORDER } from "@/lib/teams";
import { BracketMatchCard } from "@/components/bracket/BracketMatchCard";

interface BracketCanvasProps {
  bracket: BracketData;
  onSelectMatch?: (match: BracketMatch) => void;
}

export function BracketCanvas({ bracket, onSelectMatch }: BracketCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.72);
  const [offset, setOffset] = useState({ x: 24, y: 24 });
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const rounds = ROUND_ORDER.map((key) => ({
    key,
    label: ROUND_LABELS[key],
    matches: bracket.matches.filter((m) => m.roundKey === key),
  })).filter((round) => round.matches.length > 0);

  useEffect(() => {
    const fit = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const needed = rounds.length * 260 + 120;
      setScale(Math.min(1, Math.max(0.45, (width - 48) / needed)));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [rounds.length]);

  const onPointerDown = (event: React.PointerEvent) => {
    dragRef.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragRef.current) return;
    setOffset({
      x: dragRef.current.ox + (event.clientX - dragRef.current.x),
      y: dragRef.current.oy + (event.clientY - dragRef.current.y),
    });
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const onWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    setScale((prev) => Math.min(1.4, Math.max(0.35, prev - event.deltaY * 0.001)));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Turnierbaum</h2>
          <p className="text-sm text-[var(--muted)]">
            {bracket.isProjected ? "Projektion basierend auf aktuellen Gruppenständen" : "Finaler Baum"}
            {bracket.annexKey ? ` · Annex C: ${bracket.annexKey}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.35, s - 0.1))}
            className="rounded-lg bg-[var(--surface)] px-3 py-2 text-sm"
          >
            −
          </button>
          <span className="min-w-12 text-center font-mono text-sm">{Math.round(scale * 100)}%</span>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(1.4, s + 0.1))}
            className="rounded-lg bg-[var(--surface)] px-3 py-2 text-sm"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => {
              setScale(0.72);
              setOffset({ x: 24, y: 24 });
            }}
            className="rounded-lg bg-[var(--surface)] px-3 py-2 text-sm"
          >
            Zurücksetzen
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative h-[68vh] min-h-[480px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_70%,transparent)]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
      >
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
          className="flex min-w-max gap-8 p-6"
        >
          {rounds.map((round, roundIndex) => (
            <div key={round.key} className="flex w-56 flex-col">
              <h3 className="mb-4 text-center text-sm font-semibold text-[var(--gold)]">{round.label}</h3>
              <div
                className="flex flex-1 flex-col justify-around gap-4"
                style={{ minHeight: `${Math.pow(2, rounds.length - roundIndex - 1) * 96}px` }}
              >
                {round.matches.map((match) => (
                  <div key={match.id} className="relative">
                    <BracketMatchCard match={match} onSelect={onSelectMatch} />
                    {roundIndex < rounds.length - 1 && (
                      <span className="absolute right-[-18px] top-1/2 hidden h-px w-4 bg-[var(--border)] lg:block" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
