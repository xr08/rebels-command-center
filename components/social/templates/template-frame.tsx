import Image from "next/image";
import { getTemplateLayout, type TemplateLayoutKind } from "@/lib/social/template-layout";
import type { TemplateOptions } from "@/types/social-data";

type TemplateFrameProps = {
  title: string;
  subtitle: string;
  clubName: string;
  primaryColor: string;
  accentColor: string;
  logoPath?: string | null;
  layoutKind?: TemplateLayoutKind;
  options?: TemplateOptions;
  children: React.ReactNode;
};

export function TemplateFrame({ title, subtitle, clubName, primaryColor, accentColor, logoPath, layoutKind = "single", options, children }: TemplateFrameProps) {
  const baseOptions: TemplateOptions = options ?? {
    aspectRatio: "square",
    showSponsorStrip: true,
    showLogo: true,
    styleVariant: "classic-green",
    backgroundImageUrl: null,
    exportMode: false
  };
  const safeOptions: TemplateOptions = {
    ...baseOptions,
    showSponsorStrip: false
  };
  const styleVariant = safeOptions.styleVariant ?? "classic-green";
  const layout = getTemplateLayout(safeOptions.aspectRatio, layoutKind, safeOptions.showSponsorStrip);
  const displayTitle = safeOptions.customizations?.headlineOverride?.trim() || title;
  const displaySubtitle = safeOptions.customizations?.subheadingOverride?.trim() || subtitle;
  const backgroundFitClass = safeOptions.customizations?.backgroundFit === "contain" ? "bg-contain bg-no-repeat" : "bg-cover";
  const backgroundPositionClass = {
    center: "bg-center",
    top: "bg-top",
    bottom: "bg-bottom",
    left: "bg-left",
    right: "bg-right"
  }[safeOptions.customizations?.backgroundPosition ?? "center"];

  const ratioClass = safeOptions.exportMode
    ? "h-full w-full max-w-none aspect-auto rounded-none"
    : safeOptions.aspectRatio === "portrait"
      ? "aspect-[4/5] max-w-[500px]"
      : "aspect-square max-w-[560px]";

  const overlayByVariant = {
    "classic-green": `linear-gradient(160deg, ${primaryColor}F0 0%, #022016F5 58%, #02150F 100%)`,
    "photo-gradient-green": `linear-gradient(90deg, ${primaryColor}F2 0%, ${primaryColor}B8 52%, rgba(4,66,41,0.16) 100%)`,
    "photo-gradient-gold": `linear-gradient(90deg, ${accentColor}F0 0%, ${accentColor}A8 52%, rgba(255,205,0,0.12) 100%)`,
    "minimal-board": "linear-gradient(180deg, rgba(3, 34, 23, 0.98) 0%, rgba(3, 34, 23, 0.98) 100%)",
    "juniors-energy": `radial-gradient(circle at 15% 20%, ${accentColor}50 0%, transparent 38%), linear-gradient(145deg, ${primaryColor}F2 0%, #022016F5 62%, #031a12 100%)`,
    "team-list-photo": `linear-gradient(90deg, #02150FF5 0%, ${primaryColor}E6 60%, rgba(4,66,41,0.08) 100%)`
  } as const;
  const overlayOpacityByStrength = {
    none: 0,
    light: 0.68,
    medium: 1,
    strong: 1.18
  } as const;
  const overlayOpacity = overlayOpacityByStrength[safeOptions.customizations?.overlayStrength ?? "medium"];

  const titleClassByVariant = {
    "classic-green": "text-4xl md:text-5xl",
    "photo-gradient-green": "text-4xl md:text-5xl",
    "photo-gradient-gold": "text-4xl md:text-5xl text-black drop-shadow-[0_1px_0_rgba(255,255,255,0.2)]",
    "minimal-board": "text-3xl md:text-4xl",
    "juniors-energy": "text-4xl md:text-5xl",
    "team-list-photo": "text-4xl md:text-5xl"
  } as const;

  const headerTextClassByVariant = {
    "classic-green": "text-white",
    "photo-gradient-green": "text-white",
    "photo-gradient-gold": "text-black",
    "minimal-board": "text-white",
    "juniors-energy": "text-white",
    "team-list-photo": "text-white"
  } as const;

  const clubColor = styleVariant === "photo-gradient-gold" ? "#044229" : accentColor;
  const dividerColor = styleVariant === "minimal-board" ? "rgba(255, 255, 255, 0.45)" : accentColor;
  const gridTemplateRows = layout.gridRows.map((value) => `${value}fr`).join(" ");

  return (
    <div className={`relative mx-auto w-full overflow-hidden rounded-3xl border border-white/15 text-white shadow-premium ${ratioClass}`}>
      {safeOptions.backgroundImageUrl ? (
        <div
          className={`absolute inset-0 ${backgroundFitClass} ${backgroundPositionClass}`}
          style={{ backgroundImage: `url(${safeOptions.backgroundImageUrl})` }}
        />
      ) : null}

      <div
        className="absolute inset-0"
        style={{
          background: overlayByVariant[styleVariant],
          opacity: overlayOpacity
        }}
      />

      {styleVariant !== "minimal-board" ? (
        <>
          <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full opacity-30" style={{ background: accentColor }} />
          <div className="absolute -left-20 bottom-24 h-56 w-56 rounded-full bg-black/25" />
        </>
      ) : null}
      <div className={`absolute inset-x-0 bottom-0 h-28 ${styleVariant === "photo-gradient-gold" ? "bg-gradient-to-t from-black/30 to-transparent" : "bg-gradient-to-t from-black/65 to-transparent"}`} />

      <div
        className={`relative z-10 grid h-full ${layout.framePaddingClass} ${styleVariant === "minimal-board" ? "pt-5 md:pt-6" : ""}`}
        style={{ gridTemplateRows }}
      >
        <header className={`space-y-4 ${layout.headerClass}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p
                className="text-lg font-black uppercase tracking-[0.08em] md:text-xl"
                style={{ color: clubColor }}
              >
                {clubName}
              </p>
              <h3 className={`mt-2 font-black leading-[0.95] tracking-tight ${titleClassByVariant[styleVariant]} ${headerTextClassByVariant[styleVariant]}`}>{displayTitle}</h3>
              <p className={`mt-2 text-sm font-medium md:text-base ${styleVariant === "photo-gradient-gold" ? "text-black/90" : "text-white/90"}`}>{displaySubtitle}</p>
            </div>
            {safeOptions.showLogo && logoPath ? (
              <Image
                src={logoPath}
                alt={clubName}
                width={114}
                height={114}
                className={`h-[96px] w-[96px] rounded-full p-1.5 md:h-[114px] md:w-[114px] ${styleVariant === "photo-gradient-gold" ? "border border-black/20 bg-white/70" : "border border-white/20 bg-white/10"}`}
              />
            ) : null}
          </div>

          <div className="h-[3px] w-24 rounded-full" style={{ backgroundColor: dividerColor }} />
        </header>

        <div className={`self-stretch ${layout.heroClass}`} />

        <div className={`${layout.contentClass} flex flex-col ${layout.contentJustifyClass} self-stretch`}>{children}</div>
        <div className={layout.footerClass} />
      </div>
    </div>
  );
}
