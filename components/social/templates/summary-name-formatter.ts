const summaryNameReplacements: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /fremantle\s+rebels/gi, replacement: "Rebels" },
  { pattern: /cockburn\s+cougars/gi, replacement: "Cougars" },
  { pattern: /woodlands?\s+wolves/gi, replacement: "Woodlands" },
  { pattern: /ellenbrook\s+easterns/gi, replacement: "Ellenbrook" },
  { pattern: /bayswater\s+morley/gi, replacement: "Bayswater" },
  { pattern: /morley\s+eagles/gi, replacement: "Morley" },
  { pattern: /carine\s+cats/gi, replacement: "Carine" },
  { pattern: /bedford\s*men'?s/gi, replacement: "Bedford" },
  { pattern: /balga\s+bandits/gi, replacement: "Balga" },
  { pattern: /vikings\s+white/gi, replacement: "Vikings W" },
  { pattern: /vikings\s+green/gi, replacement: "Vikings G" }
];

export function normalizeJuniorCasing(value: string) {
  return value.replace(/\bu(\d{1,2})\b/gi, "U$1");
}

export function formatSummaryName(value?: string) {
  if (!value) {
    return "";
  }

  let output = normalizeJuniorCasing(value);
  for (const { pattern, replacement } of summaryNameReplacements) {
    output = output.replace(pattern, replacement);
  }

  return output.replace(/\s+/g, " ").trim();
}
