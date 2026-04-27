import type { TemplateOptions } from "@/types/social-data";

export type TemplateLayoutKind = "single" | "summary" | "custom";

type TemplateLayout = {
  framePaddingClass: string;
  gridRows: [number, number, number, number];
  headerClass: string;
  heroClass: string;
  contentClass: string;
  contentJustifyClass: string;
  footerClass: string;
  showFooter: boolean;
};

function rowClasses(): Pick<TemplateLayout, "headerClass" | "heroClass" | "contentClass" | "footerClass"> {
  return {
    headerClass: "min-h-0",
    heroClass: "min-h-0",
    contentClass: "min-h-0",
    footerClass: "min-h-0"
  };
}

function rows(header: number, hero: number, content: number, footer: number): [number, number, number, number] {
  return [header, hero, content, footer];
}

export function getTemplateLayout(
  aspectRatio: TemplateOptions["aspectRatio"],
  layoutKind: TemplateLayoutKind,
  showSponsorStrip: boolean
): TemplateLayout {
  // Calibrated export layout ratios are tuned for fixed canvases:
  // square 1080x1080 and portrait 1080x1350.
  // Preview scales this same internal grid down, preserving export parity.
  const framePaddingClass = "p-6 md:p-8";
  const showFooter = showSponsorStrip;
  const classes = rowClasses();

  if (aspectRatio === "portrait") {
    if (layoutKind === "summary") {
      return {
        framePaddingClass,
        gridRows: showSponsorStrip ? rows(15, 2, 73, 10) : rows(15, 2, 83, 0),
        ...classes,
        contentJustifyClass: "justify-start",
        showFooter
      };
    }

    if (layoutKind === "custom") {
      return {
        framePaddingClass,
        gridRows: showSponsorStrip ? rows(16, 3, 71, 10) : rows(16, 3, 81, 0),
        ...classes,
        contentJustifyClass: showSponsorStrip ? "justify-start" : "justify-center",
        showFooter
      };
    }

      return {
        framePaddingClass,
        gridRows: showSponsorStrip ? rows(16, 3, 71, 10) : rows(17, 3, 80, 0),
        ...classes,
        contentJustifyClass: showSponsorStrip ? "justify-start" : "justify-center",
        showFooter
      };
    }

  if (layoutKind === "summary") {
    return {
      framePaddingClass,
      gridRows: showSponsorStrip ? rows(19, 2, 69, 10) : rows(19, 2, 79, 0),
      ...classes,
      contentJustifyClass: "justify-start",
      showFooter
    };
  }

  if (layoutKind === "custom") {
    return {
      framePaddingClass,
      gridRows: showSponsorStrip ? rows(19, 3, 68, 10) : rows(19, 3, 78, 0),
      ...classes,
      contentJustifyClass: showSponsorStrip ? "justify-start" : "justify-center",
      showFooter
    };
  }

  return {
    framePaddingClass,
    gridRows: showSponsorStrip ? rows(20, 3, 67, 10) : rows(21, 3, 76, 0),
    ...classes,
    contentJustifyClass: showSponsorStrip ? "justify-start" : "justify-center",
    showFooter
  };
}
