import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { serverEnv } from "@/lib/config/env";

const SESSION_COOKIE = "session_token";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

interface SessionPayload {
  user: SessionUser;
}

function getSecret() {
  if (!serverEnv.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return serverEnv.JWT_SECRET;
}

export async function createSession(user: SessionUser) {
  const token = jwt.sign({ user } satisfies SessionPayload, getSecret(), {
    expiresIn: SESSION_MAX_AGE,
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  try {
    const payload = jwt.verify(token, getSecret()) as SessionPayload;
    return payload;
  } catch (error) {
    console.warn("[session] invalid token", error);
    return null;
  }
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
