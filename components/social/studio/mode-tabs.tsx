"use client";

import type { Stream } from "@/types/social";

type BuilderMode = "fixture" | "custom";
type WorkflowMode = "quick" | "full";
type ComposeMode = "single" | "summary";
type ViewMode = "upcoming" | "results";

type Props = {
  builderMode: BuilderMode;
  setBuilderMode: (value: BuilderMode) => void;
  workflowMode: WorkflowMode;
  setWorkflowMode: (value: WorkflowMode) => void;
  composeMode: ComposeMode;
  setComposeMode: (value: ComposeMode) => void;
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
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
  builderMode,
  setBuilderMode,
  workflowMode,
  setWorkflowMode,
  composeMode,
  setComposeMode,
  viewMode,
  setViewMode,
  stream,
  setStream,
  streamOptions
}: Props) {
  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-command-accent">Builder</p>
        <div className="grid grid-cols-2 gap-2">
          <ToggleButton active={builderMode === "fixture"} onClick={() => setBuilderMode("fixture")}>Fixtures</ToggleButton>
          <ToggleButton active={builderMode === "custom"} onClick={() => setBuilderMode("custom")}>Custom Post</ToggleButton>
        </div>
      </section>

      {builderMode === "fixture" ? (
        <>
          <section className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-command-accent">Workflow</p>
            <div className="grid grid-cols-2 gap-2">
              <ToggleButton active={workflowMode === "quick"} onClick={() => setWorkflowMode("quick")}>Quick Post</ToggleButton>
              <ToggleButton active={workflowMode === "full"} onClick={() => setWorkflowMode("full")}>Full Mode</ToggleButton>
            </div>
          </section>

          {workflowMode === "full" ? (
            <section className="space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-command-accent">Generator Mode</p>
              <div className="grid grid-cols-2 gap-2">
                <ToggleButton active={composeMode === "single"} onClick={() => setComposeMode("single")}>Single</ToggleButton>
                <ToggleButton active={composeMode === "summary"} onClick={() => setComposeMode("summary")}>Round Summary</ToggleButton>
              </div>
            </section>
          ) : null}

          <section className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-command-accent">Fixture Feed</p>
            <div className="grid grid-cols-2 gap-2">
              <ToggleButton active={viewMode === "upcoming"} onClick={() => setViewMode("upcoming")}>Upcoming</ToggleButton>
              <ToggleButton active={viewMode === "results"} onClick={() => setViewMode("results")}>Results</ToggleButton>
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
        </>
      ) : null}
    </div>
  );
}
