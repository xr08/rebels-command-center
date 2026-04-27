import Image from "next/image";
import type { TemplateOptions } from "@/types/social-data";

type TemplateFrameProps = {
  title: string;
  subtitle: string;
  clubName: string;
  primaryColor: string;
  accentColor: string;
  logoPath?: string | null;
  options?: TemplateOptions;
  children: React.ReactNode;
};

export function TemplateFrame({ title, subtitle, clubName, primaryColor, accentColor, logoPath, options, children }: TemplateFrameProps) {
  const safeOptions: TemplateOptions = options ?? {
    aspectRatio: "square",
    showSponsorStrip: true,
    showLogo: true,
    styleVariant: "classic-green",
    backgroundImageUrl: null,
    exportMode: false
  };
  const styleVariant = safeOptions.styleVariant ?? "classic-green";

  const ratioClass = safeOptions.exportMode
    ? "h-full w-full max-w-none aspect-auto rounded-none"
    : safeOptions.aspectRatio === "portrait"
      ? "aspect-[4/5] max-w-[500px]"
      : "aspect-square max-w-[560px]";

  const overlayByVariant = {
    "classic-green": `linear-gradient(160deg, ${primaryColor}F0 0%, #022016F5 58%, #02150F 100%)`,
    "photo-overlay": "linear-gradient(170deg, rgba(2, 19, 13, 0.28) 0%, rgba(2, 19, 13, 0.7) 48%, rgba(2, 19, 13, 0.9) 100%)",
    "bold-gold": `linear-gradient(165deg, ${accentColor}F2 0%, ${primaryColor}EE 54%, #02150F 100%)`,
    "minimal-board": "linear-gradient(180deg, rgba(3, 34, 23, 0.98) 0%, rgba(3, 34, 23, 0.98) 100%)",
    "juniors-energy": `radial-gradient(circle at 15% 20%, ${accentColor}50 0%, transparent 38%), linear-gradient(145deg, ${primaryColor}F2 0%, #022016F5 62%, #031a12 100%)`,
    "sponsor-clean": "linear-gradient(180deg, rgba(4, 66, 41, 0.92) 0%, rgba(4, 66, 41, 0.86) 60%, rgba(4, 66, 41, 0.82) 100%)"
  } as const;

  const titleClassByVariant = {
    "classic-green": "text-4xl md:text-5xl",
    "photo-overlay": "text-4xl md:text-5xl",
    "bold-gold": "text-4xl md:text-5xl text-black drop-shadow-[0_1px_0_rgba(255,255,255,0.2)]",
    "minimal-board": "text-3xl md:text-4xl",
    "juniors-energy": "text-4xl md:text-5xl",
    "sponsor-clean": "text-3xl md:text-4xl"
  } as const;

  const headerTextClassByVariant = {
    "classic-green": "text-white",
    "photo-overlay": "text-white",
    "bold-gold": "text-black",
    "minimal-board": "text-white",
    "juniors-energy": "text-white",
    "sponsor-clean": "text-white"
  } as const;

  const clubColor = styleVariant === "bold-gold" ? "#044229" : accentColor;
  const dividerColor = styleVariant === "minimal-board" ? "rgba(255, 255, 255, 0.45)" : accentColor;
  const sponsorBarClass = styleVariant === "sponsor-clean"
    ? "mt-4 rounded-xl border border-white/30 bg-white/10 px-4 py-2 backdrop-blur-sm"
    : "mt-4 rounded-xl border border-white/20 bg-black/30 px-4 py-2 backdrop-blur-sm";
  const panelPadding = styleVariant === "minimal-board" ? "p-5 md:p-6" : "p-6 md:p-8";

  return (
    <div className={`relative mx-auto w-full overflow-hidden rounded-3xl border border-white/15 text-white shadow-premium ${ratioClass}`}>
      {safeOptions.backgroundImageUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${safeOptions.backgroundImageUrl})` }}
        />
      ) : null}

      <div
        className="absolute inset-0"
        style={{
          background: overlayByVariant[styleVariant]
        }}
      />

      {styleVariant !== "minimal-board" ? (
        <>
          <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full opacity-30" style={{ background: accentColor }} />
          <div className="absolute -left-20 bottom-24 h-56 w-56 rounded-full bg-black/25" />
        </>
      ) : null}
      <div className={`absolute inset-x-0 bottom-0 h-28 ${styleVariant === "bold-gold" ? "bg-gradient-to-t from-black/30 to-transparent" : "bg-gradient-to-t from-black/65 to-transparent"}`} />

      <div className={`relative z-10 flex h-full flex-col justify-between ${panelPadding}`}>
        <header className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p
                className="text-lg font-black uppercase tracking-[0.08em] md:text-xl"
                style={{ color: clubColor }}
              >
                {clubName}
              </p>
              <h3 className={`mt-2 font-black leading-[0.95] tracking-tight ${titleClassByVariant[styleVariant]} ${headerTextClassByVariant[styleVariant]}`}>{title}</h3>
              <p className={`mt-2 text-sm font-medium md:text-base ${styleVariant === "bold-gold" ? "text-black/90" : "text-white/90"}`}>{subtitle}</p>
            </div>
            {safeOptions.showLogo && logoPath ? (
              <Image
                src={logoPath}
                alt={clubName}
                width={114}
                height={114}
                className={`h-[96px] w-[96px] rounded-full p-1.5 md:h-[114px] md:w-[114px] ${styleVariant === "bold-gold" ? "border border-black/20 bg-white/70" : "border border-white/20 bg-white/10"}`}
              />
            ) : null}
          </div>

          <div className="h-[3px] w-24 rounded-full" style={{ backgroundColor: dividerColor }} />
        </header>

        <div>{children}</div>

        {safeOptions.showSponsorStrip ? (
          <footer className={sponsorBarClass}>
            <p className={`text-[10px] uppercase tracking-[0.22em] ${styleVariant === "bold-gold" ? "text-black/70" : "text-white/70"}`}>Proudly Supported By</p>
            <p className={`mt-1 text-sm font-semibold ${styleVariant === "bold-gold" ? "text-black/90" : "text-white/90"}`}>Fremantle Rebels Partners</p>
          </footer>
        ) : null}
      </div>
    </div>
  );
}
