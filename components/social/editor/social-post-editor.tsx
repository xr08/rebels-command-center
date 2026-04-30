"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { SocialPreview } from "@/components/social/preview/social-preview";
import { CanvasPreviewPanel } from "@/components/social/studio/canvas-preview-panel";
import { CaptionPanel } from "@/components/social/studio/caption-panel";
import { CustomFields } from "@/components/social/studio/custom-fields";
import { FixturePicker } from "@/components/social/studio/fixture-picker";
import { MediaPicker, type MediaOption } from "@/components/social/studio/media-picker";
import { ModeTabs } from "@/components/social/studio/mode-tabs";
import { SocialStudioShell } from "@/components/social/studio/social-studio-shell";
import { PreviewAdjustments } from "@/components/social/studio/preview-adjustments";
import { TemplateControls } from "@/components/social/studio/template-controls";
import { TemplateCustomizer } from "@/components/social/studio/template-customizer";
import { isCanvasTemplateKey, renderPostToDataUrl } from "@/lib/social/canvas/render-post";
import {
  buildCaptionByType,
  buildCustomCaption,
  buildPreviewSummaryCaption,
  buildResultSummaryCaption
} from "@/lib/social/caption-builder";
import { normalizeStyleVariant } from "@/lib/social/style-variants";
import { createClient } from "@/lib/supabase/client";
import type { CustomPostType, PostStatus, Stream, StyleVariant } from "@/types/social";
import type {
  CustomPostFormData,
  CustomTemplateData,
  FixtureRecord,
  MediaAssetRecord,
  SocialPostDraftPayload,
  SocialPostDraftRecord,
  SocialTemplateCustomizations,
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
type ViewMode = "upcoming" | "results";

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

const defaultCustomizations: SocialTemplateCustomizations = {
  showVenue: true,
  showTime: true,
  showRound: true,
  showSponsorStrip: false,
  backgroundFit: "cover",
  backgroundPosition: "center",
  backgroundPositionX: 50,
  backgroundPositionY: 50,
  backgroundZoom: 1,
  overlayStrength: "medium",
  overlayOpacity: 34,
  listTitle: "TEAM LIST",
  listSubtitle: "",
  listRows: []
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

function readCustomizations(payload: SocialPostDraftPayload | null | undefined) {
  const raw = payload?.customizations ?? {};
  const overlayOpacity = typeof raw.overlayOpacity === "number"
    ? raw.overlayOpacity
    : raw.overlayStrength === "none"
      ? 0
      : raw.overlayStrength === "light"
        ? 18
        : raw.overlayStrength === "strong"
          ? 50
          : 34;
  return {
    ...defaultCustomizations,
    ...raw,
    overlayOpacity
  };
}

export function SocialPostEditor({ fixtures, templates, mediaAssets, initialDraft, sourceState, brand }: Props) {
  const [builderMode, setBuilderMode] = useState<BuilderMode>("fixture");
  const [workflowMode, setWorkflowMode] = useState<WorkflowMode>("full");
  const [composeMode, setComposeMode] = useState<ComposeMode>("single");
  const [viewMode, setViewMode] = useState<ViewMode>("upcoming");
  const [stream, setStream] = useState<Stream>("all");
  const [fixtureId, setFixtureId] = useState("");
  const [roundLabel, setRoundLabel] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState("");
  const [aspectRatio, setAspectRatio] = useState<TemplateOptions["aspectRatio"]>("square");
  const [styleVariant, setStyleVariant] = useState<StyleVariant>("classic-green");
  const [showLogo] = useState(true);
  const [backgroundAssetId, setBackgroundAssetId] = useState("");
  const [customForm, setCustomForm] = useState<CustomPostFormData>(emptyCustomForm);
  const [customizations, setCustomizations] = useState<SocialTemplateCustomizations>(defaultCustomizations);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialDraft) {
      return;
    }

    const payload = initialDraft.custom_payload ?? {};
    setCaption(initialDraft.caption);
    const draftCustomizations = readCustomizations(payload);
    setCustomizations(draftCustomizations);
    if (draftCustomizations.templateVariation) {
      setStyleVariant(normalizeStyleVariant(draftCustomizations.templateVariation));
    }

    if (initialDraft.custom_post_type) {
      setBuilderMode("custom");
      setTemplateId(initialDraft.custom_post_type);
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
      setCustomizations((prev) => ({ ...prev, showSponsorStrip: false }));
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

  const mediaOptions: MediaOption[] = useMemo(() => {
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

  const logoOptions: MediaOption[] = useMemo(() => {
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
  const effectiveShowSponsorStrip = false;

  const customData: CustomTemplateData | null = builderMode === "custom" && selectedTemplate
    ? {
      ...customForm,
      postType: selectedTemplate.post_type as CustomPostType
    }
    : null;

  const previewOptions: TemplateOptions = {
    aspectRatio,
    showSponsorStrip: effectiveShowSponsorStrip,
    showLogo,
    styleVariant,
    backgroundImageUrl: selectedBackgroundUrl,
    customizations: {
      ...customizations,
      showSponsorStrip: effectiveShowSponsorStrip,
      templateVariation: styleVariant
    }
  };
  const persistedCustomizations: SocialTemplateCustomizations = {
    ...customizations,
    showSponsorStrip: effectiveShowSponsorStrip,
    templateVariation: styleVariant
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
        custom_payload: { ...customForm, customizations: persistedCustomizations },
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
        custom_payload: { customizations: persistedCustomizations },
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
  const saveDraft = () => savePost("draft");

  const controls = (
    <div className="space-y-5">
      <ModeTabs
        builderMode={builderMode}
        setBuilderMode={setBuilderMode}
        workflowMode={workflowMode}
        setWorkflowMode={setWorkflowMode}
        composeMode={composeMode}
        setComposeMode={setComposeMode}
        viewMode={viewMode}
        setViewMode={setViewMode}
        stream={stream}
        setStream={setStream}
        streamOptions={streamOptions}
      />

      {builderMode === "fixture" ? (
        <FixturePicker
          composeMode={composeMode}
          filteredFixtures={filteredFixtures}
          fixtureId={fixtureId}
          setFixtureId={setFixtureId}
          availableRounds={availableRounds}
          roundLabel={roundLabel}
          setRoundLabel={setRoundLabel}
          summaryFixtureCount={summaryFixtures.length}
          formatFixtureTime={formatFixtureTime}
        />
      ) : (
        <CustomFields
          customForm={customForm}
          setCustomForm={setCustomForm}
          streamOptions={streamOptions}
          customPostType={(selectedTemplate?.post_type as CustomPostType | undefined) ?? null}
        />
      )}
    </div>
  );

  const setup = (
    <>
      <TemplateControls
        templates={availableTemplates}
        templateId={templateId}
        setTemplateId={setTemplateId}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        styleVariant={styleVariant}
        setStyleVariant={setStyleVariant}
        quickTemplateHint={quickTemplateHint}
      />
      <MediaPicker
        mediaOptions={mediaOptions}
        selectedBackgroundId={selectedBackgroundId}
        onSelectBackground={(id) => builderMode === "custom"
          ? setCustomForm((prev) => ({ ...prev, selectedMediaId: id }))
          : setBackgroundAssetId(id)}
        logoOptions={logoOptions}
        selectedLogoId={customForm.selectedLogoId}
        onSelectLogo={(id) => setCustomForm((prev) => ({ ...prev, selectedLogoId: id }))}
        showLogoPicker={builderMode === "custom"}
      />
      <TemplateCustomizer
        value={customizations}
        onChange={(next) => {
          setCustomizations(next);
        }}
        showListControls={styleVariant === "team-list-photo"}
      />
    </>
  );

  const preview = (
    <div className="space-y-4">
      <CanvasPreviewPanel
        template={selectedTemplate}
        data={singleData}
        customData={customData}
        summaryFixtures={builderMode === "fixture" ? summaryFixtures : []}
        options={previewOptions}
        brand={previewBrand}
      />
      <PreviewAdjustments value={customizations} onChange={setCustomizations} />
    </div>
  );

  const captionPanel = (
    <CaptionPanel
      caption={caption}
      setCaption={setCaption}
      rows={workflowMode === "quick" ? 4 : 6}
      message={message}
      onGenerate={generateCaption}
      onCopy={copyCaption}
      onSaveDraft={saveDraft}
      onExport={exportPng}
    />
  );

  const exportFrame = (
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
  );

  return (
    <SocialStudioShell
      controls={controls}
      setup={setup}
      preview={preview}
      caption={captionPanel}
      exportFrame={exportFrame}
      sourceIssues={sourceState.issues}
      actions={{
        onGenerateCaption: generateCaption,
        onCopyCaption: copyCaption,
        onSaveDraft: saveDraft,
        onExport: exportPng
      }}
    />
  );
}
