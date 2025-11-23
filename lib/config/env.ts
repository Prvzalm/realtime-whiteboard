import { z } from "zod";

const serverSchema = z.object({
  MONGODB_URI: z.string().url().optional(),
  MONGODB_DB: z.string().optional(),
  KV_REST_API_URL: z.string().url().optional(),
  KV_REST_API_TOKEN: z.string().optional(),
  KV_REST_API_READ_ONLY_TOKEN: z.string().optional(),
  REDIS_URL: z.string().optional(),
  REDIS_API_KEY: z.string().optional(),
  JWT_SECRET: z.string().min(16).optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  AUTH_REQUIRE_TOKEN: z
    .string()
    .transform((value) => value === "true")
    .optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  NEXT_PUBLIC_SOCKET_FALLBACK_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

function parseEnv<T extends z.ZodTypeAny>(
  schema: T,
  source: Record<string, string | undefined>
) {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    console.warn(
      "[env] Missing or invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    return {} as z.infer<T>;
  }
  return parsed.data;
}

export const serverEnv: ServerEnv = parseEnv(serverSchema, {
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_DB: process.env.MONGODB_DB,
  KV_REST_API_URL: process.env.KV_REST_API_URL,
  KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN,
  REDIS_URL: process.env.REDIS_URL,
  REDIS_API_KEY: process.env.REDIS_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  AUTH_REQUIRE_TOKEN: process.env.AUTH_REQUIRE_TOKEN,
});

export const clientEnv: ClientEnv = parseEnv(clientSchema, {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SOCKET_FALLBACK_URL: process.env.NEXT_PUBLIC_SOCKET_FALLBACK_URL,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
});
