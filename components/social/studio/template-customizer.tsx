"use client";

import type { SocialTemplateCustomizations } from "@/types/social-data";
import { Field } from "./field";

type Props = {
  value: SocialTemplateCustomizations;
  onChange: (value: SocialTemplateCustomizations) => void;
  showListControls: boolean;
};

function setValue<K extends keyof SocialTemplateCustomizations>(
  current: SocialTemplateCustomizations,
  key: K,
  value: SocialTemplateCustomizations[K],
  onChange: (value: SocialTemplateCustomizations) => void
) {
  onChange({ ...current, [key]: value });
}

function formatRows(rows: SocialTemplateCustomizations["listRows"]) {
  return (rows ?? []).map((row) => `${row.label} | ${row.playerName}`).join("\n");
}

function parseRows(value: string): NonNullable<SocialTemplateCustomizations["listRows"]> {
  return value
    .split("\n")
    .map((line) => {
      const [label = "", ...nameParts] = line.split("|");
      return {
        type: (/^\d+$/.test(label.trim()) ? "number" : "position") as "number" | "position",
        label: label.trim(),
        playerName: nameParts.join("|").trim()
      };
    })
    .filter((row) => row.label || row.playerName);
}

function updateListRows(
  value: SocialTemplateCustomizations,
  onChange: (value: SocialTemplateCustomizations) => void,
  updater: (rows: NonNullable<SocialTemplateCustomizations["listRows"]>) => NonNullable<SocialTemplateCustomizations["listRows"]>
) {
  const currentRows = value.listRows ?? [];
  onChange({ ...value, listRows: updater(currentRows) });
}

export function TemplateCustomizer({ value, onChange, showListControls }: Props) {
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
            <span className="text-xs text-command-muted">Position Preset</span>
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

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="space-y-1">
            <span className="text-xs text-command-muted">Horizontal Position</span>
            <input
              type="range"
              min={0}
              max={100}
              value={value.backgroundPositionX ?? 50}
              onChange={(event) => setValue(value, "backgroundPositionX", Number(event.target.value), onChange)}
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
              onChange={(event) => setValue(value, "backgroundPositionY", Number(event.target.value), onChange)}
              className="w-full accent-[#FFCD00]"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-command-muted">Zoom</span>
            <input
              type="range"
              min={1}
              max={2.5}
              step={0.05}
              value={value.backgroundZoom ?? 1}
              onChange={(event) => setValue(value, "backgroundZoom", Number(event.target.value), onChange)}
              className="w-full accent-[#FFCD00]"
            />
          </label>
        </div>

        {showListControls ? (
          <div className="space-y-3 rounded-xl border border-white/10 bg-black/15 p-3">
            <Field
              label="List Title"
              value={value.listTitle ?? "TEAM LIST"}
              onChange={(next) => setValue(value, "listTitle", next, onChange)}
            />
            <Field
              label="List Subtitle"
              value={value.listSubtitle ?? ""}
              onChange={(next) => setValue(value, "listSubtitle", next, onChange)}
              placeholder="Optional"
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-command-muted">Team Rows</p>
                <button
                  type="button"
                  onClick={() => updateListRows(value, onChange, (rows) => [...rows, { type: "position", label: "", playerName: "" }])}
                  className="rounded-md border border-white/15 px-2 py-1 text-xs text-command-muted hover:text-command-text"
                >
                  Add Row
                </button>
              </div>

              {(value.listRows ?? []).map((row, index) => (
                <div key={`${index}-${row.label}-${row.playerName}`} className="grid grid-cols-[110px_1fr_1fr_auto] gap-2">
                  <select
                    value={row.type}
                    onChange={(event) => updateListRows(value, onChange, (rows) => rows.map((r, i) => (i === index ? { ...r, type: event.target.value as "position" | "number" } : r)))}
                    className="rounded-md border border-white/15 bg-black/20 p-2 text-sm"
                  >
                    <option value="position">Position</option>
                    <option value="number">Number</option>
                  </select>
                  <input
                    value={row.label}
                    onChange={(event) => updateListRows(value, onChange, (rows) => rows.map((r, i) => (i === index ? { ...r, label: event.target.value } : r)))}
                    className="rounded-md border border-white/15 bg-black/20 p-2 text-sm"
                    placeholder="P or 7"
                  />
                  <input
                    value={row.playerName}
                    onChange={(event) => updateListRows(value, onChange, (rows) => rows.map((r, i) => (i === index ? { ...r, playerName: event.target.value } : r)))}
                    className="rounded-md border border-white/15 bg-black/20 p-2 text-sm"
                    placeholder="Player Name"
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => updateListRows(value, onChange, (rows) => {
                        if (index === 0) return rows;
                        const next = [...rows];
                        [next[index - 1], next[index]] = [next[index], next[index - 1]];
                        return next;
                      })}
                      className="rounded-md border border-white/15 px-2 py-1 text-xs text-command-muted"
                      title="Move Up"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      onClick={() => updateListRows(value, onChange, (rows) => {
                        if (index === rows.length - 1) return rows;
                        const next = [...rows];
                        [next[index + 1], next[index]] = [next[index], next[index + 1]];
                        return next;
                      })}
                      className="rounded-md border border-white/15 px-2 py-1 text-xs text-command-muted"
                      title="Move Down"
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      onClick={() => updateListRows(value, onChange, (rows) => rows.filter((_, i) => i !== index))}
                      className="rounded-md border border-white/15 px-2 py-1 text-xs text-command-muted"
                      title="Remove"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <Field
                label="Paste / Import Rows"
                value={formatRows(value.listRows)}
                onChange={(next) => setValue(value, "listRows", parseRows(next), onChange)}
                multiline
                placeholder={"P | Trevor\n7 | Sam Jones"}
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
