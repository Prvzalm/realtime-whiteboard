import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth/session";
import { authenticateUser, createUser } from "@/lib/services/user-service";

const baseCredentials = {
  email: z.string().email().max(120),
  password: z.string().min(6).max(120),
};

const loginSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("register"),
    name: z.string().min(2).max(80),
    ...baseCredentials,
  }),
  z.object({
    mode: z.literal("login"),
    ...baseCredentials,
  }),
]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  try {
    const payload = parsed.data;
    const user =
      payload.mode === "register"
        ? await createUser({
            name: payload.name.trim(),
            email: payload.email.trim(),
            password: payload.password,
          })
        : await authenticateUser(payload.email.trim(), payload.password);

    await createSession({ id: user.id, name: user.name, email: user.email });
    return NextResponse.json({ user });
  } catch (error) {
    let message = "Unable to complete request";
    let status = 400;
    if (error instanceof Error) {
      if (error.message === "USER_EXISTS") {
        message = "Account already exists. Please log in.";
      } else if (error.message === "INVALID_CREDENTIALS") {
        message = "Invalid email or password.";
        status = 401;
      }
    }
    return NextResponse.json({ message }, { status });
  }
}
