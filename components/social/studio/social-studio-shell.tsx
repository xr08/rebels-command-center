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
    <div className="grid grid-cols-1 gap-4 pb-24 lg:grid-cols-[380px_minmax(0,1fr)]">
      <aside className="glass-panel rounded-2xl p-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
        {controls}
      </aside>

      <section className="min-w-0 space-y-4">
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

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-4">
            <ExportActions {...actions} />
            {preview}
          </div>
          <div className="space-y-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto xl:pr-1">
            {setup}
            {caption}
          </div>
        </div>

        {exportFrame}
      </section>
    </div>
  );
}
