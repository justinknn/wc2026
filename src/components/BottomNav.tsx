"use client";

export type TabId = "groups" | "live" | "bracket" | "matches" | "analysis";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "groups", label: "Gruppen", icon: "▦" },
  { id: "live", label: "Live", icon: "●" },
  { id: "bracket", label: "Baum", icon: "⎇" },
  { id: "analysis", label: "Analyse", icon: "◈" },
  { id: "matches", label: "Spiele", icon: "☰" },
];

interface BottomNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
  liveCount: number;
}

export function BottomNav({ active, onChange, liveCount }: BottomNavProps) {
  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_94%,transparent)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative flex flex-col items-center gap-1 px-2 py-3 text-xs transition ${
                active === tab.id ? "text-[var(--accent)]" : "text-[var(--muted)]"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
              {tab.id === "live" && liveCount > 0 && (
                <span className="absolute right-5 top-2 h-2 w-2 rounded-full bg-[var(--live)] live-pulse" />
              )}
            </button>
          ))}
        </div>
      </nav>

      <nav className="sticky top-[73px] z-30 hidden border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_90%,transparent)] backdrop-blur-xl lg:block">
        <div className="mx-auto flex max-w-7xl gap-2 px-4 py-3">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                active === tab.id
                  ? "bg-[var(--accent)] text-black"
                  : "bg-[var(--surface)] text-[var(--muted)] hover:text-white"
              }`}
            >
              {tab.label}
              {tab.id === "live" && liveCount > 0 ? ` (${liveCount})` : ""}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
