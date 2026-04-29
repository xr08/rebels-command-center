"use client";

import { STYLE_VARIANT_LABELS, STYLE_VARIANTS } from "@/lib/social/style-variants";
import type { StyleVariant } from "@/types/social";
import type { TemplateOptions, TemplateRecord } from "@/types/social-data";

type Props = {
  templates: TemplateRecord[];
  templateId: string;
  setTemplateId: (value: string) => void;
  aspectRatio: TemplateOptions["aspectRatio"];
  setAspectRatio: (value: TemplateOptions["aspectRatio"]) => void;
  styleVariant: StyleVariant;
  setStyleVariant: (value: StyleVariant) => void;
  quickTemplateHint: string;
};

export function TemplateControls({
  templates,
  templateId,
  setTemplateId,
  aspectRatio,
  setAspectRatio,
  styleVariant,
  setStyleVariant,
  quickTemplateHint
}: Props) {
  return (
    <section className="glass-panel rounded-2xl p-4">
      <h3 className="text-lg font-semibold">Post Setup</h3>
      <p className="mt-1 text-sm text-command-muted">{quickTemplateHint}</p>

      <label className="mt-3 block space-y-1">
        <span className="text-xs text-command-muted">Template</span>
        <select value={templateId} onChange={(event) => setTemplateId(event.target.value)} className="w-full rounded-md border border-white/15 bg-black/20 p-2 text-sm">
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs text-command-muted">Aspect</span>
          <select value={aspectRatio} onChange={(event) => setAspectRatio(event.target.value as TemplateOptions["aspectRatio"])} className="w-full rounded-md border border-white/15 bg-black/20 p-2 text-sm">
            <option value="square">Square</option>
            <option value="portrait">Portrait</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs text-command-muted">Approved Variation</span>
          <select
            value={styleVariant}
            onChange={(event) => setStyleVariant(event.target.value as StyleVariant)}
            className="w-full rounded-md border border-white/15 bg-black/20 p-2 text-sm"
          >
            {STYLE_VARIANTS.map((variant) => (
              <option key={variant} value={variant}>
                {STYLE_VARIANT_LABELS[variant]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
