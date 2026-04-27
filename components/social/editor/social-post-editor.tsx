"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { SocialPreview } from "@/components/social/preview/social-preview";
import {
  buildCaptionByType,
  buildPreviewSummaryCaption,
  buildResultSummaryCaption
} from "@/lib/social/caption-builder";
import { createClient } from "@/lib/supabase/client";
import type {
  FixtureRecord,
  MediaAssetRecord,
  SocialPostDraftRecord,
  SourceLoadState,
  TemplateFixtureProps,
  TemplateOptions,
  TemplateRecord
} from "@/types/social-data";
import type { PostStatus, Stream } from "@/types/social";

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

type ComposeMode = "single" | "summary";
type WorkflowMode = "quick" | "full";

const streamOptions: { label: string; value: Stream }[] = [
  { label: "All", value: "all" },
  { label: "Mens", value: "mens" },
  { label: "Womens", value: "womens" },
  { label: "Juniors", value: "juniors" }
];

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
  const [showSponsorStrip, setShowSponsorStrip] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [backgroundAssetId, setBackgroundAssetId] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialDraft) {
      return;
    }

    setFixtureId(initialDraft.fixture_id);
    setTemplateId(initialDraft.template_id);
    setCaption(initialDraft.caption);

    if (initialDraft.post_type.endsWith("summary")) {
      setComposeMode("summary");
      setRoundLabel(initialDraft.fixtures?.round_label ?? "");
    } else {
      setComposeMode("single");
    }

    if (initialDraft.post_type.startsWith("result")) {
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

  const availableTemplates = useMemo(() => {
    return templates.filter((template) => {
      const isPreview = template.post_type.startsWith("preview");
      const isResult = template.post_type.startsWith("result");
      const isSummaryTemplate = template.post_type.endsWith("summary");

      if (viewMode === "upcoming" && !isPreview) {
        return false;
      }
      if (viewMode === "results" && !isResult) {
        return false;
      }
      return composeMode === "summary" ? isSummaryTemplate : !isSummaryTemplate;
    });
  }, [templates, viewMode, composeMode]);

  const imageAssets = useMemo(() => {
    return mediaAssets.filter((asset) => {
      const type = asset.media_type.toLowerCase();
      return type === "background" || type.includes("image");
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

  useEffect(() => {
    if (!filteredFixtures.some((fixture) => fixture.id === fixtureId)) {
      setFixtureId(filteredFixtures[0]?.id ?? "");
    }
  }, [filteredFixtures, fixtureId]);

  useEffect(() => {
    if (!availableRounds.includes(roundLabel)) {
      setRoundLabel(availableRounds[0] ?? "");
    }
  }, [availableRounds, roundLabel]);

  useEffect(() => {
    if (!availableTemplates.some((template) => template.id === templateId)) {
      setTemplateId(availableTemplates[0]?.id ?? "");
    }
  }, [availableTemplates, templateId]);

  useEffect(() => {
    if (!mediaOptions.some((asset) => asset.id === backgroundAssetId)) {
      setBackgroundAssetId("");
    }
  }, [mediaOptions, backgroundAssetId]);

  const selectedFixture = filteredFixtures.find((fixture) => fixture.id === fixtureId) ?? null;
  const selectedTemplate = availableTemplates.find((template) => template.id === templateId) ?? null;
  const singleData = toTemplateData(selectedFixture);
  const selectedBackgroundUrl = mediaOptions.find((asset) => asset.id === backgroundAssetId)?.publicUrl ?? null;

  const templateOptions: TemplateOptions = {
    aspectRatio,
    showSponsorStrip,
    showLogo,
    backgroundImageUrl: selectedBackgroundUrl
  };

  const generateCaption = () => {
    if (!selectedTemplate) {
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
    if (!previewRef.current || !selectedTemplate) {
      return;
    }
    try {
      const { width, height } = getExportSize(templateOptions.aspectRatio);
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        width,
        height,
        canvasWidth: width,
        canvasHeight: height,
        style: {
          width: `${width}px`,
          height: `${height}px`
        }
      });

      const fileLabel = composeMode === "summary" ? roundLabel || "round" : selectedFixture?.round_label || "fixture";
      const link = document.createElement("a");
      link.download = `${fileLabel}-${selectedTemplate.component_key}-${templateOptions.aspectRatio}`
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

    const supabase = createClient();
    const { error } = await supabase.from("social_posts").insert({
      club_id: brand.clubId,
      fixture_id: sourceFixture.id,
      template_id: selectedTemplate.id,
      post_type: selectedTemplate.post_type,
      caption: captionToSave,
      status,
      generated_by: null
    });

    if (error) {
      console.error("[social.savePost] Failed save:", error.message);
      setMessage(getFriendlyWriteError(error.message));
      return;
    }

    setCaption(captionToSave);
    setMessage(`Saved as ${status}.`);
  };

  const quickTemplateHint = selectedTemplate ? `${selectedTemplate.name} | ${templateOptions.aspectRatio}` : "Select fixture";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[350px_1fr]">
      <aside className="glass-panel rounded-2xl p-4">
        <div className="space-y-2">
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
          {workflowMode === "quick" ? <p className="text-xs text-command-muted">Fast game-day flow with minimal controls.</p> : null}
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
                      : `${fixture.teams?.name ?? "Rebels"} v ${fixture.opponent_name} · ${formatFixtureTime(fixture.fixture_date)} · ${fixture.home_or_away ?? "TBC"}`}
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

          {workflowMode === "full" ? (
            <>
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
                    onClick={() => setBackgroundAssetId("")}
                    className={`rounded-md border p-2 text-xs ${backgroundAssetId === "" ? "border-command-accent bg-command-accent/10" : "border-white/15 bg-black/20"}`}
                  >
                    No Image
                  </button>
                  {mediaOptions.slice(0, 8).map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => setBackgroundAssetId(asset.id)}
                      className={`overflow-hidden rounded-md border ${backgroundAssetId === asset.id ? "border-command-accent" : "border-white/15"}`}
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
            </>
          ) : null}
        </div>

        <div ref={previewRef} className="overflow-hidden rounded-2xl">
          <SocialPreview
            template={selectedTemplate}
            data={singleData}
            summaryFixtures={summaryFixtures}
            options={templateOptions}
            brand={brand}
          />
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
