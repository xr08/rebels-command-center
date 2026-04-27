"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { STYLE_VARIANT_LABELS, STYLE_VARIANTS } from "@/lib/social/style-variants";
import type { StyleVariant } from "@/types/social";
import type { TemplateRecord } from "@/types/social-data";

type Props = {
  templates: TemplateRecord[];
};

export function TemplateManager({ templates }: Props) {
  const [variantById, setVariantById] = useState<Record<string, StyleVariant>>(() =>
    templates.reduce<Record<string, StyleVariant>>((acc, template) => {
      acc[template.id] = (template.default_style_variant ?? "classic-green") as StyleVariant;
      return acc;
    }, {})
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [messageById, setMessageById] = useState<Record<string, string>>({});

  const templateList = useMemo(
    () =>
      templates.map((template) => ({
        ...template,
        activeVariant: variantById[template.id] ?? "classic-green"
      })),
    [templates, variantById]
  );

  const saveVariant = async (templateId: string) => {
    const nextVariant = variantById[templateId] ?? "classic-green";
    setSavingId(templateId);
    setMessageById((prev) => ({ ...prev, [templateId]: "" }));

    const supabase = createClient();
    const { error } = await supabase
      .from("social_templates")
      .update({ default_style_variant: nextVariant })
      .eq("id", templateId);

    if (error) {
      console.error("[templates.saveVariant] Failed to save template variant:", error.message, "templateId:", templateId);
      setMessageById((prev) => ({
        ...prev,
        [templateId]: error.message.toLowerCase().includes("permission")
          ? "Could not save variant due to permissions."
          : "Could not save variant. Try again."
      }));
      setSavingId(null);
      return;
    }

    setMessageById((prev) => ({ ...prev, [templateId]: "Default style saved." }));
    setSavingId(null);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {templateList.map((template) => (
        <article key={template.id} className="glass-panel rounded-xl p-4">
          <h3 className="text-lg font-bold">{template.name}</h3>
          <p className="mt-2 text-sm text-command-muted">Post Type: {template.post_type}</p>
          <p className="text-sm text-command-muted">Component Key: {template.component_key}</p>

          <label className="mt-3 block space-y-1">
            <span className="text-xs uppercase tracking-[0.14em] text-command-muted">Default style variant</span>
            <select
              value={template.activeVariant}
              onChange={(event) =>
                setVariantById((prev) => ({
                  ...prev,
                  [template.id]: event.target.value as StyleVariant
                }))
              }
              className="w-full rounded-md border border-white/15 bg-black/20 p-2 text-sm"
            >
              {STYLE_VARIANTS.map((variant) => (
                <option key={variant} value={variant}>
                  {STYLE_VARIANT_LABELS[variant]}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => saveVariant(template.id)}
            disabled={savingId === template.id}
            className="mt-3 rounded-md bg-command-accent px-3 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            {savingId === template.id ? "Saving..." : "Save Default Variant"}
          </button>

          {messageById[template.id] ? <p className="mt-2 text-xs text-command-muted">{messageById[template.id]}</p> : null}
        </article>
      ))}
    </div>
  );
}
