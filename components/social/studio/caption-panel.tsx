"use client";

type Props = {
  caption: string;
  setCaption: (value: string) => void;
  rows: number;
  message: string;
  onGenerate: () => void;
  onCopy: () => void;
  onSaveDraft: () => void;
  onExport: () => void;
};

export function CaptionPanel({ caption, setCaption, rows, message, onGenerate, onCopy, onSaveDraft, onExport }: Props) {
  return (
    <section className="glass-panel rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-command-accent">Caption</h4>
        <button type="button" onClick={onGenerate} className="text-xs text-command-muted underline">
          Generate
        </button>
      </div>

      <textarea
        value={caption}
        onChange={(event) => setCaption(event.target.value)}
        rows={rows}
        className="w-full rounded-md border border-white/15 bg-black/20 p-2 text-sm"
        placeholder="Generate a caption, then edit before publishing."
      />

      <div className="mt-3 hidden flex-wrap gap-2 md:flex">
        <button type="button" onClick={onSaveDraft} className="rounded-md border border-white/15 px-3 py-2 text-sm font-semibold">
          Save Draft
        </button>
        <button type="button" onClick={onCopy} className="rounded-md border border-white/15 px-3 py-2 text-sm font-semibold">
          Copy Caption
        </button>
        <button type="button" onClick={onExport} className="rounded-md bg-command-accent px-3 py-2 text-sm font-semibold text-black">
          Export PNG
        </button>
      </div>

      {message ? <p className="mt-2 text-xs text-command-muted">{message}</p> : null}
    </section>
  );
}
