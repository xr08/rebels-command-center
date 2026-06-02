"use client";

import { ExportActions } from "./export-actions";

type Props = {
  controls: React.ReactNode;
  setup: React.ReactNode;
  preview: React.ReactNode;
  caption: React.ReactNode;
  exportFrame: React.ReactNode;
  sourceIssues: string[];
  actions: {
    onGenerateCaption: () => void;
    onCopyCaption: () => void;
    onSaveDraft: () => void;
    onExport: () => void;
  };
};

export function SocialStudioShell({ controls, setup, preview, caption, exportFrame, sourceIssues, actions }: Props) {
  return (
    <div className="space-y-4 pb-24">
      {sourceIssues.length ? (
        <div className="rounded-xl border border-yellow-400/40 bg-yellow-400/10 p-3 text-xs text-yellow-100">
          <p className="font-semibold uppercase tracking-[0.12em]">Source Data Notice</p>
          <ul className="mt-2 space-y-1">
            {sourceIssues.slice(0, 4).map((issue) => (
              <li key={issue}>- {issue}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <ExportActions {...actions} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_340px] 2xl:grid-cols-[minmax(0,1.55fr)_360px]">
        <section className="min-w-0 space-y-4">
          {preview}
        </section>

        <aside className="space-y-4 xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto xl:pr-1">
          <div className="glass-panel rounded-2xl p-4">
            {controls}
          </div>
          {setup}
          {caption}
        </aside>
      </div>

      {exportFrame}
    </div>
  );
}
