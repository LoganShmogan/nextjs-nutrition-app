// Author: Logan

import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("session_user_id", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
