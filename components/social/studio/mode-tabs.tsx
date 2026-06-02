"use client";

import type { SocialEditorRoute } from "@/lib/social/editor-route";
import type { Stream } from "@/types/social";

type ComposeMode = "single" | "summary";

type Props = {
  route: SocialEditorRoute;
  composeMode: ComposeMode;
  setComposeMode: (value: ComposeMode) => void;
  stream: Stream;
  setStream: (value: Stream) => void;
  streamOptions: { label: string; value: Stream }[];
};

function ToggleButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
        active ? "bg-command-accent text-black" : "border border-white/15 text-command-muted hover:border-command-accent/50 hover:text-command-text"
      }`}
    >
      {children}
    </button>
  );
}

export function ModeTabs({
  route,
  composeMode,
  setComposeMode,
  stream,
  setStream,
  streamOptions
}: Props) {
  if (route === "custom") {
    return null;
  }

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-command-accent">Post Format</p>
        <div className="grid grid-cols-2 gap-2">
          <ToggleButton active={composeMode === "single"} onClick={() => setComposeMode("single")}>Single</ToggleButton>
          <ToggleButton active={composeMode === "summary"} onClick={() => setComposeMode("summary")}>Round Summary</ToggleButton>
        </div>
      </section>

      <label className="space-y-1">
        <span className="text-xs text-command-muted">Stream</span>
        <select value={stream} onChange={(event) => setStream(event.target.value as Stream)} className="w-full rounded-md border border-white/15 bg-black/20 p-2 text-sm">
          {streamOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
