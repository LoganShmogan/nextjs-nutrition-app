import { NextRequest } from "next/server";

export function getUserId(request: NextRequest): number | null {
  const val = request.cookies.get("session_user_id")?.value;
  if (!val) return null;
  const n = parseInt(val, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function getActiveProfileId(request: NextRequest): number | null {
  const val = request.cookies.get("active_profile_id")?.value;
  if (!val) return null;
  const n = parseInt(val, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}
