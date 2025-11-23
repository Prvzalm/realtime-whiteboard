"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateBoardForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Please add a board name.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(payload?.message ?? "Unable to create board.");
        return;
      }
      setName("");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
        Create a board
      </p>
      <h2 className="mt-3 text-xl font-semibold text-slate-900">
        Name your next canvas
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Boards auto-save snapshots, so feel free to iterate fast.
      </p>
      <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
        Board name
      </label>
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Sprint Retro"
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
        disabled={isSubmitting}
      />
      {error ? (
        <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-60"
      >
        {isSubmitting ? "Creating" : "Create board"}
      </button>
    </form>
  );
}
