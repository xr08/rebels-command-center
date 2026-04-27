import { CustomPostShell } from "./custom-post-shell";
import type { CustomTemplateData, TemplateOptions } from "@/types/social-data";

type Props = {
  data: CustomTemplateData;
  options: TemplateOptions;
  brand: {
    clubName: string;
    primaryColor: string;
    accentColor: string;
    logoPath?: string | null;
  };
};

export function EventAnnouncementTemplate({ data, options, brand }: Props) {
  return <CustomPostShell data={data} options={options} brand={brand} title="Social Event" />;
}
