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
    backgroundImageUrl: null
  };

  const ratioClass = safeOptions.aspectRatio === "portrait" ? "aspect-[4/5] max-w-[500px]" : "aspect-square max-w-[560px]";

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
          background: `linear-gradient(160deg, ${primaryColor}F0 0%, #022016F5 58%, #02150F 100%)`
        }}
      />

      <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full opacity-30" style={{ background: accentColor }} />
      <div className="absolute -left-20 bottom-24 h-56 w-56 rounded-full bg-black/25" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/65 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
        <header className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p
                className="text-lg font-black uppercase tracking-[0.08em] md:text-xl"
                style={{ color: accentColor }}
              >
                {clubName}
              </p>
              <h3 className="mt-2 text-4xl font-black leading-[0.95] tracking-tight md:text-5xl">{title}</h3>
              <p className="mt-2 text-sm font-medium text-white/90 md:text-base">{subtitle}</p>
            </div>
            {safeOptions.showLogo && logoPath ? (
              <Image
                src={logoPath}
                alt={clubName}
                width={114}
                height={114}
                className="h-[96px] w-[96px] rounded-full border border-white/20 bg-white/10 p-1.5 md:h-[114px] md:w-[114px]"
              />
            ) : null}
          </div>

          <div className="h-[3px] w-24 rounded-full" style={{ backgroundColor: accentColor }} />
        </header>

        <div>{children}</div>

        {safeOptions.showSponsorStrip ? (
          <footer className="mt-4 rounded-xl border border-white/20 bg-black/30 px-4 py-2 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/70">Proudly Supported By</p>
            <p className="mt-1 text-sm font-semibold text-white/90">Fremantle Rebels Partners</p>
          </footer>
        ) : null}
      </div>
    </div>
  );
}
