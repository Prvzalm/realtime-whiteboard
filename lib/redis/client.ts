import Redis from "ioredis";
import { serverEnv } from "@/lib/config/env";

let redis: Redis | null = null;

export function getRedis() {
  if (!serverEnv.REDIS_URL) {
    throw new Error("REDIS_URL is not configured");
  }

  if (!redis) {
    redis = new Redis(serverEnv.REDIS_URL, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: false,
    });
  }

  return redis;
}
