import { kv } from "@vercel/kv";

export async function getAdminPasswordHash(): Promise<string | null> {
  return kv.get<string>("admin:password_hash");
}

export async function setAdminPasswordHash(hash: string): Promise<void> {
  await kv.set("admin:password_hash", hash);
}
