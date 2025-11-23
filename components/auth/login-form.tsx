"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

type AuthMode = "register" | "login";

interface FormState {
  name: string;
  email: string;
  password: string;
}

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("register");
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      mode,
      email: form.email.trim(),
      password: form.password,
      ...(mode === "register" ? { name: form.name.trim() } : {}),
    };

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.message ?? "Unable to process request");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl"
    >
      <div className="flex rounded-2xl border border-slate-200 bg-slate-50 p-1 text-sm font-semibold text-slate-600">
        {(
          [
            { key: "register", label: "Create account" },
            { key: "login", label: "Log in" },
          ] as const
        ).map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => switchMode(option.key)}
            className={cn(
              "flex-1 rounded-xl px-3 py-2 transition",
              mode === option.key
                ? "bg-white text-slate-900 shadow"
                : "text-slate-500"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {mode === "register" ? (
        <div>
          <label
            htmlFor="name"
            className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500"
          >
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Jane Doe"
            autoComplete="name"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
            required={mode === "register"}
          />
        </div>
      ) : null}

      <div>
        <label
          htmlFor="email"
          className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500"
        >
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="jane@studio.com"
          autoComplete="email"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
          required
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder={
            mode === "register"
              ? "Create a strong password"
              : "Enter your password"
          }
          autoComplete={
            mode === "register" ? "new-password" : "current-password"
          }
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
          required
        />
        <p className="mt-2 text-xs text-slate-500">
          {mode === "register"
            ? "Use at least 6 characters with numbers or symbols."
            : "Forgot it? Use your SSO provider once available."}
        </p>
      </div>

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-60"
      >
        {isSubmitting
          ? mode === "register"
            ? "Creating account..."
            : "Signing in..."
          : mode === "register"
          ? "Create account"
          : "Sign in"}
      </button>
      <p className="text-center text-xs text-slate-500">
        {mode === "register"
          ? "Already joined? Switch to Log in and enter your password."
          : "New here? Switch to Create account to get started."}
      </p>
    </form>
  );
}
