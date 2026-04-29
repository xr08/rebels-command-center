import type { FixtureRecord, SocialTemplateCustomizations, TemplateFixtureProps, TemplateOptions } from "@/types/social-data";
import {
  drawCenteredText,
  drawImageContain,
  drawImageCover,
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
const REBELS_GREEN = "#044229";
const REBELS_DARK = "#02150F";
const REBELS_GOLD = "#FFCD00";
const TEXT = "#F4F7F5";

function getCanvasSize(aspectRatio: TemplateOptions["aspectRatio"]) {
  return aspectRatio === "portrait"
    ? { width: 1080, height: 1350 }
    : { width: 1080, height: 1080 };
}

function getVariation(options: TemplateOptions) {
  return options.customizations?.templateVariation || options.styleVariant || "classic-green";
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

function getOverlayStops(strength: SocialTemplateCustomizations["overlayStrength"]) {
  if (strength === "none") {
    return null;
  }
  if (strength === "light") {
    return [0.22, 0.36] as const;
  }
  if (strength === "strong") {
    return [0.68, 0.82] as const;
  }
  return [0.44, 0.62] as const;
}

function getOverlayAlpha(strength: SocialTemplateCustomizations["overlayStrength"]) {
  if (strength === "none") return 0;
  if (strength === "light") return 0.18;
  if (strength === "strong") return 0.5;
  return 0.34;
}

async function drawPhoto(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: TemplateOptions
) {
  const custom = options.customizations;
  const image = await loadImage(options.backgroundImageUrl);
  if (!image) {
    return false;
  }

  const args = [
    ctx,
    image,
    0,
    0,
    width,
    height,
    custom?.backgroundPosition,
    custom?.backgroundPositionX ?? 50,
    custom?.backgroundPositionY ?? 50,
    custom?.backgroundZoom ?? 1
  ] as const;

  if (custom?.backgroundFit === "contain") {
    drawImageContain(...args);
  } else {
    drawImageCover(...args);
  }

  return true;
}

async function drawBaseBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: TemplateOptions,
  brand: RenderPostArgs["brand"]
) {
  const variation = getVariation(options);
  const hasPhoto = await drawPhoto(ctx, width, height, options);

  if (!hasPhoto) {
    const base = variation === "photo-gradient-gold" ? brand.accentColor || REBELS_GOLD : brand.primaryColor || REBELS_GREEN;
    const fallback = ctx.createLinearGradient(0, 0, width, height);
    fallback.addColorStop(0, base);
    fallback.addColorStop(1, REBELS_DARK);
    ctx.fillStyle = fallback;
    ctx.fillRect(0, 0, width, height);
  }

  if (variation === "minimal-board") {
    ctx.fillStyle = hexToRgba(REBELS_GREEN, 0.9);
    ctx.fillRect(0, 0, width, height);
  } else if (variation === "juniors-energy") {
    ctx.fillStyle = hexToRgba(brand.accentColor || REBELS_GOLD, 0.24);
    ctx.beginPath();
    ctx.arc(width - 120, 126, 230, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.arc(34, height - 110, 180, 0, Math.PI * 2);
    ctx.fill();
  } else if (variation === "classic-green") {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, hexToRgba(brand.primaryColor || REBELS_GREEN, 0.26));
    gradient.addColorStop(1, hexToRgba(REBELS_DARK, 0.66));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  const stops = getOverlayStops(options.customizations?.overlayStrength);
  const alpha = getOverlayAlpha(options.customizations?.overlayStrength);
  if (stops && alpha > 0) {
    const overlay = ctx.createLinearGradient(0, 0, 0, height);
    overlay.addColorStop(0, hexToRgba(REBELS_DARK, Math.max(alpha - 0.06, 0.05)));
    overlay.addColorStop(1, hexToRgba(REBELS_DARK, alpha));
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, width, height);
  }
}

async function drawLogo(
  ctx: CanvasRenderingContext2D,
  brand: RenderPostArgs["brand"],
  x: number,
  y: number,
  size: number,
  ringColor = "rgba(255,255,255,0.30)"
) {
  if (!brand.logoPath) {
    return;
  }
  try {
    const logo = await loadImage(brand.logoPath);
    if (!logo) {
      return;
    }
    drawImageCover(ctx, logo, x, y, size, size);
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2 + 8, 0, Math.PI * 2);
    ctx.stroke();
  } catch {
    // Keep render stable if logo loading fails.
  }
}

async function drawClassicHeader(
  ctx: CanvasRenderingContext2D,
  width: number,
  heading: string,
  subtitle: string,
  brand: RenderPostArgs["brand"],
  logoEnabled: boolean,
  options: TemplateOptions
) {
  const variation = getVariation(options);
  const gold = brand.accentColor || REBELS_GOLD;
  const textColor = variation === "photo-gradient-gold" ? brand.primaryColor || REBELS_GREEN : TEXT;

  ctx.fillStyle = variation === "minimal-board" ? "rgba(255,255,255,0.72)" : gold;
  ctx.font = `900 56px ${FONT_STACK}`;
  ctx.fillText((brand.clubName || "Fremantle Rebels").toUpperCase(), 62, 95);

  ctx.fillStyle = textColor;
  const headingSize = fitFontSize(ctx, heading, FONT_STACK, 900, 92, 48, 620);
  ctx.font = `900 ${headingSize}px ${FONT_STACK}`;
  ctx.fillText(heading, 62, 192);

  ctx.fillStyle = variation === "photo-gradient-gold" ? hexToRgba(REBELS_DARK, 0.82) : "rgba(232, 238, 236, 0.9)";
  const subtitleSize = fitFontSize(ctx, subtitle, FONT_STACK, 700, 50, 22, 680);
  ctx.font = `700 ${subtitleSize}px ${FONT_STACK}`;
  ctx.fillText(subtitle, 62, 260);

  ctx.strokeStyle = gold;
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(62, 312);
  ctx.lineTo(246, 312);
  ctx.stroke();

  if (logoEnabled) {
    await drawLogo(ctx, brand, width - 248, 58, 188);
  }
}

function drawDetailGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  startY: number,
  data: TemplateFixtureProps,
  options: TemplateOptions,
  fill = "rgba(255,255,255,0.06)",
  textColor = TEXT
) {
  const items = [
    { label: "Date", value: data.date },
    ...(options.customizations?.showTime === false ? [] : [{ label: "Time", value: data.time }]),
    ...(options.customizations?.showRound === false ? [] : [{ label: "Round", value: data.round }]),
    ...(options.customizations?.showVenue === false ? [] : [{ label: "Venue", value: data.venue }])
  ];

  const boxGap = 16;
  const boxWidth = items.length === 1 ? width - 156 : (width - 156 - boxGap) / 2;
  const boxHeight = 126;

  items.forEach((item, index) => {
    const row = Math.floor(index / 2);
    const column = index % 2;
    const x = 78 + column * (boxWidth + boxGap);
    const y = startY + row * (boxHeight + boxGap);
    fillRoundedRect(ctx, x, y, boxWidth, boxHeight, 16, fill);
    strokeRoundedRect(ctx, x, y, boxWidth, boxHeight, 16, "rgba(255,255,255,0.14)");
    ctx.fillStyle = hexToRgba(textColor, 0.72);
    ctx.font = `700 24px ${FONT_STACK}`;
    ctx.fillText(item.label.toUpperCase(), x + 22, y + 38);
    ctx.fillStyle = textColor;
    const valueSize = fitFontSize(ctx, item.value, FONT_STACK, 800, 42, 20, boxWidth - 44);
    ctx.font = `800 ${valueSize}px ${FONT_STACK}`;
    ctx.fillText(item.value, x + 22, y + boxHeight - 24);
  });
}

function drawClassicSingle(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: TemplateFixtureProps,
  options: TemplateOptions,
  brand: RenderPostArgs["brand"],
  isResult: boolean
) {
  const variation = getVariation(options);
  const gold = brand.accentColor || REBELS_GOLD;
  const cardTop = height >= 1300 ? 540 : 370;
  const cardBottom = height - 60;
  const cardHeight = cardBottom - cardTop;
  const panelFill = variation === "minimal-board" ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.32)";

  fillRoundedRect(ctx, 48, cardTop, width - 96, cardHeight, 30, panelFill);
  strokeRoundedRect(ctx, 48, cardTop, width - 96, cardHeight, 30, "rgba(255,255,255,0.18)", 2);

  const scoreTop = cardTop + 56;
  const teamCenterY = scoreTop + 108;
  const columnWidth = (width - 180) / 2;
  const leftX = 78;
  const rightX = width - 78 - columnWidth;
  const leftCenter = leftX + columnWidth / 2;
  const rightCenter = rightX + columnWidth / 2;

  ctx.fillStyle = "rgba(230,236,234,0.72)";
  ctx.font = `700 34px ${FONT_STACK}`;
  drawCenteredText(ctx, isResult ? "REBELS" : "HOME", leftCenter, scoreTop);
  drawCenteredText(ctx, data.isBye ? "STATUS" : "OPPONENT", rightCenter, scoreTop);

  if (isResult) {
    const [leftScore, rightScore] = (data.score ?? "- -").split("-");
    ctx.fillStyle = TEXT;
    ctx.font = `900 110px ${FONT_STACK}`;
    drawCenteredText(ctx, data.isBye ? "BYE" : (leftScore || "-"), leftCenter, scoreTop + 132);
    drawCenteredText(ctx, data.isBye ? "BYE" : (rightScore || "-"), rightCenter, scoreTop + 132);
    ctx.fillStyle = gold;
    ctx.font = `900 86px ${FONT_STACK}`;
    drawCenteredText(ctx, data.isBye ? "|" : "-", width / 2, scoreTop + 116);
  } else {
    const leftName = options.customizations?.teamNameOverride?.trim() || data.teamName || "Rebels";
    const rightName = options.customizations?.opponentNameOverride?.trim() || data.opponent;
    ctx.fillStyle = TEXT;
    const leftNameSize = fitFontSize(ctx, leftName, FONT_STACK, 900, 56, 30, columnWidth - 28);
    const rightNameSize = fitFontSize(ctx, rightName, FONT_STACK, 900, 56, 30, columnWidth - 28);
    ctx.font = `900 ${leftNameSize}px ${FONT_STACK}`;
    drawCenteredText(ctx, truncateText(ctx, leftName, columnWidth - 28), leftCenter, teamCenterY + 12);
    ctx.font = `900 ${rightNameSize}px ${FONT_STACK}`;
    drawCenteredText(ctx, truncateText(ctx, rightName, columnWidth - 28), rightCenter, teamCenterY + 12);

    fillRoundedRect(ctx, width / 2 - 46, teamCenterY - 44, 92, 92, 46, hexToRgba(gold, 0.96));
    ctx.fillStyle = REBELS_GREEN;
    ctx.font = `900 42px ${FONT_STACK}`;
    drawCenteredText(ctx, data.isBye ? "|" : "VS", width / 2, teamCenterY + 14);
  }

  let detailsTop = scoreTop + (isResult ? 190 : 212);

  if (isResult) {
    const outcomeLabel = data.resultOutcome === "win" ? "Win" : data.resultOutcome === "loss" ? "Loss" : data.resultOutcome === "draw" ? "Draw" : "Result";
    fillRoundedRect(ctx, 78, detailsTop, width - 156, 112, 18, "rgba(255,255,255,0.07)");
    strokeRoundedRect(ctx, 78, detailsTop, width - 156, 112, 18, "rgba(255,255,255,0.16)", 2);
    ctx.fillStyle = "rgba(225,232,229,0.72)";
    ctx.font = `700 30px ${FONT_STACK}`;
    drawCenteredText(ctx, "OUTCOME", width / 2, detailsTop + 38);
    ctx.fillStyle = TEXT;
    ctx.font = `900 54px ${FONT_STACK}`;
    drawCenteredText(ctx, outcomeLabel, width / 2, detailsTop + 90);
    detailsTop += 132;
  }

  drawDetailGrid(ctx, width, detailsTop, data, options);
}

async function drawPhotoGradientSingle(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  templateKey: CanvasTemplateKey,
  data: TemplateFixtureProps,
  options: TemplateOptions,
  brand: RenderPostArgs["brand"],
  isGold: boolean
) {
  const gold = brand.accentColor || REBELS_GOLD;
  const green = brand.primaryColor || REBELS_GREEN;
  const heading = getDisplayHeading(templateKey, options).toUpperCase();
  const subtitle = getSubtitle(templateKey, data, undefined, options).toUpperCase();
  const panelWidth = width * (isGold ? 0.54 : 0.52);
  const panelX = isGold ? 0 : 0;

  const shade = ctx.createLinearGradient(panelX, 0, panelX + panelWidth, 0);
  if (isGold) {
    shade.addColorStop(0, hexToRgba(gold, 0.94));
    shade.addColorStop(0.78, hexToRgba(gold, 0.68));
    shade.addColorStop(1, hexToRgba(gold, 0));
  } else {
    shade.addColorStop(0, hexToRgba(green, 0.95));
    shade.addColorStop(0.78, hexToRgba(green, 0.72));
    shade.addColorStop(1, hexToRgba(green, 0));
  }
  ctx.fillStyle = shade;
  ctx.fillRect(panelX, 0, panelWidth, height);

  const overlayAlpha = getOverlayAlpha(options.customizations?.overlayStrength);
  ctx.fillStyle = hexToRgba(REBELS_DARK, overlayAlpha > 0 ? Math.max(overlayAlpha * 0.7, 0.12) : 0.08);
  ctx.fillRect(0, 0, width, height);

  await drawLogo(ctx, brand, 62, 60, 126, isGold ? hexToRgba(green, 0.35) : "rgba(255,255,255,0.3)");

  const textColor = isGold ? green : TEXT;
  const softText = isGold ? hexToRgba(REBELS_DARK, 0.72) : "rgba(255,255,255,0.78)";
  const accent = isGold ? green : gold;

  ctx.fillStyle = accent;
  ctx.font = `900 34px ${FONT_STACK}`;
  ctx.fillText((brand.clubName || "Fremantle Rebels").toUpperCase(), 210, 108);

  ctx.fillStyle = textColor;
  ctx.font = `900 ${fitFontSize(ctx, heading, FONT_STACK, 900, 118, 58, panelWidth - 118)}px ${FONT_STACK}`;
  ctx.fillText(heading, 62, height >= 1300 ? 290 : 250);

  ctx.fillStyle = softText;
  ctx.font = `800 ${fitFontSize(ctx, subtitle, FONT_STACK, 800, 42, 24, panelWidth - 118)}px ${FONT_STACK}`;
  ctx.fillText(subtitle, 66, height >= 1300 ? 348 : 306);

  ctx.strokeStyle = accent;
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(66, height >= 1300 ? 386 : 344);
  ctx.lineTo(240, height >= 1300 ? 386 : 344);
  ctx.stroke();

  const teamY = height >= 1300 ? 510 : 440;
  const maxText = panelWidth - 110;
  const displayTeamName = options.customizations?.teamNameOverride?.trim() || data.teamName || "Rebels";
  const displayOpponent = options.customizations?.opponentNameOverride?.trim() || data.opponent;
  if (templateKey === "result_single") {
    const [leftScore, rightScore] = (data.score ?? "- -").split("-");
    ctx.fillStyle = textColor;
    ctx.font = `900 84px ${FONT_STACK}`;
    ctx.fillText(`${leftScore || "-"} - ${rightScore || "-"}`, 66, teamY);
    ctx.fillStyle = softText;
    ctx.font = `800 38px ${FONT_STACK}`;
    ctx.fillText(`${displayTeamName} v ${displayOpponent}`, 66, teamY + 58);
  } else {
    ctx.fillStyle = textColor;
    ctx.font = `900 ${fitFontSize(ctx, displayTeamName, FONT_STACK, 900, 68, 34, maxText)}px ${FONT_STACK}`;
    ctx.fillText(displayTeamName, 66, teamY);
    ctx.fillStyle = accent;
    ctx.font = `900 44px ${FONT_STACK}`;
    ctx.fillText(data.isBye ? "|" : "VS", 66, teamY + 64);
    ctx.fillStyle = textColor;
    ctx.font = `900 ${fitFontSize(ctx, displayOpponent, FONT_STACK, 900, 68, 34, maxText)}px ${FONT_STACK}`;
    drawWrappedText(ctx, displayOpponent, 66, teamY + 132, {
      maxWidth: maxText,
      lineHeight: 74,
      maxLines: 2
    });
  }

  const detailsY = height >= 1300 ? height - 350 : height - 300;
  const detailFill = isGold ? "rgba(4,66,41,0.12)" : "rgba(255,255,255,0.10)";
  drawDetailGrid(ctx, Math.floor(panelWidth + 78), detailsY, data, options, detailFill, textColor);
}

function drawTeamListPhoto(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  templateKey: CanvasTemplateKey,
  data: TemplateFixtureProps | null | undefined,
  options: TemplateOptions,
  brand: RenderPostArgs["brand"]
) {
  const custom = options.customizations;
  const panelWidth = width * 0.58;
  const green = brand.primaryColor || REBELS_GREEN;
  const gold = brand.accentColor || REBELS_GOLD;
  const gradient = ctx.createLinearGradient(0, 0, panelWidth, 0);
  gradient.addColorStop(0, hexToRgba(REBELS_DARK, 0.96));
  gradient.addColorStop(0.66, hexToRgba(green, 0.9));
  gradient.addColorStop(1, hexToRgba(green, 0.05));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, panelWidth, height);

  ctx.strokeStyle = gold;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(64, 76);
  ctx.lineTo(64, height - 84);
  ctx.stroke();

  const title = (custom?.listTitle || custom?.headlineOverride || "TEAM LIST").toUpperCase();
  const subtitle = custom?.listSubtitle || custom?.subheadingOverride || (data ? `${data.round} | ${data.teamName ?? "Rebels"}` : getHeading(templateKey));
  ctx.fillStyle = gold;
  ctx.font = `900 34px ${FONT_STACK}`;
  ctx.fillText((brand.clubName || "Fremantle Rebels").toUpperCase(), 94, 108);

  ctx.fillStyle = TEXT;
  ctx.font = `900 ${fitFontSize(ctx, title, FONT_STACK, 900, 98, 48, panelWidth - 142)}px ${FONT_STACK}`;
  ctx.fillText(title, 94, 210);

  ctx.fillStyle = "rgba(255,255,255,0.76)";
  ctx.font = `800 ${fitFontSize(ctx, subtitle, FONT_STACK, 800, 36, 20, panelWidth - 142)}px ${FONT_STACK}`;
  ctx.fillText(subtitle, 98, 262);

  const rows = (custom?.listRows ?? []).slice(0, height >= 1300 ? 12 : 9);
  const startY = height >= 1300 ? 350 : 320;
  const rowHeight = height >= 1300 ? 70 : 62;
  const rowWidth = panelWidth - 150;

  if (!rows.length) {
    fillRoundedRect(ctx, 94, startY, rowWidth, 112, 18, "rgba(255,255,255,0.10)");
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.font = `700 30px ${FONT_STACK}`;
    ctx.fillText("Add lineup rows in Safe Customisation", 120, startY + 68);
    return;
  }

  rows.forEach((row, index) => {
    const y = startY + index * rowHeight;
    fillRoundedRect(ctx, 94, y, rowWidth, rowHeight - 10, 16, index % 2 === 0 ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.06)");
    ctx.fillStyle = gold;
    ctx.font = `900 28px ${FONT_STACK}`;
    const rowLabel = row.type === "number" && row.label ? `#${row.label}` : (row.label || "-").toUpperCase();
    ctx.fillText(rowLabel, 118, y + 40);
    ctx.fillStyle = TEXT;
    ctx.font = `800 ${fitFontSize(ctx, row.playerName || "Player Name", FONT_STACK, 800, 34, 20, rowWidth - 122)}px ${FONT_STACK}`;
    ctx.fillText(row.playerName || "Player Name", 184, y + 40);
  });
}

function drawSummaryCard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fixtures: FixtureRecord[],
  options: TemplateOptions,
  brand: RenderPostArgs["brand"],
  isResult: boolean
) {
  const variation = getVariation(options);
  const heading = getDisplayHeading(isResult ? "round_results_summary" : "round_preview_summary", options);
  const subtitle = getSubtitle(isResult ? "round_results_summary" : "round_preview_summary", null, fixtures, options);
  const maxPanelBottom = height - 60;
  const panelWidth = width - 112;
  const grouped = fixtures.reduce<Record<string, FixtureRecord[]>>((acc, fixture) => {
    const key = fixture.teams?.stream ?? "all";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(fixture);
    return acc;
  }, {});
  const entries = Object.entries(grouped);
  const totalRows = Math.max(fixtures.length + entries.length, 1);
  const baseRowGap = totalRows > 12 ? 7 : 10;
  const streamHeaderHeight = totalRows > 12 ? 22 : 26;
  const sectionBreak = 20;
  const panelBottom = maxPanelBottom;
  const maxPanelHeight = height >= 1300 ? 760 : 620;
  const minPanelHeight = height >= 1300 ? 430 : 360;
  const requestedPanelHeight = Math.min(maxPanelHeight, Math.max(minPanelHeight, 180 + fixtures.length * 46 + entries.length * 36));
  const panelTop = panelBottom - requestedPanelHeight;

  if (variation === "photo-gradient-green" || variation === "photo-gradient-gold") {
    const panelGradient = ctx.createLinearGradient(56, panelTop, 56 + panelWidth, panelTop);
    if (variation === "photo-gradient-gold") {
      panelGradient.addColorStop(0, hexToRgba(REBELS_GOLD, 0.9));
      panelGradient.addColorStop(0.66, hexToRgba(REBELS_GOLD, 0.58));
      panelGradient.addColorStop(1, hexToRgba(REBELS_GOLD, 0.1));
    } else {
      panelGradient.addColorStop(0, hexToRgba(REBELS_GREEN, 0.9));
      panelGradient.addColorStop(0.66, hexToRgba(REBELS_GREEN, 0.62));
      panelGradient.addColorStop(1, hexToRgba(REBELS_GREEN, 0.1));
    }
    fillRoundedRect(ctx, 56, panelTop, panelWidth, panelBottom - panelTop, 28, panelGradient);
  } else {
    fillRoundedRect(ctx, 56, panelTop, panelWidth, panelBottom - panelTop, 28, variation === "minimal-board" ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.34)");
  }
  strokeRoundedRect(ctx, 56, panelTop, panelWidth, panelBottom - panelTop, 28, "rgba(255,255,255,0.18)", 2);

  ctx.fillStyle = TEXT;
  ctx.font = `900 ${fitFontSize(ctx, heading, FONT_STACK, 900, 64, 36, panelWidth - 56)}px ${FONT_STACK}`;
  ctx.fillText(heading, 88, panelTop + 76);
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.font = `700 ${fitFontSize(ctx, subtitle, FONT_STACK, 700, 30, 18, panelWidth - 56)}px ${FONT_STACK}`;
  ctx.fillText(subtitle, 90, panelTop + 116);

  const listTop = panelTop + 166;
  const listBottom = panelBottom - 26;
  const rowSpace = Math.max(listBottom - listTop, 200);
  const dynamicRowHeight = fixtures.length
    ? Math.max(34, Math.min(64, Math.floor((rowSpace - (entries.length * (streamHeaderHeight + 12)) - ((entries.length - 1) * sectionBreak) - (fixtures.length * baseRowGap)) / fixtures.length)))
    : 44;

  let y = listTop;
  let streamIndex = 0;

  for (const [stream, streamFixtures] of entries) {
    if (streamIndex > 0) {
      y += sectionBreak;
    }
    ctx.fillStyle = brand.accentColor || REBELS_GOLD;
    ctx.font = `800 ${totalRows > 12 ? 24 : 28}px ${FONT_STACK}`;
    const streamLabel = stream === "mens" ? "MENS" : stream === "womens" ? "WOMENS" : stream === "juniors" ? "JUNIORS" : "ALL";
    ctx.fillText(`${streamLabel} | ${streamFixtures.length} FIXTURES`, 88, y);
    y += streamHeaderHeight + 12;

    for (const fixture of streamFixtures) {
      fillRoundedRect(ctx, 88, y, panelWidth - 64, dynamicRowHeight, 14, "rgba(255,255,255,0.06)");
      strokeRoundedRect(ctx, 88, y, panelWidth - 64, dynamicRowHeight, 14, "rgba(255,255,255,0.13)", 1.4);

      ctx.fillStyle = TEXT;
      ctx.font = `700 ${totalRows > 12 ? 17 : 20}px ${FONT_STACK}`;
      const team = formatSummaryName(fixture.teams?.name ?? "Rebels");
      const opponent = fixture.is_bye ? "BYE" : formatSummaryName(fixture.opponent_name);
      const side = fixture.home_or_away ?? "TBC";
      const fixtureTime = options.customizations?.showTime === false ? "" : ` | ${formatFixtureTime(fixture.fixture_date)}`;
      const match = fixture.is_bye ? `${team} | BYE` : `${team} v ${opponent}${fixtureTime} | ${side}`;
      ctx.fillText(truncateText(ctx, match, panelWidth - (isResult ? 190 : 110)), 106, y + dynamicRowHeight / 2 + 8);

      if (isResult) {
        const score = fixture.is_bye ? "BYE" : `${fixture.home_score ?? "-"}-${fixture.away_score ?? "-"}`;
        ctx.fillStyle = brand.accentColor || REBELS_GOLD;
        ctx.font = `900 ${totalRows > 12 ? 16 : 18}px ${FONT_STACK}`;
        ctx.fillText(truncateText(ctx, score, 96), width - 168, y + dynamicRowHeight / 2 + 7);
      }

      y += dynamicRowHeight + baseRowGap;
      if (y > panelBottom - 32) {
        return;
      }
    }
    streamIndex += 1;
  }
}

function drawSponsorStrip() {
  // Sponsor strip intentionally disabled while placeholder partner tagging is refined.
}

export async function renderPostToCanvas(args: RenderPostArgs) {
  const { canvas, templateKey, options, brand } = args;
  const variation = getVariation(options);
  const { width, height } = getCanvasSize(options.aspectRatio);
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  await drawBaseBackground(ctx, width, height, options, brand);

  const heading = getDisplayHeading(templateKey, options);
  const subtitle = getSubtitle(templateKey, args.data, args.summaryFixtures, options);

  if (variation === "team-list-photo") {
    drawTeamListPhoto(ctx, width, height, templateKey, args.data, options, brand);
    return;
  }

  if ((variation === "photo-gradient-green" || variation === "photo-gradient-gold") && (templateKey === "game_day_single" || templateKey === "result_single") && args.data) {
    await drawPhotoGradientSingle(ctx, width, height, templateKey, args.data, options, brand, variation === "photo-gradient-gold");
    return;
  }

  await drawClassicHeader(ctx, width, heading, subtitle, brand, options.showLogo, options);

  if (templateKey === "game_day_single" || templateKey === "result_single") {
    if (!args.data) {
      drawSponsorStrip();
      return;
    }
    drawClassicSingle(ctx, width, height, args.data, options, brand, templateKey === "result_single");
    return;
  }

  drawSummaryCard(
    ctx,
    width,
    height,
    args.summaryFixtures ?? [],
    options,
    brand,
    templateKey === "round_results_summary"
  );
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
