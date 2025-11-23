"use client";

import type { ReactNode } from "react";

interface BoardShellProps {
  header: ReactNode;
  toolbar: ReactNode;
  children: ReactNode;
}

export function BoardShell({ header, toolbar, children }: BoardShellProps) {
  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-6">
      {header}
      {toolbar}
      <div className="flex-1 overflow-hidden rounded-3xl bg-slate-100 p-4">
        {children}
      </div>
    </div>
  );
}
