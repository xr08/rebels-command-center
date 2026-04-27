"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { SocialPreview } from "@/components/social/preview/social-preview";
import { isCanvasTemplateKey, renderPostToDataUrl } from "@/lib/social/canvas/render-post";
import {
  buildCaptionByType,
  buildCustomCaption,
  buildPreviewSummaryCaption,
  buildResultSummaryCaption
} from "@/lib/social/caption-builder";
import { STYLE_VARIANT_LABELS, STYLE_VARIANTS, normalizeStyleVariant } from "@/lib/social/style-variants";
import { createClient } from "@/lib/supabase/client";
import type { CustomPostType, PostStatus, Stream, StyleVariant } from "@/types/social";
import type {
  CustomPostFormData,
  CustomTemplateData,
  FixtureRecord,
  MediaAssetRecord,
  SocialPostDraftRecord,
  SourceLoadState,
  TemplateFixtureProps,
  TemplateOptions,
  TemplateRecord
} from "@/types/social-data";

type Props = {
  fixtures: FixtureRecord[];
  templates: TemplateRecord[];
  mediaAssets: MediaAssetRecord[];
  initialDraft: SocialPostDraftRecord | null;
  sourceState: SourceLoadState;
  brand: {
    clubId: string;
    clubName: string;
    primaryColor: string;
    accentColor: string;
    logoPath?: string | null;
  };
};

type BuilderMode = "fixture" | "custom";
type ComposeMode = "single" | "summary";
type WorkflowMode = "quick" | "full";

const streamOptions: { label: string; value: Stream }[] = [
  { label: "All", value: "all" },
  { label: "Mens", value: "mens" },
  { label: "Womens", value: "womens" },
  { label: "Juniors", value: "juniors" }
];

const customTemplateOptions: TemplateRecord[] = [
  { id: "player_of_the_day", name: "Player of the Day", post_type: "player_of_the_day", component_key: "player_of_the_day", is_active: true },
  { id: "sponsor_highlight", name: "Sponsor Highlight", post_type: "sponsor_highlight", component_key: "sponsor_highlight", is_active: true },
  { id: "training_reminder", name: "Training Reminder", post_type: "training_reminder", component_key: "training_reminder", is_active: true },
  { id: "event_announcement", name: "Social Event / Function", post_type: "event_announcement", component_key: "event_announcement", is_active: true },
  { id: "general_announcement", name: "General Club Announcement", post_type: "general_announcement", component_key: "general_announcement", is_active: true },
  { id: "photo_highlight", name: "Game Day Photo Highlight", post_type: "photo_highlight", component_key: "photo_highlight", is_active: true },
  { id: "manual_info_card", name: "Manual Info Card", post_type: "manual_info_card", component_key: "manual_info_card", is_active: true }
];

const emptyCustomForm: CustomPostFormData = {
  heading: "",
  subheading: "",
  title: "",
  bodyText: "",
  date: "",
  time: "",
  location: "",
  ctaText: "",
  personName: "",
  sponsorName: "",
  stream: "all",
  selectedMediaId: "",
  selectedLogoId: ""
};

function inferResultOutcome(fixture: FixtureRecord): TemplateFixtureProps["resultOutcome"] {
  if (fixture.home_score === null || fixture.away_score === null) {
    return null;
  }
  if (fixture.home_score > fixture.away_score) {
    return "win";
  }
  if (fixture.home_score < fixture.away_score) {
    return "loss";
  }
  return "draw";
}

function toTemplateData(fixture: FixtureRecord | null): TemplateFixtureProps | null {
  if (!fixture) {
    return null;
  }

  const dateObj = new Date(fixture.fixture_date);
  const date = new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  }).format(dateObj);

  const time = new Intl.DateTimeFormat("en-AU", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(dateObj);

  const score = fixture.home_score !== null && fixture.away_score !== null ? `${fixture.home_score}-${fixture.away_score}` : null;

  return {
    opponent: fixture.is_bye ? "BYE" : fixture.opponent_name,
    round: fixture.round_label,
    date,
    time: fixture.is_bye ? "BYE" : time,
    venue: fixture.venue,
    score,
    isBye: fixture.is_bye ?? false,
    teamName: fixture.teams?.name ?? "Rebels",
    stream: (fixture.teams?.stream as TemplateFixtureProps["stream"]) ?? "all",
    resultOutcome: inferResultOutcome(fixture)
  };
}

function getExportSize(aspectRatio: TemplateOptions["aspectRatio"]) {
  if (aspectRatio === "portrait") {
    return { width: 1080, height: 1350 };
  }
  return { width: 1080, height: 1080 };
}

function getFriendlyWriteError(rawMessage: string) {
  const message = rawMessage.toLowerCase();
  if (message.includes("row-level security") || message.includes("permission denied")) {
    return "Action blocked by permissions. Sign in with an authorised account and try again.";
  }
  return "Couldn't save right now. Please try again.";
}

function formatFixtureTime(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(date).toLowerCase();
}

export function SocialPostEditor({ fixtures, templates, mediaAssets, initialDraft, sourceState, brand }: Props) {
  const [builderMode, setBuilderMode] = useState<BuilderMode>("fixture");
  const [workflowMode, setWorkflowMode] = useState<WorkflowMode>("full");
  const [composeMode, setComposeMode] = useState<ComposeMode>("single");
  const [viewMode, setViewMode] = useState<"upcoming" | "results">("upcoming");
  const [stream, setStream] = useState<Stream>("all");
  const [fixtureId, setFixtureId] = useState("");
  const [roundLabel, setRoundLabel] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState("");
  const [aspectRatio, setAspectRatio] = useState<TemplateOptions["aspectRatio"]>("square");
  const [styleVariant, setStyleVariant] = useState<StyleVariant>("classic-green");
  const [showSponsorStrip, setShowSponsorStrip] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [backgroundAssetId, setBackgroundAssetId] = useState("");
  const [customForm, setCustomForm] = useState<CustomPostFormData>(emptyCustomForm);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialDraft) {
      return;
    }

    setCaption(initialDraft.caption);

    if (initialDraft.custom_post_type) {
      setBuilderMode("custom");
      setTemplateId(initialDraft.custom_post_type);
      const payload = initialDraft.custom_payload ?? {};
      setCustomForm((prev) => ({
        ...prev,
        heading: payload.heading ?? "",
        subheading: payload.subheading ?? "",
        title: payload.title ?? "",
        bodyText: payload.bodyText ?? "",
        date: payload.date ?? "",
        time: payload.time ?? "",
        location: payload.location ?? "",
        ctaText: payload.ctaText ?? "",
        personName: payload.personName ?? "",
        sponsorName: payload.sponsorName ?? "",
        stream: (payload.stream as Stream) ?? "all",
        selectedMediaId: payload.selectedMediaId ?? "",
        selectedLogoId: payload.selectedLogoId ?? ""
      }));
      return;
    }

    setBuilderMode("fixture");
    setFixtureId(initialDraft.fixture_id ?? "");
    if (initialDraft.template_id) {
      setTemplateId(initialDraft.template_id);
    }

    if (String(initialDraft.post_type).endsWith("summary")) {
      setComposeMode("summary");
      setRoundLabel(initialDraft.fixtures?.round_label ?? "");
    } else {
      setComposeMode("single");
    }

    if (String(initialDraft.post_type).startsWith("result")) {
      setViewMode("results");
    } else {
      setViewMode("upcoming");
    }
  }, [initialDraft]);

  useEffect(() => {
    if (workflowMode === "quick") {
      setComposeMode("single");
      setShowSponsorStrip(false);
      setShowLogo(true);
    }
  }, [workflowMode]);

  const filteredFixtures = useMemo(() => {
    return fixtures.filter((fixture) => {
      const matchesStatus = viewMode === "upcoming" ? fixture.status === "scheduled" : fixture.status === "completed";
      const matchesStream = stream === "all" || fixture.teams?.stream === stream;
      return matchesStatus && matchesStream;
    });
  }, [fixtures, viewMode, stream]);

  const availableRounds = useMemo(() => {
    return Array.from(new Set(filteredFixtures.map((fixture) => fixture.round_label))).sort();
  }, [filteredFixtures]);

  const summaryFixtures = useMemo(() => {
    if (!roundLabel) {
      return [];
    }
    return filteredFixtures.filter((fixture) => fixture.round_label === roundLabel);
  }, [filteredFixtures, roundLabel]);

  const fixtureTemplates = useMemo(() => {
    return templates.filter((template) => {
      const isPreview = String(template.post_type).startsWith("preview");
      const isResult = String(template.post_type).startsWith("result");
      const isSummaryTemplate = String(template.post_type).endsWith("summary");

      if (viewMode === "upcoming" && !isPreview) {
        return false;
      }
      if (viewMode === "results" && !isResult) {
        return false;
      }
      return composeMode === "summary" ? isSummaryTemplate : !isSummaryTemplate;
    });
  }, [templates, viewMode, composeMode]);

  const availableTemplates = builderMode === "custom" ? customTemplateOptions : fixtureTemplates;

  const imageAssets = useMemo(() => {
    return mediaAssets.filter((asset) => {
      const type = asset.media_type.toLowerCase();
      return type === "background" || type.includes("image");
    });
  }, [mediaAssets]);

  const logoAssets = useMemo(() => {
    return mediaAssets.filter((asset) => {
      const type = asset.media_type.toLowerCase();
      return type.includes("logo") || type.includes("sponsor");
    });
  }, [mediaAssets]);

  const mediaOptions = useMemo(() => {
    const supabase = createClient();
    return imageAssets.map((asset) => ({
      ...asset,
      publicUrl:
        asset.thumbnail_url ??
        asset.url ??
        (asset.storage_bucket && asset.file_path
          ? supabase.storage.from(asset.storage_bucket).getPublicUrl(asset.file_path).data.publicUrl
          : null)
    }));
  }, [imageAssets]);

  const logoOptions = useMemo(() => {
    const supabase = createClient();
    return logoAssets.map((asset) => ({
      ...asset,
      publicUrl:
        asset.thumbnail_url ??
        asset.url ??
        (asset.storage_bucket && asset.file_path
          ? supabase.storage.from(asset.storage_bucket).getPublicUrl(asset.file_path).data.publicUrl
          : null)
    }));
  }, [logoAssets]);

  useEffect(() => {
    if (builderMode !== "fixture") {
      return;
    }
    if (!filteredFixtures.some((fixture) => fixture.id === fixtureId)) {
      setFixtureId(filteredFixtures[0]?.id ?? "");
    }
  }, [builderMode, filteredFixtures, fixtureId]);

  useEffect(() => {
    if (builderMode !== "fixture") {
      return;
    }
    if (!availableRounds.includes(roundLabel)) {
      setRoundLabel(availableRounds[0] ?? "");
    }
  }, [builderMode, availableRounds, roundLabel]);

  useEffect(() => {
    if (!availableTemplates.some((template) => template.id === templateId)) {
      setTemplateId(availableTemplates[0]?.id ?? "");
    }
  }, [availableTemplates, templateId]);

  useEffect(() => {
    const selected = availableTemplates.find((template) => template.id === templateId);
    if (!selected) {
      return;
    }
    setStyleVariant(normalizeStyleVariant(selected.default_style_variant));
  }, [availableTemplates, templateId]);

  const selectedFixture = filteredFixtures.find((fixture) => fixture.id === fixtureId) ?? null;
  const selectedTemplate = availableTemplates.find((template) => template.id === templateId) ?? null;
  const singleData = toTemplateData(selectedFixture);
  const selectedBackgroundId = builderMode === "custom" ? customForm.selectedMediaId : backgroundAssetId;
  const selectedBackgroundUrl = mediaOptions.find((asset) => asset.id === selectedBackgroundId)?.publicUrl ?? null;
  const selectedLogoUrl = logoOptions.find((asset) => asset.id === customForm.selectedLogoId)?.publicUrl ?? null;

  const customData: CustomTemplateData | null = builderMode === "custom" && selectedTemplate
    ? {
      ...customForm,
      postType: selectedTemplate.post_type as CustomPostType
    }
    : null;

  const previewOptions: TemplateOptions = {
    aspectRatio,
    showSponsorStrip,
    showLogo,
    styleVariant,
    backgroundImageUrl: selectedBackgroundUrl
  };

  const exportOptions: TemplateOptions = {
    ...previewOptions,
    exportMode: true
  };

  const previewBrand = {
    ...brand,
    logoPath: builderMode === "custom" ? selectedLogoUrl ?? brand.logoPath : brand.logoPath
  };

  const generateCaption = () => {
    if (!selectedTemplate) {
      return;
    }

    if (builderMode === "custom") {
      const captionText = buildCustomCaption(
        selectedTemplate.post_type as CustomPostType,
        customForm,
        brand.clubName
      );
      setCaption(captionText);
      setMessage("Caption generated.");
      return;
    }

    if (composeMode === "summary") {
      if (!summaryFixtures.length) {
        return;
      }

      const captionText = selectedTemplate.post_type === "result_summary"
        ? buildResultSummaryCaption(roundLabel, brand.clubName, stream, summaryFixtures.length)
        : buildPreviewSummaryCaption(roundLabel, brand.clubName, stream, summaryFixtures.length);

      setCaption(captionText);
      setMessage("Summary caption generated.");
      return;
    }

    if (!singleData) {
      return;
    }

    const mode = selectedTemplate.post_type === "result_single" ? "result_single" : "preview_single";
    setCaption(buildCaptionByType(mode, singleData, brand.clubName));
    setMessage("Caption generated.");
  };

  const copyCaption = async () => {
    if (!caption) {
      return;
    }
    try {
      await navigator.clipboard.writeText(caption);
      setMessage("Caption copied.");
    } catch (error) {
      console.error("[social.copyCaption] Failed to copy caption:", error);
      setMessage("Couldn't copy caption. You can still select and copy manually.");
    }
  };

  const exportPng = async () => {
    if (!selectedTemplate) {
      return;
    }
    try {
      let dataUrl = "";

      if (isCanvasTemplateKey(selectedTemplate.component_key)) {
        dataUrl = await renderPostToDataUrl({
          templateKey: selectedTemplate.component_key,
          options: exportOptions,
          brand: previewBrand,
          data: singleData,
          summaryFixtures: builderMode === "fixture" ? summaryFixtures : []
        });
      } else {
        if (!exportRef.current) {
          setMessage("Export frame is unavailable for this template.");
          return;
        }

        const { width, height } = getExportSize(exportOptions.aspectRatio);
        dataUrl = await toPng(exportRef.current, {
          cacheBust: true,
          pixelRatio: 2,
          width,
          height,
          canvasWidth: width,
          canvasHeight: height,
          backgroundColor: brand.primaryColor || "#044229",
          style: {
            width: `${width}px`,
            height: `${height}px`,
            margin: "0",
            padding: "0",
            overflow: "hidden",
            background: brand.primaryColor || "#044229"
          }
        });
      }

      const fileLabel = builderMode === "custom"
        ? (selectedTemplate.name || "custom-post")
        : composeMode === "summary"
          ? roundLabel || "round"
          : selectedFixture?.round_label || "fixture";

      const link = document.createElement("a");
      link.download = `${fileLabel}-${selectedTemplate.component_key}-${exportOptions.aspectRatio}`
        .toLowerCase()
        .replace(/\s+/g, "-") + ".png";
      link.href = dataUrl;
      link.click();
      setMessage("PNG exported.");
    } catch (error) {
      console.error("[social.exportPng] Failed export:", error);
      setMessage("Export failed. Try a different template/background and export again.");
    }
  };

  const savePost = async (status: PostStatus) => {
    if (!selectedTemplate) {
      return;
    }

    let payload: Record<string, unknown>;

    if (builderMode === "custom") {
      const captionToSave = caption || buildCustomCaption(selectedTemplate.post_type as CustomPostType, customForm, brand.clubName);
      payload = {
        club_id: brand.clubId,
        fixture_id: null,
        template_id: null,
        post_type: "preview_single",
        custom_post_type: selectedTemplate.post_type,
        custom_payload: customForm,
        caption: captionToSave,
        status,
        generated_by: null
      };
      setCaption(captionToSave);
    } else {
      const sourceFixture = composeMode === "summary" ? summaryFixtures[0] : selectedFixture;
      if (!sourceFixture) {
        return;
      }

      const captionToSave = caption || (composeMode === "summary"
        ? selectedTemplate.post_type === "result_summary"
          ? buildResultSummaryCaption(roundLabel, brand.clubName, stream, summaryFixtures.length)
          : buildPreviewSummaryCaption(roundLabel, brand.clubName, stream, summaryFixtures.length)
        : singleData
          ? buildCaptionByType(selectedTemplate.post_type === "result_single" ? "result_single" : "preview_single", singleData, brand.clubName)
          : "");

      payload = {
        club_id: brand.clubId,
        fixture_id: sourceFixture.id,
        template_id: selectedTemplate.id,
        post_type: selectedTemplate.post_type,
        custom_post_type: null,
        custom_payload: null,
        caption: captionToSave,
        status,
        generated_by: null
      };
      setCaption(captionToSave);
    }

    const supabase = createClient();
    const { error } = await supabase.from("social_posts").insert(payload);

    if (error) {
      console.error("[social.savePost] Failed save:", error.message);
      setMessage(getFriendlyWriteError(error.message));
      return;
    }

    setMessage(`Saved as ${status}.`);
  };

  const quickTemplateHint = selectedTemplate ? `${selectedTemplate.name} | ${previewOptions.aspectRatio}` : "Select template";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
      <aside className="glass-panel rounded-2xl p-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-command-accent">Builder</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setBuilderMode("fixture")}
              className={`rounded-md px-3 py-2 text-sm font-semibold ${builderMode === "fixture" ? "bg-command-accent text-black" : "border border-white/15 text-command-muted"}`}
            >
              Fixtures
            </button>
            <button
              type="button"
              onClick={() => setBuilderMode("custom")}
              className={`rounded-md px-3 py-2 text-sm font-semibold ${builderMode === "custom" ? "bg-command-accent text-black" : "border border-white/15 text-command-muted"}`}
            >
              Custom Post
            </button>
          </div>
        </div>

        {builderMode === "fixture" ? (
          <>
            <div className="mt-4 space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-command-accent">Workflow</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWorkflowMode("quick")}
                  className={`rounded-md px-3 py-2 text-sm font-semibold ${workflowMode === "quick" ? "bg-command-accent text-black" : "border border-white/15 text-command-muted"}`}
                >
                  Quick Post
                </button>
                <button
                  type="button"
                  onClick={() => setWorkflowMode("full")}
                  className={`rounded-md px-3 py-2 text-sm font-semibold ${workflowMode === "full" ? "bg-command-accent text-black" : "border border-white/15 text-command-muted"}`}
                >
                  Full Mode
                </button>
              </div>
            </div>

            {workflowMode === "full" ? (
              <div className="mt-4 space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-command-accent">Generator Mode</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setComposeMode("single")}
                    className={`rounded-md px-3 py-2 text-sm ${composeMode === "single" ? "bg-command-accent text-black" : "border border-white/15 text-command-muted"}`}
                  >
                    Single
                  </button>
                  <button
                    type="button"
                    onClick={() => setComposeMode("summary")}
                    className={`rounded-md px-3 py-2 text-sm ${composeMode === "summary" ? "bg-command-accent text-black" : "border border-white/15 text-command-muted"}`}
                  >
                    Round Summary
                  </button>
                </div>
              </div>
            ) : null}

            <div className="mt-4 space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-command-accent">Fixture Feed</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode("upcoming")}
                  className={`rounded-md px-3 py-2 text-sm ${viewMode === "upcoming" ? "bg-command-accent text-black" : "border border-white/15 text-command-muted"}`}
                >
                  Upcoming
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("results")}
                  className={`rounded-md px-3 py-2 text-sm ${viewMode === "results" ? "bg-command-accent text-black" : "border border-white/15 text-command-muted"}`}
                >
                  Results
                </button>
              </div>
            </div>

            <div className="mt-4">
              <label className="space-y-1">
                <span className="text-xs text-command-muted">Stream</span>
                <select value={stream} onChange={(event) => setStream(event.target.value as Stream)} className="w-full rounded-md border border-white/15 bg-black/20 p-2 text-sm">
                  {streamOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {composeMode === "single" ? (
              <ul className="mt-4 max-h-[300px] space-y-2 overflow-auto pr-1">
                {filteredFixtures.map((fixture) => (
                  <li key={fixture.id}>
                    <button
                      type="button"
                      onClick={() => setFixtureId(fixture.id)}
                      className={`w-full rounded-lg border p-3 text-left ${fixture.id === fixtureId ? "border-command-accent bg-command-accent/10" : "border-white/15 bg-black/20"}`}
                    >
                      <p className="text-xs text-command-muted">{fixture.round_label}</p>
                      <p className="text-sm font-semibold">
                        {fixture.is_bye
                          ? `${fixture.teams?.name ?? "Rebels"} | BYE`
                          : `${fixture.teams?.name ?? "Rebels"} v ${fixture.opponent_name} | ${formatFixtureTime(fixture.fixture_date)} | ${fixture.home_or_away ?? "TBC"}`}
                      </p>
                    </button>
                  </li>
                ))}
                {!filteredFixtures.length ? (
                  <li className="rounded-lg border border-yellow-400/30 bg-yellow-400/10 p-3 text-sm text-yellow-100">
                    No fixtures available for these filters. If this looks wrong, check source Supabase access and fixture status values.
                  </li>
                ) : null}
              </ul>
            ) : (
              <label className="mt-4 block space-y-1">
                <span className="text-xs text-command-muted">Round</span>
                <select value={roundLabel} onChange={(event) => setRoundLabel(event.target.value)} className="w-full rounded-md border border-white/15 bg-black/20 p-2 text-sm">
                  {availableRounds.map((round) => (
                    <option key={round} value={round}>
                      {round}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-command-muted">{summaryFixtures.length} fixture(s) in this summary.</p>
              </label>
            )}
          </>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-command-accent">Custom Fields</p>
            <Field label="Heading" value={customForm.heading} onChange={(value) => setCustomForm((prev) => ({ ...prev, heading: value }))} />
            <Field label="Subheading" value={customForm.subheading} onChange={(value) => setCustomForm((prev) => ({ ...prev, subheading: value }))} />
            <Field label="Title" value={customForm.title} onChange={(value) => setCustomForm((prev) => ({ ...prev, title: value }))} />
            <Field label="Body Text" value={customForm.bodyText} multiline onChange={(value) => setCustomForm((prev) => ({ ...prev, bodyText: value }))} />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Date" value={customForm.date} onChange={(value) => setCustomForm((prev) => ({ ...prev, date: value }))} />
              <Field label="Time" value={customForm.time} onChange={(value) => setCustomForm((prev) => ({ ...prev, time: value }))} />
            </div>
            <Field label="Location" value={customForm.location} onChange={(value) => setCustomForm((prev) => ({ ...prev, location: value }))} />
            <Field label="CTA Text" value={customForm.ctaText} onChange={(value) => setCustomForm((prev) => ({ ...prev, ctaText: value }))} />
            <Field label="Player / Person" value={customForm.personName} onChange={(value) => setCustomForm((prev) => ({ ...prev, personName: value }))} />
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
          </div>
        )}
      </aside>

      <section className="space-y-4 pb-24 md:pb-4">
        {sourceState.issues.length ? (
          <div className="rounded-xl border border-yellow-400/40 bg-yellow-400/10 p-3 text-xs text-yellow-100">
            <p className="font-semibold uppercase tracking-[0.12em]">Source Data Notice</p>
            <ul className="mt-2 space-y-1">
              {sourceState.issues.slice(0, 4).map((issue) => (
                <li key={issue}>- {issue}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="glass-panel rounded-2xl p-4">
          <h3 className="text-lg font-semibold">Post Setup</h3>
          <p className="mt-1 text-sm text-command-muted">{quickTemplateHint}</p>

          <label className="mt-3 block space-y-1">
            <span className="text-xs text-command-muted">Template</span>
            <select value={templateId} onChange={(event) => setTemplateId(event.target.value)} className="w-full rounded-md border border-white/15 bg-black/20 p-2 text-sm">
              {availableTemplates.map((template) => (
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
              <span className="text-xs text-command-muted">Style Variant</span>
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

          <div className="mt-3 flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-command-muted">
              <input type="checkbox" checked={showSponsorStrip} onChange={(event) => setShowSponsorStrip(event.target.checked)} />
              <span>Sponsor strip</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-command-muted">
              <input type="checkbox" checked={showLogo} onChange={(event) => setShowLogo(event.target.checked)} />
              <span>Show logo</span>
            </label>
          </div>

          <div className="mt-3">
            <p className="text-xs text-command-muted">Backgrounds</p>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => builderMode === "custom"
                  ? setCustomForm((prev) => ({ ...prev, selectedMediaId: "" }))
                  : setBackgroundAssetId("")}
                className={`rounded-md border p-2 text-xs ${selectedBackgroundId === "" ? "border-command-accent bg-command-accent/10" : "border-white/15 bg-black/20"}`}
              >
                No Image
              </button>
              {mediaOptions.slice(0, 12).map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => builderMode === "custom"
                    ? setCustomForm((prev) => ({ ...prev, selectedMediaId: asset.id }))
                    : setBackgroundAssetId(asset.id)}
                  className={`overflow-hidden rounded-md border ${selectedBackgroundId === asset.id ? "border-command-accent" : "border-white/15"}`}
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

          {builderMode === "custom" ? (
            <label className="mt-3 block space-y-1">
              <span className="text-xs text-command-muted">Logo / Sponsor Asset</span>
              <select
                value={customForm.selectedLogoId}
                onChange={(event) => setCustomForm((prev) => ({ ...prev, selectedLogoId: event.target.value }))}
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
        </div>

        <div className="overflow-hidden rounded-2xl">
          <SocialPreview
            template={selectedTemplate}
            data={singleData}
            customData={customData}
            summaryFixtures={builderMode === "fixture" ? summaryFixtures : []}
            options={previewOptions}
            brand={previewBrand}
          />
        </div>

        <div className="pointer-events-none fixed -left-[10000px] top-0 opacity-0">
          <div
            ref={exportRef}
            style={{
              width: `${getExportSize(aspectRatio).width}px`,
              height: `${getExportSize(aspectRatio).height}px`,
              overflow: "hidden",
              background: brand.primaryColor || "#044229"
            }}
          >
            <SocialPreview
              template={selectedTemplate}
              data={singleData}
              customData={customData}
              summaryFixtures={builderMode === "fixture" ? summaryFixtures : []}
              options={exportOptions}
              brand={previewBrand}
            />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-command-accent">Caption</h4>
            <button type="button" onClick={generateCaption} className="text-xs text-command-muted underline">
              Generate
            </button>
          </div>

          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            rows={workflowMode === "quick" ? 4 : 6}
            className="w-full rounded-md border border-white/15 bg-black/20 p-2 text-sm"
            placeholder="Generate a caption, then edit before publishing."
          />

          <div className="mt-3 hidden flex-wrap gap-2 md:flex">
            <button type="button" onClick={() => savePost("draft")} className="rounded-md border border-white/15 px-3 py-2 text-sm font-semibold">
              Save Draft
            </button>
            <button type="button" onClick={copyCaption} className="rounded-md border border-white/15 px-3 py-2 text-sm font-semibold">
              Copy Caption
            </button>
            <button type="button" onClick={exportPng} className="rounded-md bg-command-accent px-3 py-2 text-sm font-semibold text-black">
              Export PNG
            </button>
          </div>

          {message ? <p className="mt-2 text-xs text-command-muted">{message}</p> : null}
        </div>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/15 bg-[#051b12]/95 p-3 backdrop-blur md:hidden">
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => savePost("draft")} className="rounded-md border border-white/20 px-3 py-3 text-xs font-semibold">
              Save Draft
            </button>
            <button type="button" onClick={copyCaption} className="rounded-md border border-white/20 px-3 py-3 text-xs font-semibold">
              Copy
            </button>
            <button type="button" onClick={exportPng} className="rounded-md bg-command-accent px-3 py-3 text-xs font-black text-black">
              Export
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="space-y-1">
      <span className="text-xs text-command-muted">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className="w-full rounded-md border border-white/15 bg-black/20 p-2 text-sm"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-md border border-white/15 bg-black/20 p-2 text-sm"
        />
      )}
    </label>
  );
}
