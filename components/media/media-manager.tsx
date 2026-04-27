"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MediaAssetRecord } from "@/types/social-data";

type AssetType = "background" | "logo" | "sponsor";

export function MediaManager({ initialMedia, clubId }: { initialMedia: MediaAssetRecord[]; clubId: string }) {
  const [media, setMedia] = useState(initialMedia);
  const [assetType, setAssetType] = useState<AssetType>("background");
  const [typeFilter, setTypeFilter] = useState<AssetType | "all">("all");
  const [altText, setAltText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = createClient();

  const mediaWithUrls = useMemo(() => {
    const sorted = [...media].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    const filtered = typeFilter === "all" ? sorted : sorted.filter((asset) => asset.media_type === typeFilter);

    return filtered.map((asset) => ({
      ...asset,
      publicUrl: asset.storage_bucket && asset.file_path
        ? supabase.storage.from(asset.storage_bucket).getPublicUrl(asset.file_path).data.publicUrl
        : null
    }));
  }, [media, supabase, typeFilter]);

  const onUpload = async (file: File) => {
    setIsUploading(true);
    setMessage("");
    const extension = file.name.split(".").pop()?.toLowerCase() || "png";
    const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}.${extension}`;
    const filePath = `${assetType}/${fileName}`;

    const { error: uploadError } = await supabase.storage.from("social-assets").upload(filePath, file, {
      upsert: false
    });

    if (uploadError) {
      console.error("[media.upload] Storage upload failed:", uploadError.message);
      if (uploadError.message.toLowerCase().includes("row-level security")) {
        setMessage("Upload blocked by permissions. Sign in with an authorised account and try again.");
      } else {
        setMessage("Upload failed. Check file type/size and try again.");
      }
      setIsUploading(false);
      return;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("media_assets")
      .insert({
        club_id: clubId,
        storage_bucket: "social-assets",
        file_path: filePath,
        media_type: assetType,
        alt_text: altText || null
      })
      .select("id, file_path, media_type, alt_text, storage_bucket, created_at")
      .single();

    if (insertError) {
      console.error("[media.upload] media_assets insert failed:", insertError.message);
      if (insertError.message.toLowerCase().includes("row-level security")) {
        setMessage("Upload saved to storage but metadata insert was blocked by permissions.");
      } else {
        setMessage("Upload succeeded but metadata save failed. Try again.");
      }
      setIsUploading(false);
      return;
    }

    setMedia((prev) => [inserted as MediaAssetRecord, ...prev]);
    setAltText("");
    setMessage("Asset uploaded.");
    setIsUploading(false);
  };

  return (
    <div className="space-y-4">
      <div className="glass-panel rounded-xl p-4">
        <h3 className="text-base font-semibold">Upload Asset</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="space-y-1">
            <span className="text-xs text-command-muted">Asset Type</span>
            <select value={assetType} onChange={(event) => setAssetType(event.target.value as AssetType)} className="w-full rounded-md border border-white/15 bg-black/20 p-2 text-sm">
              <option value="background">background</option>
              <option value="logo">logo</option>
              <option value="sponsor">sponsor</option>
            </select>
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs text-command-muted">Alt text</span>
            <input
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              className="w-full rounded-md border border-white/15 bg-black/20 p-2 text-sm"
              placeholder="Optional description"
            />
          </label>
        </div>
        <label className="mt-3 block">
          <span className="text-xs text-command-muted">Image file</span>
          <input
            type="file"
            accept="image/*"
            className="mt-1 block w-full text-sm"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void onUpload(file);
              }
            }}
            disabled={isUploading}
          />
        </label>
        {message ? <p className="mt-2 text-xs text-command-muted">{message}</p> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="md:col-span-2 xl:col-span-3">
          <div className="flex flex-wrap gap-2">
            {(["all", "background", "logo", "sponsor"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={`rounded-md px-3 py-1 text-xs font-semibold uppercase ${
                  typeFilter === type ? "bg-command-accent text-black" : "border border-white/20 text-command-muted"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {mediaWithUrls.map((asset) => (
          <article key={asset.id} className="glass-panel rounded-xl p-3">
            <div className="aspect-video overflow-hidden rounded-lg border border-white/10 bg-black/20">
              {asset.publicUrl ? (
                <Image src={asset.publicUrl} alt={asset.alt_text ?? asset.file_path ?? "Media asset"} width={640} height={360} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="rounded bg-command-accent/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-command-accent">
                {asset.media_type}
              </p>
              <p className="text-[10px] text-command-muted">{new Date(asset.created_at).toLocaleDateString("en-AU")}</p>
            </div>
            <p className="mt-1 truncate text-sm font-semibold">{asset.file_path ?? "External media"}</p>
            <p className="mt-1 text-xs text-command-muted">{asset.alt_text ?? "No alt text"}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
