"use client";

import type { ReactNode } from "react";

interface BoardHeaderProps {
  name: string;
  workspaceName?: string;
  lastUpdated?: string;
  actions?: ReactNode;
}

export function BoardHeader({
  name,
  workspaceName = "Personal",
  lastUpdated,
  actions,
}: BoardHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-slate-500">{workspaceName}</p>
        <h1 className="text-2xl font-semibold text-slate-900">{name}</h1>
        {lastUpdated ? (
          <p className="text-xs text-slate-400">Updated {lastUpdated}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
