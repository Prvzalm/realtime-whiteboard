"use client";

import { useCallback, useState } from "react";
import { Share2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ShareLinkButtonProps {
  boardId: string;
}

export function ShareLinkButton({ boardId }: ShareLinkButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const [isLoading, setIsLoading] = useState(false);

  const handleCopy = useCallback(async () => {
    setIsLoading(true);
    setStatus("idle");
    try {
      const response = await fetch(`/api/boards/${boardId}/share`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to create share link");
      }
      const { shareId } = (await response.json()) as { shareId: string };
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const shareUrl = origin
        ? `${origin}/share/${shareId}`
        : `/share/${shareId}`;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback prompt when clipboard API is unavailable
        window.prompt("Copy this link", shareUrl);
      }
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2_000);
    } catch (error) {
      console.error("[share] Unable to copy link", error);
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  const label =
    status === "copied"
      ? "Link copied"
      : status === "error"
      ? "Try again"
      : "Share read-only link";

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={isLoading}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
        status === "copied"
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : status === "error"
          ? "border-rose-200 bg-rose-50 text-rose-900"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
        isLoading && "opacity-50"
      )}
    >
      <Share2 className="h-4 w-4" />
      {label}
    </button>
  );
}
