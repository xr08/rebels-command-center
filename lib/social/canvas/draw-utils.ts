type TextOptions = {
  maxWidth: number;
  lineHeight: number;
  maxLines?: number;
};

type LabelValueBoxOptions = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  value: string;
  textColor?: string;
};

const imageCache = new Map<string, HTMLImageElement>();

export function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((char) => `${char}${char}`).join("")
    : normalized;

  const r = Number.parseInt(value.slice(0, 2), 16) || 0;
  const g = Number.parseInt(value.slice(2, 4), 16) || 0;
  const b = Number.parseInt(value.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string
) {
  roundedRectPath(ctx, x, y, width, height, radius);
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

export function strokeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  strokeStyle: string,
  lineWidth = 1
) {
  roundedRectPath(ctx, x, y, width, height, radius);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

export function truncateText(ctx: CanvasRenderingContext2D, value: string, maxWidth: number) {
  if (ctx.measureText(value).width <= maxWidth) {
    return value;
  }

  let text = value;
  while (text.length > 0 && ctx.measureText(`${text}...`).width > maxWidth) {
    text = text.slice(0, -1);
  }
  return `${text}...`;
}

export function wrapText(ctx: CanvasRenderingContext2D, value: string, options: TextOptions) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const probe = current ? `${current} ${word}` : word;
    if (ctx.measureText(probe).width <= options.maxWidth) {
      current = probe;
      continue;
    }

    if (current) {
      lines.push(current);
    }
    current = word;

    if (options.maxLines && lines.length >= options.maxLines) {
      break;
    }
  }

  if (current && (!options.maxLines || lines.length < options.maxLines)) {
    lines.push(current);
  }

  if (options.maxLines && lines.length > options.maxLines) {
    return lines.slice(0, options.maxLines);
  }

  if (options.maxLines && lines.length === options.maxLines) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = truncateText(ctx, last, options.maxWidth);
  }

  return lines;
}

export function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  options: TextOptions
) {
  const lines = wrapText(ctx, value, options);
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * options.lineHeight);
  });
  return lines.length;
}

export function fitFontSize(
  ctx: CanvasRenderingContext2D,
  value: string,
  fontFamily: string,
  fontWeight: number,
  startSize: number,
  minSize: number,
  maxWidth: number
) {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
    if (ctx.measureText(value).width <= maxWidth) {
      return size;
    }
    size -= 1;
  }
  return minSize;
}

export function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  value: string,
  centerX: number,
  y: number
) {
  const width = ctx.measureText(value).width;
  ctx.fillText(value, centerX - width / 2, y);
}

export function drawLabelValueBox(
  ctx: CanvasRenderingContext2D,
  options: LabelValueBoxOptions
) {
  const textColor = options.textColor ?? "#F3F5F4";
  fillRoundedRect(ctx, options.x, options.y, options.width, options.height, 14, "rgba(255,255,255,0.06)");
  strokeRoundedRect(ctx, options.x, options.y, options.width, options.height, 14, "rgba(255,255,255,0.15)");

  ctx.fillStyle = "rgba(220, 226, 224, 0.75)";
  ctx.font = "600 13px Segoe UI, Arial, sans-serif";
  ctx.fillText(options.label.toUpperCase(), options.x + 20, options.y + 32);

  ctx.fillStyle = textColor;
  ctx.font = "700 46px Segoe UI, Arial, sans-serif";
  const valueSize = fitFontSize(ctx, options.value, "Segoe UI, Arial, sans-serif", 700, 18, 14, options.width - 36);
  ctx.font = `700 ${valueSize}px Segoe UI, Arial, sans-serif`;
  ctx.fillText(options.value, options.x + 20, options.y + options.height - 22);
}

export async function loadImage(url?: string | null) {
  if (!url) {
    return null;
  }
  if (imageCache.has(url)) {
    return imageCache.get(url) ?? null;
  }

  const image = new Image();
  image.crossOrigin = "anonymous";
  image.referrerPolicy = "no-referrer";

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    image.src = url;
  });

  imageCache.set(url, image);
  return image;
}

export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  targetX: number,
  targetY: number,
  targetWidth: number,
  targetHeight: number,
  position: "center" | "top" | "bottom" | "left" | "right" = "center"
) {
  // @ts-expect-error width/height exists for supported canvas image sources.
  const sourceWidth = image.width as number;
  // @ts-expect-error width/height exists for supported canvas image sources.
  const sourceHeight = image.height as number;

  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = targetWidth / targetHeight;

  let sx = 0;
  let sy = 0;
  let sw = sourceWidth;
  let sh = sourceHeight;

  if (sourceRatio > targetRatio) {
    sw = sourceHeight * targetRatio;
    sx = position === "left" ? 0 : position === "right" ? sourceWidth - sw : (sourceWidth - sw) / 2;
  } else {
    sh = sourceWidth / targetRatio;
    sy = position === "top" ? 0 : position === "bottom" ? sourceHeight - sh : (sourceHeight - sh) / 2;
  }

  ctx.drawImage(image, sx, sy, sw, sh, targetX, targetY, targetWidth, targetHeight);
}

export function drawImageContain(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  targetX: number,
  targetY: number,
  targetWidth: number,
  targetHeight: number,
  position: "center" | "top" | "bottom" | "left" | "right" = "center"
) {
  // @ts-expect-error width/height exists for supported canvas image sources.
  const sourceWidth = image.width as number;
  // @ts-expect-error width/height exists for supported canvas image sources.
  const sourceHeight = image.height as number;

  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const dx = position === "left"
    ? targetX
    : position === "right"
      ? targetX + targetWidth - drawWidth
      : targetX + (targetWidth - drawWidth) / 2;
  const dy = position === "top"
    ? targetY
    : position === "bottom"
      ? targetY + targetHeight - drawHeight
      : targetY + (targetHeight - drawHeight) / 2;

  ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
}
