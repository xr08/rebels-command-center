import type { FixtureRecord, SocialTemplateCustomizations, TemplateFixtureProps, TemplateOptions } from "@/types/social-data";
import {
  drawCenteredText,
  drawImageCover,
  drawImageContain,
  drawLabelValueBox,
  drawWrappedText,
  fillRoundedRect,
  fitFontSize,
  hexToRgba,
  loadImage,
  strokeRoundedRect,
  truncateText
} from "./draw-utils";

export type CanvasTemplateKey =
  | "game_day_single"
  | "result_single"
  | "round_preview_summary"
  | "round_results_summary";

type RenderPostArgs = {
  canvas: HTMLCanvasElement;
  templateKey: CanvasTemplateKey;
  options: TemplateOptions;
  brand: {
    clubName: string;
    primaryColor: string;
    accentColor: string;
    logoPath?: string | null;
  };
  data?: TemplateFixtureProps | null;
  summaryFixtures?: FixtureRecord[];
};

const FONT_STACK = "Segoe UI, Arial, sans-serif";

function getCanvasSize(aspectRatio: TemplateOptions["aspectRatio"]) {
  return aspectRatio === "portrait"
    ? { width: 1080, height: 1350 }
    : { width: 1080, height: 1080 };
}

function formatSummaryName(raw: string) {
  return raw
    .replace(/Fremantle Rebels/gi, "Rebels")
    .replace(/Cockburn Cougars/gi, "Cougars")
    .replace(/Woodland Wolves|Woodlands Wolves/gi, "Woodlands")
    .replace(/Ellenbrook Easterns/gi, "Ellenbrook")
    .replace(/Bayswater Morley/gi, "Bayswater")
    .replace(/Morley Eagles/gi, "Morley")
    .replace(/Carine Cats/gi, "Carine")
    .replace(/Bedford Men's/gi, "Bedford")
    .replace(/Balga Bandits/gi, "Balga")
    .replace(/Vikings White/gi, "Vikings W")
    .replace(/Vikings Green/gi, "Vikings G")
    .replace(/\bu(12|14|16|18)\b/gi, (_, n) => `U${n}`);
}

function formatFixtureTime(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(new Date(value)).toLowerCase();
}

function getHeading(templateKey: CanvasTemplateKey) {
  if (templateKey === "result_single") {
    return "Final Score";
  }
  if (templateKey === "round_preview_summary") {
    return "Round Preview";
  }
  if (templateKey === "round_results_summary") {
    return "Round Results";
  }
  return "Game Day";
}

function getDisplayHeading(templateKey: CanvasTemplateKey, options: TemplateOptions) {
  return options.customizations?.headlineOverride?.trim() || getHeading(templateKey);
}

function getSubtitle(
  templateKey: CanvasTemplateKey,
  data: TemplateFixtureProps | null | undefined,
  summaryFixtures: FixtureRecord[] | undefined,
  options: TemplateOptions
) {
  const override = options.customizations?.subheadingOverride?.trim();
  if (override) {
    return override;
  }

  if (templateKey === "round_preview_summary" || templateKey === "round_results_summary") {
    const round = summaryFixtures?.[0]?.round_label ?? "Round";
    const count = summaryFixtures?.length ?? 0;
    const date = summaryFixtures?.[0]?.fixture_date
      ? new Intl.DateTimeFormat("en-AU", { weekday: "long", day: "numeric", month: "long" }).format(new Date(summaryFixtures[0].fixture_date))
      : "Date TBC";
    return options.customizations?.showRound === false
      ? `${count} Fixtures | ${date}`
      : `${round} | ${count} Fixtures | ${date}`;
  }
  if (!data) {
    return "Rebels Command Center";
  }
  return options.customizations?.showRound === false
    ? data.teamName ?? "Rebels"
    : `${data.round} | ${data.teamName ?? "Rebels"}`;
}

function getImageOverlayStops(strength: SocialTemplateCustomizations["overlayStrength"]) {
  if (strength === "none") {
    return null;
  }
  if (strength === "light") {
    return [0.28, 0.44] as const;
  }
  if (strength === "strong") {
    return [0.72, 0.84] as const;
  }
  return [0.55, 0.72] as const;
}

async function drawBaseBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  primaryColor: string,
  accentColor: string,
  options: TemplateOptions
) {
  const customizations = options.customizations;
  const backgroundImage = options.backgroundImageUrl;
  ctx.fillStyle = primaryColor;
  ctx.fillRect(0, 0, width, height);

  if (backgroundImage) {
    try {
      const image = await loadImage(backgroundImage);
      if (!image) {
        return;
      }
      if (customizations?.backgroundFit === "contain") {
        drawImageContain(ctx, image, 0, 0, width, height, customizations.backgroundPosition);
      } else {
        drawImageCover(ctx, image, 0, 0, width, height, customizations?.backgroundPosition);
      }

      const stops = getImageOverlayStops(customizations?.overlayStrength);
      if (stops) {
        const overlay = ctx.createLinearGradient(0, 0, 0, height);
        overlay.addColorStop(0, hexToRgba("#021B12", stops[0]));
        overlay.addColorStop(1, hexToRgba("#021B12", stops[1]));
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, width, height);
      }
    } catch {
      // Graceful fallback: keep graphic-only background.
    }
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, hexToRgba(primaryColor, 0.22));
  gradient.addColorStop(1, hexToRgba("#02150F", 0.64));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = hexToRgba(accentColor, 0.32);
  ctx.beginPath();
  ctx.arc(width - 95, 105, 190, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.arc(26, height - 120, 156, 0, Math.PI * 2);
  ctx.fill();
}

async function drawHeader(
  ctx: CanvasRenderingContext2D,
  width: number,
  heading: string,
  subtitle: string,
  brand: RenderPostArgs["brand"],
  logoEnabled: boolean
) {
  ctx.fillStyle = brand.accentColor || "#FFCD00";
  ctx.font = `900 56px ${FONT_STACK}`;
  ctx.fillText((brand.clubName || "Fremantle Rebels").toUpperCase(), 62, 95);

  ctx.fillStyle = "#F2F5F4";
  const headingSize = fitFontSize(ctx, heading, FONT_STACK, 900, 92, 48, 620);
  ctx.font = `900 ${headingSize}px ${FONT_STACK}`;
  ctx.fillText(heading, 62, 192);

  ctx.fillStyle = "rgba(232, 238, 236, 0.9)";
  ctx.font = `700 52px ${FONT_STACK}`;
  const subtitleSize = fitFontSize(ctx, subtitle, FONT_STACK, 700, 50, 22, 680);
  ctx.font = `700 ${subtitleSize}px ${FONT_STACK}`;
  ctx.fillText(subtitle, 62, 260);

  ctx.strokeStyle = brand.accentColor || "#FFCD00";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(62, 312);
  ctx.lineTo(246, 312);
  ctx.stroke();

  if (logoEnabled && brand.logoPath) {
    try {
      const logo = await loadImage(brand.logoPath);
      if (logo) {
        const size = 188;
        drawImageCover(ctx, logo, width - size - 60, 58, size, size);

        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(width - 154, 152, 102, 0, Math.PI * 2);
        ctx.stroke();
      }
    } catch {
      // Ignore logo failures; keep render stable.
    }
  }
}

function drawSingleCard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: TemplateFixtureProps,
  accentColor: string,
  showSponsor: boolean,
  options: TemplateOptions,
  isResult: boolean
) {
  const cardTop = height >= 1300 ? 540 : 370;
  const footerReserve = showSponsor ? 150 : 60;
  const cardBottom = height - footerReserve;
  const cardHeight = cardBottom - cardTop;

  fillRoundedRect(ctx, 48, cardTop, width - 96, cardHeight, 30, "rgba(0,0,0,0.30)");
  strokeRoundedRect(ctx, 48, cardTop, width - 96, cardHeight, 30, "rgba(255,255,255,0.18)", 2);

  const scoreTop = cardTop + 56;
  const columnWidth = (width - 140) / 2;
  const leftCenter = 70 + columnWidth / 2;
  const rightCenter = width - 70 - columnWidth / 2;

  ctx.fillStyle = "rgba(230,236,234,0.72)";
  ctx.font = `700 38px ${FONT_STACK}`;
  drawCenteredText(ctx, isResult ? "REBELS" : "HOME", leftCenter, scoreTop);
  drawCenteredText(ctx, data.isBye ? "STATUS" : "OPPONENT", rightCenter, scoreTop);

  if (isResult) {
    const [leftScore, rightScore] = (data.score ?? "- -").split("-");
    ctx.fillStyle = "#F2F5F4";
    ctx.font = `900 104px ${FONT_STACK}`;
    drawCenteredText(ctx, data.isBye ? "BYE" : (leftScore || "-"), leftCenter, scoreTop + 118);
    drawCenteredText(ctx, data.isBye ? "BYE" : (rightScore || "-"), rightCenter, scoreTop + 118);
    ctx.fillStyle = accentColor;
    ctx.font = `900 92px ${FONT_STACK}`;
    drawCenteredText(ctx, data.isBye ? "|" : "-", width / 2, scoreTop + 108);
  } else {
    ctx.fillStyle = "#F2F5F4";
    ctx.font = `900 46px ${FONT_STACK}`;
    const leftNameSize = fitFontSize(ctx, data.teamName ?? "Rebels", FONT_STACK, 900, 72, 38, columnWidth - 40);
    const rightNameSize = fitFontSize(ctx, data.opponent, FONT_STACK, 900, 72, 38, columnWidth - 40);
    ctx.font = `900 ${leftNameSize}px ${FONT_STACK}`;
    const leftLines = drawWrappedText(ctx, data.teamName ?? "Rebels", leftCenter - (columnWidth - 40) / 2, scoreTop + 76, {
      maxWidth: columnWidth - 40,
      lineHeight: leftNameSize + 6,
      maxLines: 2
    });
    ctx.font = `900 ${rightNameSize}px ${FONT_STACK}`;
    const rightLines = drawWrappedText(ctx, data.opponent, rightCenter - (columnWidth - 40) / 2, scoreTop + 76, {
      maxWidth: columnWidth - 40,
      lineHeight: rightNameSize + 6,
      maxLines: 2
    });
    ctx.fillStyle = accentColor;
    ctx.font = `900 64px ${FONT_STACK}`;
    drawCenteredText(ctx, data.isBye ? "|" : "VS", width / 2, scoreTop + Math.max(leftLines, rightLines) * 60 + 34);
  }

  let detailsTop = scoreTop + (isResult ? 158 : 192);

  if (isResult) {
    const outcomeLabel = data.resultOutcome === "win" ? "Win" : data.resultOutcome === "loss" ? "Loss" : data.resultOutcome === "draw" ? "Draw" : "Result";
    fillRoundedRect(ctx, 78, detailsTop, width - 156, 120, 18, "rgba(255,255,255,0.06)");
    strokeRoundedRect(ctx, 78, detailsTop, width - 156, 120, 18, "rgba(255,255,255,0.15)", 2);
    ctx.fillStyle = "rgba(225,232,229,0.72)";
    ctx.font = `700 36px ${FONT_STACK}`;
    drawCenteredText(ctx, "OUTCOME", width / 2, detailsTop + 42);
    ctx.fillStyle = "#F2F5F4";
    ctx.font = `800 54px ${FONT_STACK}`;
    drawCenteredText(ctx, outcomeLabel, width / 2, detailsTop + 92);
    detailsTop += 138;
  }

  const detailItems = [
    { label: "Date", value: data.date },
    ...(options.customizations?.showTime === false ? [] : [{ label: "Time", value: data.time }]),
    ...(options.customizations?.showRound === false ? [] : [{ label: "Round", value: data.round }]),
    ...(options.customizations?.showVenue === false ? [] : [{ label: "Venue", value: data.venue }])
  ];

  const boxGap = 16;
  const boxWidth = detailItems.length === 1 ? width - 156 : (width - 48 - 48 - boxGap) / 2;
  const boxHeight = 128;

  detailItems.forEach((item, index) => {
    const row = Math.floor(index / 2);
    const column = index % 2;
    drawLabelValueBox(ctx, {
      x: 78 + column * (boxWidth + boxGap),
      y: detailsTop + row * (boxHeight + boxGap),
      width: boxWidth,
      height: boxHeight,
      label: item.label,
      value: item.value
    });
  });
}

function drawSummaryCard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fixtures: FixtureRecord[],
  showSponsor: boolean,
  options: TemplateOptions,
  isResult: boolean
) {
  const cardTop = height >= 1300 ? 460 : 360;
  const footerReserve = showSponsor ? 150 : 60;
  const cardBottom = height - footerReserve;
  const cardHeight = cardBottom - cardTop;

  fillRoundedRect(ctx, 48, cardTop, width - 96, cardHeight, 30, "rgba(0,0,0,0.30)");
  strokeRoundedRect(ctx, 48, cardTop, width - 96, cardHeight, 30, "rgba(255,255,255,0.18)", 2);

  const grouped = fixtures.reduce<Record<string, FixtureRecord[]>>((acc, fixture) => {
    const key = fixture.teams?.stream ?? "all";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(fixture);
    return acc;
  }, {});

  const streamEntries = Object.entries(grouped);
  const totalRows = fixtures.length + streamEntries.length;
  const rowHeight = totalRows > 12 ? 40 : totalRows > 8 ? 46 : 54;
  const rowGap = totalRows > 12 ? 7 : 10;
  const panelX = 74;
  const panelWidth = width - 148;
  let y = cardTop + 52;

  ctx.font = `700 ${totalRows > 12 ? 32 : 36}px ${FONT_STACK}`;
  for (const [stream, streamFixtures] of streamEntries) {
    ctx.fillStyle = "rgba(226, 232, 230, 0.78)";
    const streamLabel = stream === "mens" ? "MENS" : stream === "womens" ? "WOMENS" : stream === "juniors" ? "JUNIORS" : "ALL";
    ctx.fillText(`${streamLabel} | ${streamFixtures.length} FIXTURES`, panelX, y);
    y += rowGap + 18;

    for (const fixture of streamFixtures) {
      fillRoundedRect(ctx, panelX, y, panelWidth, rowHeight, 14, "rgba(255,255,255,0.05)");
      strokeRoundedRect(ctx, panelX, y, panelWidth, rowHeight, 14, "rgba(255,255,255,0.14)", 1.6);

      ctx.fillStyle = "#F3F6F5";
      ctx.font = `700 ${totalRows > 12 ? 18 : 20}px ${FONT_STACK}`;
      const team = formatSummaryName(fixture.teams?.name ?? "Rebels");
      const opponent = fixture.is_bye ? "BYE" : formatSummaryName(fixture.opponent_name);
      const side = fixture.home_or_away ?? "TBC";
      const fixtureTime = options.customizations?.showTime === false ? "" : ` | ${formatFixtureTime(fixture.fixture_date)}`;
      const match = fixture.is_bye
        ? `${team} | BYE`
        : `${team} v ${opponent}${fixtureTime} | ${side}`;
      const display = truncateText(ctx, match, panelWidth - (isResult ? 130 : 42));
      ctx.fillText(display, panelX + 16, y + rowHeight / 2 + 8);

      if (isResult) {
        const score = fixture.is_bye ? "BYE" : `${fixture.home_score ?? "-"}-${fixture.away_score ?? "-"}`;
        ctx.fillStyle = "#FFCD00";
        ctx.font = `800 ${totalRows > 12 ? 16 : 18}px ${FONT_STACK}`;
        const scoreText = truncateText(ctx, score, 96);
        ctx.fillText(scoreText, panelX + panelWidth - 98, y + rowHeight / 2 + 7);
      }

      y += rowHeight + rowGap;
      if (y > cardBottom - 30) {
        return;
      }
    }
  }
}

function drawSponsorStrip(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  showSponsor: boolean
) {
  if (!showSponsor) {
    return;
  }

  const stripWidth = 380;
  const stripHeight = 106;
  const x = 62;
  const y = height - stripHeight - 42;

  fillRoundedRect(ctx, x, y, stripWidth, stripHeight, 22, "rgba(0,0,0,0.34)");
  strokeRoundedRect(ctx, x, y, stripWidth, stripHeight, 22, "rgba(255,255,255,0.2)", 2);

  ctx.fillStyle = "rgba(228, 234, 232, 0.78)";
  ctx.font = `700 33px ${FONT_STACK}`;
  ctx.fillText("PROUDLY SUPPORTED BY", x + 24, y + 38);
  ctx.fillStyle = "#F0F4F2";
  ctx.font = `700 46px ${FONT_STACK}`;
  ctx.fillText("Fremantle Rebels Partners", x + 24, y + 82);
}

export async function renderPostToCanvas(args: RenderPostArgs) {
  const { canvas, templateKey, options, brand } = args;
  const showSponsorStrip = options.customizations?.showSponsorStrip ?? options.showSponsorStrip;
  const { width, height } = getCanvasSize(options.aspectRatio);
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  await drawBaseBackground(
    ctx,
    width,
    height,
    brand.primaryColor || "#044229",
    brand.accentColor || "#FFCD00",
    options
  );

  const heading = getDisplayHeading(templateKey, options);
  const subtitle = getSubtitle(templateKey, args.data, args.summaryFixtures, options);
  await drawHeader(ctx, width, heading, subtitle, brand, options.showLogo);

  if (templateKey === "game_day_single" || templateKey === "result_single") {
    if (!args.data) {
      drawSponsorStrip(ctx, width, height, showSponsorStrip);
      return;
    }
    drawSingleCard(
      ctx,
      width,
      height,
      args.data,
      brand.accentColor || "#FFCD00",
      showSponsorStrip,
      options,
      templateKey === "result_single"
    );
  } else {
    drawSummaryCard(
      ctx,
      width,
      height,
      args.summaryFixtures ?? [],
      showSponsorStrip,
      options,
      templateKey === "round_results_summary"
    );
  }

  drawSponsorStrip(ctx, width, height, showSponsorStrip);
}

export async function renderPostToDataUrl(args: Omit<RenderPostArgs, "canvas">) {
  const canvas = document.createElement("canvas");
  await renderPostToCanvas({ ...args, canvas });
  return canvas.toDataURL("image/png");
}

export function isCanvasTemplateKey(value: string): value is CanvasTemplateKey {
  return value === "game_day_single"
    || value === "result_single"
    || value === "round_preview_summary"
    || value === "round_results_summary";
}
