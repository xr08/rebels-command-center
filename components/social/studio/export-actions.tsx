"use client";

type Props = {
  onGenerateCaption: () => void;
  onCopyCaption: () => void;
  onSaveDraft: () => void;
  onExport: () => void;
};

export function ExportActions({ onGenerateCaption, onCopyCaption, onSaveDraft, onExport }: Props) {
  return (
    <>
      <div className="sticky top-4 z-20 hidden gap-2 rounded-xl border border-white/15 bg-[#06160f]/90 p-2 shadow-premium backdrop-blur md:flex">
        <button type="button" onClick={onGenerateCaption} className="rounded-md border border-white/15 px-3 py-2 text-xs font-semibold text-command-muted hover:text-command-text">
          Caption
        </button>
        <button type="button" onClick={onCopyCaption} className="rounded-md border border-white/15 px-3 py-2 text-xs font-semibold text-command-muted hover:text-command-text">
          Copy
        </button>
        <button type="button" onClick={onSaveDraft} className="rounded-md border border-white/15 px-3 py-2 text-xs font-semibold text-command-muted hover:text-command-text">
          Save Draft
        </button>
        <button type="button" onClick={onExport} className="rounded-md bg-command-accent px-4 py-2 text-xs font-black text-black">
          Export PNG
        </button>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/15 bg-[#051b12]/95 p-3 backdrop-blur md:hidden">
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={onSaveDraft} className="rounded-md border border-white/20 px-3 py-3 text-xs font-semibold">
            Save Draft
          </button>
          <button type="button" onClick={onCopyCaption} className="rounded-md border border-white/20 px-3 py-3 text-xs font-semibold">
            Copy
          </button>
          <button type="button" onClick={onExport} className="rounded-md bg-command-accent px-3 py-3 text-xs font-black text-black">
            Export
          </button>
        </div>
      </div>
    </>
  );
}
