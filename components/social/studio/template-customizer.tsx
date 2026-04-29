"use client";

import type { SocialTemplateCustomizations } from "@/types/social-data";
import { Field } from "./field";

type Props = {
  value: SocialTemplateCustomizations;
  onChange: (value: SocialTemplateCustomizations) => void;
  sponsorSupported: boolean;
};

function setValue<K extends keyof SocialTemplateCustomizations>(
  current: SocialTemplateCustomizations,
  key: K,
  value: SocialTemplateCustomizations[K],
  onChange: (value: SocialTemplateCustomizations) => void
) {
  onChange({ ...current, [key]: value });
}

export function TemplateCustomizer({ value, onChange, sponsorSupported }: Props) {
  return (
    <section className="glass-panel rounded-2xl p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-command-accent">Safe Customisation</p>
      <div className="mt-3 space-y-3">
        <Field
          label="Headline Override"
          value={value.headlineOverride ?? ""}
          onChange={(next) => setValue(value, "headlineOverride", next, onChange)}
          placeholder="Leave blank for template default"
        />
        <Field
          label="Subheading Override"
          value={value.subheadingOverride ?? ""}
          onChange={(next) => setValue(value, "subheadingOverride", next, onChange)}
          placeholder="Leave blank for template default"
        />

        <div className="grid grid-cols-2 gap-2">
          <label className="inline-flex items-center gap-2 text-sm text-command-muted">
            <input type="checkbox" checked={value.showVenue !== false} onChange={(event) => setValue(value, "showVenue", event.target.checked, onChange)} />
            <span>Venue</span>
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-command-muted">
            <input type="checkbox" checked={value.showTime !== false} onChange={(event) => setValue(value, "showTime", event.target.checked, onChange)} />
            <span>Time</span>
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-command-muted">
            <input type="checkbox" checked={value.showRound !== false} onChange={(event) => setValue(value, "showRound", event.target.checked, onChange)} />
            <span>Round</span>
          </label>
          {sponsorSupported ? (
            <label className="inline-flex items-center gap-2 text-sm text-command-muted">
              <input type="checkbox" checked={value.showSponsorStrip !== false} onChange={(event) => setValue(value, "showSponsorStrip", event.target.checked, onChange)} />
              <span>Sponsor</span>
            </label>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="space-y-1">
            <span className="text-xs text-command-muted">Image Fit</span>
            <select
              value={value.backgroundFit ?? "cover"}
              onChange={(event) => setValue(value, "backgroundFit", event.target.value as SocialTemplateCustomizations["backgroundFit"], onChange)}
              className="w-full rounded-md border border-white/15 bg-black/20 p-2 text-sm"
            >
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs text-command-muted">Position</span>
            <select
              value={value.backgroundPosition ?? "center"}
              onChange={(event) => setValue(value, "backgroundPosition", event.target.value as SocialTemplateCustomizations["backgroundPosition"], onChange)}
              className="w-full rounded-md border border-white/15 bg-black/20 p-2 text-sm"
            >
              <option value="center">Center</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs text-command-muted">Overlay</span>
            <select
              value={value.overlayStrength ?? "medium"}
              onChange={(event) => setValue(value, "overlayStrength", event.target.value as SocialTemplateCustomizations["overlayStrength"], onChange)}
              className="w-full rounded-md border border-white/15 bg-black/20 p-2 text-sm"
            >
              <option value="none">None</option>
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="strong">Strong</option>
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}
