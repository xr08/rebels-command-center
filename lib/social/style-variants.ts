import type { StyleVariant } from "@/types/social";

export const STYLE_VARIANTS: StyleVariant[] = [
  "classic-green",
  "photo-overlay",
  "bold-gold",
  "minimal-board",
  "juniors-energy",
  "sponsor-clean"
];

export const STYLE_VARIANT_LABELS: Record<StyleVariant, string> = {
  "classic-green": "Classic Green",
  "photo-overlay": "Photo Overlay",
  "bold-gold": "Bold Gold",
  "minimal-board": "Minimal Board",
  "juniors-energy": "Juniors Energy",
  "sponsor-clean": "Sponsor Clean"
};

export function normalizeStyleVariant(value: unknown): StyleVariant {
  if (typeof value !== "string") {
    return "classic-green";
  }

  return STYLE_VARIANTS.includes(value as StyleVariant)
    ? (value as StyleVariant)
    : "classic-green";
}
