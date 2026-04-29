"use client";

import type { MediaAssetRecord } from "@/types/social-data";

export type MediaOption = MediaAssetRecord & {
  publicUrl: string | null;
};

type Props = {
  mediaOptions: MediaOption[];
  selectedBackgroundId: string;
  onSelectBackground: (id: string) => void;
  logoOptions: MediaOption[];
  selectedLogoId?: string;
  onSelectLogo?: (id: string) => void;
  showLogoPicker?: boolean;
};

export function MediaPicker({
  mediaOptions,
  selectedBackgroundId,
  onSelectBackground,
  logoOptions,
  selectedLogoId = "",
  onSelectLogo,
  showLogoPicker = false
}: Props) {
  return (
    <section className="glass-panel rounded-2xl p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-command-accent">Media</p>
      <div className="mt-3">
        <p className="text-xs text-command-muted">Backgrounds</p>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
          <button
            type="button"
            onClick={() => onSelectBackground("")}
            className={`min-h-16 rounded-md border p-2 text-xs transition ${
              selectedBackgroundId === "" ? "border-command-accent bg-command-accent/10" : "border-white/15 bg-black/20 hover:border-command-accent/40"
            }`}
          >
            No Image
          </button>
          {mediaOptions.slice(0, 12).map((asset) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => onSelectBackground(asset.id)}
              className={`overflow-hidden rounded-md border transition ${selectedBackgroundId === asset.id ? "border-command-accent" : "border-white/15 hover:border-command-accent/40"}`}
              title={asset.alt_text || asset.file_path || asset.url || "Background"}
            >
              <div className="aspect-square bg-black/20">
                {asset.publicUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.publicUrl} alt={asset.alt_text || asset.file_path || "Background image"} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-command-muted">No preview</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {showLogoPicker && onSelectLogo ? (
        <label className="mt-4 block space-y-1">
          <span className="text-xs text-command-muted">Logo / Sponsor Asset</span>
          <select
            value={selectedLogoId}
            onChange={(event) => onSelectLogo(event.target.value)}
            className="w-full rounded-md border border-white/15 bg-black/20 p-2 text-sm"
          >
            <option value="">Default Club Logo</option>
            {logoOptions.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.alt_text || asset.file_path || asset.url || asset.id}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </section>
  );
}
