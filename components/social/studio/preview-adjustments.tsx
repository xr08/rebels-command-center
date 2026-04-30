"use client";

import type { SocialTemplateCustomizations } from "@/types/social-data";

type Props = {
  value: SocialTemplateCustomizations;
  onChange: (value: SocialTemplateCustomizations) => void;
};

export function PreviewAdjustments({ value, onChange }: Props) {
  return (
    <section className="glass-panel rounded-2xl p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-command-accent">Live Preview Adjustments</p>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="space-y-1 md:col-span-2">
          <span className="text-xs text-command-muted">Overlay</span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={value.overlayOpacity ?? 34}
            onChange={(event) => onChange({ ...value, overlayOpacity: Number(event.target.value) })}
            className="w-full accent-[#FFCD00]"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-command-muted">Horizontal Position</span>
          <input
            type="range"
            min={0}
            max={100}
            value={value.backgroundPositionX ?? 50}
            onChange={(event) => onChange({ ...value, backgroundPositionX: Number(event.target.value) })}
            className="w-full accent-[#FFCD00]"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-command-muted">Vertical Position</span>
          <input
            type="range"
            min={0}
            max={100}
            value={value.backgroundPositionY ?? 50}
            onChange={(event) => onChange({ ...value, backgroundPositionY: Number(event.target.value) })}
            className="w-full accent-[#FFCD00]"
          />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="text-xs text-command-muted">Zoom</span>
          <input
            type="range"
            min={1}
            max={2.5}
            step={0.05}
            value={value.backgroundZoom ?? 1}
            onChange={(event) => onChange({ ...value, backgroundZoom: Number(event.target.value) })}
            className="w-full accent-[#FFCD00]"
          />
        </label>
      </div>
    </section>
  );
}
