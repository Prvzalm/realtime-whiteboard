import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { getDb } from "@/lib/db/mongo";
import { serverEnv } from "@/lib/config/env";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export type UserProfile = Omit<UserRecord, "passwordHash">;

const USER_COLLECTION = "users";
const memoryUsers = new Map<string, UserRecord>();

function hashPassword(password: string, salt?: string) {
  const resolvedSalt = salt ?? randomBytes(16).toString("hex");
  const hash = scryptSync(password, resolvedSalt, 64).toString("hex");
  return `${resolvedSalt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) {
    return false;
  }
  const derived = hashPassword(password, salt).split(":")[1];
  const existing = Buffer.from(hash, "hex");
  const incoming = Buffer.from(derived, "hex");
  if (existing.length !== incoming.length) {
    return false;
  }
  return timingSafeEqual(existing, incoming);
}

function toProfile(record: UserRecord): UserProfile {
  const { passwordHash, ...profile } = record;
  void passwordHash;
  return profile;
}

interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
}

export async function createUser(
  payload: CreateUserPayload
): Promise<UserProfile> {
  const normalizedEmail = payload.email.toLowerCase();
  const db = serverEnv.MONGODB_URI ? await getDb().catch(() => null) : null;
  const now = new Date().toISOString();

  const createRecord = () => ({
    id: randomUUID(),
    name: payload.name,
    email: normalizedEmail,
    passwordHash: hashPassword(payload.password),
    createdAt: now,
  });

  if (!db) {
    if (memoryUsers.has(normalizedEmail)) {
      throw new Error("USER_EXISTS");
    }
    const record = createRecord();
    memoryUsers.set(normalizedEmail, record);
    return toProfile(record);
  }

  const collection = db.collection<UserRecord>(USER_COLLECTION);
  const existing = await collection.findOne({ email: normalizedEmail });
  if (existing) {
    throw new Error("USER_EXISTS");
  }
  const record = createRecord();
  await collection.insertOne(record);
  return toProfile(record);
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<UserProfile> {
  const normalizedEmail = email.toLowerCase();
  const db = serverEnv.MONGODB_URI ? await getDb().catch(() => null) : null;

  if (!db) {
    const record = memoryUsers.get(normalizedEmail);
    if (!record) {
      throw new Error("INVALID_CREDENTIALS");
    }
    const isValid = verifyPassword(password, record.passwordHash);
    if (!isValid) {
      throw new Error("INVALID_CREDENTIALS");
    }
    return toProfile(record);
  }

  const collection = db.collection<UserRecord>(USER_COLLECTION);
  const record = await collection.findOne({ email: normalizedEmail });
  if (!record) {
    throw new Error("INVALID_CREDENTIALS");
  }
  if (!record.passwordHash) {
    throw new Error("INVALID_CREDENTIALS");
  }
  const isValid = verifyPassword(password, record.passwordHash);
  if (!isValid) {
    throw new Error("INVALID_CREDENTIALS");
  }
  return toProfile(record);
}
