"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  id: string;
  isDraft: boolean;
  compact?: boolean;
};

export function HistoryRowActions({ id, isDraft, compact = false }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onDelete = async () => {
    if (!window.confirm("Delete this draft permanently?")) {
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`/api/social-posts/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Delete failed");
      }
      router.refresh();
    } catch {
      window.alert("Could not delete draft right now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`flex ${compact ? "flex-col" : "items-center"} gap-2`}>
      <Link href={`/social?draft=${id}`} className="rounded-md border border-command-accent/50 px-3 py-1 text-xs text-command-accent hover:bg-command-accent/10">
        {isDraft ? "Open Draft" : "Reuse"}
      </Link>
      {isDraft ? (
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="rounded-md border border-red-400/40 px-3 py-1 text-xs text-red-200 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Deleting..." : "Delete"}
        </button>
      ) : null}
    </div>
  );
}
