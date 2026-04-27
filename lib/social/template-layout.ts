import type { TemplateOptions } from "@/types/social-data";

export type TemplateLayoutKind = "single" | "summary" | "custom";

type TemplateLayout = {
  framePaddingClass: string;
  headerClass: string;
  heroClass: string;
  contentClass: string;
  footerClass: string;
  showFooter: boolean;
};

function rowsToTemplate(rows: {
  header: string;
  hero: string;
  content: string;
  footer: string;
}): Pick<TemplateLayout, "headerClass" | "heroClass" | "contentClass" | "footerClass"> {
  return {
    headerClass: rows.header,
    heroClass: rows.hero,
    contentClass: rows.content,
    footerClass: rows.footer
  };
}

export function getTemplateLayout(
  aspectRatio: TemplateOptions["aspectRatio"],
  layoutKind: TemplateLayoutKind,
  showSponsorStrip: boolean
): TemplateLayout {
  const framePaddingClass = aspectRatio === "portrait" ? "p-6 md:p-8" : "p-6 md:p-8";
  const footerOffClass = "hidden";
  const showFooter = showSponsorStrip;

  if (aspectRatio === "portrait") {
    if (layoutKind === "summary") {
      return {
        framePaddingClass,
        ...rowsToTemplate({
          header: "min-h-[16%]",
          hero: showSponsorStrip ? "min-h-[3%]" : "min-h-[2%]",
          content: showSponsorStrip ? "min-h-[69%]" : "min-h-[82%]",
          footer: showSponsorStrip ? "min-h-[12%]" : footerOffClass
        }),
        showFooter
      };
    }

    if (layoutKind === "custom") {
      return {
        framePaddingClass,
        ...rowsToTemplate({
          header: "min-h-[15%]",
          hero: showSponsorStrip ? "min-h-[5%]" : "min-h-[4%]",
          content: showSponsorStrip ? "min-h-[70%]" : "min-h-[81%]",
          footer: showSponsorStrip ? "min-h-[10%]" : footerOffClass
        }),
        showFooter
      };
    }

    return {
      framePaddingClass,
      ...rowsToTemplate({
        header: "min-h-[16%]",
        hero: showSponsorStrip ? "min-h-[7%]" : "min-h-[6%]",
        content: showSponsorStrip ? "min-h-[67%]" : "min-h-[78%]",
        footer: showSponsorStrip ? "min-h-[10%]" : footerOffClass
      }),
      showFooter
    };
  }

  if (layoutKind === "summary") {
    return {
      framePaddingClass,
      ...rowsToTemplate({
        header: "min-h-[20%]",
        hero: "min-h-[2%]",
        content: showSponsorStrip ? "min-h-[68%]" : "min-h-[78%]",
        footer: showSponsorStrip ? "min-h-[10%]" : footerOffClass
      }),
      showFooter
    };
  }

  if (layoutKind === "custom") {
    return {
      framePaddingClass,
      ...rowsToTemplate({
        header: "min-h-[19%]",
        hero: showSponsorStrip ? "min-h-[4%]" : "min-h-[3%]",
        content: showSponsorStrip ? "min-h-[67%]" : "min-h-[78%]",
        footer: showSponsorStrip ? "min-h-[10%]" : footerOffClass
      }),
      showFooter
    };
  }

  return {
    framePaddingClass,
    ...rowsToTemplate({
      header: "min-h-[20%]",
      hero: showSponsorStrip ? "min-h-[6%]" : "min-h-[5%]",
      content: showSponsorStrip ? "min-h-[64%]" : "min-h-[75%]",
      footer: showSponsorStrip ? "min-h-[10%]" : footerOffClass
    }),
    showFooter
  };
}
