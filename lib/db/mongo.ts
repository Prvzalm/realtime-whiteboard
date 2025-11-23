import { MongoClient, type Db } from "mongodb";
import { serverEnv } from "@/lib/config/env";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function createClient() {
  if (!serverEnv.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  const client = new MongoClient(serverEnv.MONGODB_URI, {
    maxPoolSize: 5,
  });
  await client.connect();
  return client;
}

export async function getDb(): Promise<Db> {
  if (cachedDb && cachedClient) {
    return cachedDb;
  }

  const client = await createClient();
  cachedClient = client;
  const dbName = serverEnv.MONGODB_DB ?? "realtime_whiteboard";
  cachedDb = client.db(dbName);
  return cachedDb;
}
