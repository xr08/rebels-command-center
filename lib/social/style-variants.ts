import type { StyleVariant } from "@/types/social";

export const STYLE_VARIANTS: StyleVariant[] = [
  "classic-green",
  "photo-gradient-green",
  "photo-gradient-gold",
  "minimal-board",
  "juniors-energy",
  "team-list-photo"
];

export const STYLE_VARIANT_LABELS: Record<StyleVariant, string> = {
  "classic-green": "Classic Green",
  "photo-gradient-green": "Photo Gradient - Green",
  "photo-gradient-gold": "Photo Gradient - Gold",
  "minimal-board": "Minimal Board",
  "juniors-energy": "Juniors Energy",
  "team-list-photo": "Team List Photo"
};

export function normalizeStyleVariant(value: unknown): StyleVariant {
  if (typeof value !== "string") {
    return "classic-green";
  }

  return STYLE_VARIANTS.includes(value as StyleVariant)
    ? (value as StyleVariant)
    : "classic-green";
}
