"use client";

import type { Stream } from "@/types/social";
import type { CustomPostType } from "@/types/social";
import type { CustomPostFormData } from "@/types/social-data";
import { Field } from "./field";

type Props = {
  customForm: CustomPostFormData;
  setCustomForm: (updater: (previous: CustomPostFormData) => CustomPostFormData) => void;
  streamOptions: { label: string; value: Stream }[];
  customPostType?: CustomPostType | null;
};

export function CustomFields({ customForm, setCustomForm, streamOptions, customPostType }: Props) {
  const labels = {
    title: customPostType === "player_of_the_day" ? "Award Title"
      : customPostType === "sponsor_highlight" ? "Sponsor Title"
        : customPostType === "training_reminder" ? "Session Title"
          : customPostType === "event_announcement" ? "Event Title"
            : customPostType === "photo_highlight" ? "Highlight Title"
              : "Title",
    body: customPostType === "training_reminder" ? "Session Details"
      : customPostType === "event_announcement" ? "Event Details"
        : customPostType === "manual_info_card" ? "Body / Details"
          : "Body Text",
    person: customPostType === "player_of_the_day" ? "Player / Person"
      : customPostType === "training_reminder" ? "Coach / Contact"
        : customPostType === "photo_highlight" ? "Featured Person"
          : "Player / Person"
  } as const;

  return (
    <section className="space-y-3">
      <p className="text-xs uppercase tracking-[0.18em] text-command-accent">Custom Fields</p>
      <Field label="Heading" value={customForm.heading} onChange={(value) => setCustomForm((prev) => ({ ...prev, heading: value }))} />
      <Field label="Subheading" value={customForm.subheading} onChange={(value) => setCustomForm((prev) => ({ ...prev, subheading: value }))} />
      <Field label={labels.title} value={customForm.title} onChange={(value) => setCustomForm((prev) => ({ ...prev, title: value }))} />
      <Field label={labels.body} value={customForm.bodyText} multiline onChange={(value) => setCustomForm((prev) => ({ ...prev, bodyText: value }))} />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Date" value={customForm.date} onChange={(value) => setCustomForm((prev) => ({ ...prev, date: value }))} />
        <Field label="Time" value={customForm.time} onChange={(value) => setCustomForm((prev) => ({ ...prev, time: value }))} />
      </div>
      <Field label="Location" value={customForm.location} onChange={(value) => setCustomForm((prev) => ({ ...prev, location: value }))} />
      <Field label="CTA Text" value={customForm.ctaText} onChange={(value) => setCustomForm((prev) => ({ ...prev, ctaText: value }))} />
      <Field label={labels.person} value={customForm.personName} onChange={(value) => setCustomForm((prev) => ({ ...prev, personName: value }))} />
      <Field label="Sponsor" value={customForm.sponsorName} onChange={(value) => setCustomForm((prev) => ({ ...prev, sponsorName: value }))} />
      <label className="space-y-1">
        <span className="text-xs text-command-muted">Stream</span>
        <select
          value={customForm.stream}
          onChange={(event) => setCustomForm((prev) => ({ ...prev, stream: event.target.value as Stream }))}
          className="w-full rounded-md border border-white/15 bg-black/20 p-2 text-sm"
        >
          {streamOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
