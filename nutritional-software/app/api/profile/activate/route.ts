import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { getUserId } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { profileId } = await request.json();
  if (!profileId) return Response.json({ error: "Missing profileId" }, { status: 400 });

  const db = getDb();
  const row = db.prepare("SELECT id FROM profiles WHERE id = ? AND user_id = ?").get(profileId, userId);
  if (!row) return Response.json({ error: "Profile not found" }, { status: 404 });

  const res = Response.json({ ok: true, profileId });
  res.headers.set("Set-Cookie", `active_profile_id=${profileId}; Path=/; HttpOnly; SameSite=Lax`);
  return res;
}
