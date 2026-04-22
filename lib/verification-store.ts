import { kv } from "@vercel/kv";

export type VerificationStatus =
  | "pending_phone"
  | "pending_review"
  | "approved"
  | "rejected";

export type VerificationSession = {
  id: string;
  phone: string;
  code?: string;
  status: VerificationStatus;
  createdAt: number;
  updatedAt: number;
};

const sessionKey = (id: string) => `verify:session:${id}`;
const pendingSetKey = "verify:pending";

export async function createSession(phone: string): Promise<VerificationSession> {
  const id = crypto.randomUUID();
  const now = Date.now();
  const session: VerificationSession = {
    id,
    phone,
    status: "pending_phone",
    createdAt: now,
    updatedAt: now,
  };
  await kv.set(sessionKey(id), session);
  return session;
}

export async function getSession(id: string): Promise<VerificationSession | null> {
  const data = await kv.get<VerificationSession>(sessionKey(id));
  return data ?? null;
}

export async function updateSession(
  id: string,
  patch: Partial<VerificationSession>
): Promise<VerificationSession | null> {
  const existing = await getSession(id);
  if (!existing) return null;
  const next: VerificationSession = {
    ...existing,
    ...patch,
    updatedAt: Date.now(),
  };
  await kv.set(sessionKey(id), next);

  if (next.status === "pending_review") {
    await kv.sadd(pendingSetKey, id);
  } else {
    await kv.srem(pendingSetKey, id);
  }

  return next;
}

export async function listPendingReviewSessions(
  limit = 100
): Promise<VerificationSession[]> {
  const ids = (await kv.smembers(pendingSetKey)) as string[] | null;
  if (!ids || ids.length === 0) return [];

  const sessions = await Promise.all(ids.map((id) => getSession(id)));
  return sessions
    .filter((s): s is VerificationSession => Boolean(s) && s.status === "pending_review")
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);
}
