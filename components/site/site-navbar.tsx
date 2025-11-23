"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import type { SessionUser } from "@/lib/auth/session";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/solutions", label: "Solutions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/contact", label: "Contact" },
  { href: "/boards", label: "Boards" },
];

interface SiteNavbarProps {
  user: SessionUser | null | undefined;
}

export function SiteNavbar({ user }: SiteNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  const launchHref = user ? "/boards" : "/login";
  const launchLabel = user ? "Launch a board" : "Sign in";

  const userInitials = useMemo(() => {
    if (!user?.name) {
      return null;
    }
    const parts = user.name.trim().split(/\s+/);
    const [first = "", second = ""] = parts;
    return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
  }, [user]);

  const toggleProfile = useCallback(() => {
    setIsProfileOpen((prev) => !prev);
  }, []);

  const closeProfile = useCallback(() => setIsProfileOpen(false), []);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
      closeProfile();
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
          onClick={closeMenu}
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-r from-sky-400 to-blue-500 text-sm font-bold text-white shadow-sm">
            RW
          </span>
          Realtime Whiteboard
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "border border-sky-200 bg-sky-50 text-sky-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={toggleProfile}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-900 shadow-sm transition"
                aria-haspopup="true"
                aria-expanded={isProfileOpen}
              >
                {userInitials ?? "*"}
              </button>
              {isProfileOpen ? (
                <div className="absolute right-0 top-full z-50 mt-3 w-64 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                    Signed in
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="mt-4 w-full rounded-2xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-50"
                  >
                    {isLoggingOut ? "Signing out" : "Logout"}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
          <Link
            href={launchHref}
            className="rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-500"
          >
            {launchLabel}
          </Link>
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100 md:hidden"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isOpen ? (
              <path d="M18 6 6 18M6 6l12 12" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>
      {isOpen ? (
        <div className="border-t border-slate-100 bg-white px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-100"
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold">Signed in as</p>
                <p>{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
                <button
                  type="button"
                  className="mt-4 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold"
                  onClick={() => {
                    closeMenu();
                    handleLogout();
                  }}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? "Signing out" : "Logout"}
                </button>
              </div>
            ) : null}
            <Link
              href={launchHref}
              className="rounded-2xl bg-sky-600 px-4 py-3 text-center text-base font-semibold text-white"
              onClick={closeMenu}
            >
              {launchLabel}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
