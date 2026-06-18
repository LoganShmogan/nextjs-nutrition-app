// Author: Logan

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    const db = getDb();
    const existing = db
      .prepare("SELECT id FROM users WHERE username = ?")
      .get(username.trim());

    if (existing) {
      return NextResponse.json({ error: "Username already taken." }, { status: 409 });
    }

    const result = db
      .prepare("INSERT INTO users (username, password) VALUES (?, ?)")
      .run(username.trim(), password);

    const userId = result.lastInsertRowid as number;

    const response = NextResponse.json({ ok: true });
    response.cookies.set("session_user_id", String(userId), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Sign up failed." }, { status: 500 });
  }
}
