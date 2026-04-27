"use client";

import { useEffect, useRef } from "react";
import { renderPostToCanvas, type CanvasTemplateKey } from "@/lib/social/canvas/render-post";
import type { FixtureRecord, TemplateFixtureProps, TemplateOptions } from "@/types/social-data";

type Props = {
  templateKey: CanvasTemplateKey;
  data?: TemplateFixtureProps | null;
  summaryFixtures?: FixtureRecord[];
  options: TemplateOptions;
  brand: {
    clubName: string;
    primaryColor: string;
    accentColor: string;
    logoPath?: string | null;
  };
};

export function CanvasPreview({ templateKey, data, summaryFixtures, options, brand }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPortrait = options.aspectRatio === "portrait";

  useEffect(() => {
    let active = true;
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    void renderPostToCanvas({
      canvas,
      templateKey,
      data,
      summaryFixtures,
      options,
      brand
    }).catch((error) => {
      if (!active) {
        return;
      }
      console.error("[canvas-preview] Failed to render canvas preview:", error);
    });

    return () => {
      active = false;
    };
  }, [templateKey, data, summaryFixtures, options, brand]);

  return (
    <div className={`relative mx-auto w-full overflow-hidden rounded-3xl border border-white/15 shadow-premium ${isPortrait ? "aspect-[4/5] max-w-[500px]" : "aspect-square max-w-[560px]"}`}>
      <canvas
        ref={canvasRef}
        className="h-full w-full object-contain"
        width={isPortrait ? 1080 : 1080}
        height={isPortrait ? 1350 : 1080}
      />
    </div>
  );
}
