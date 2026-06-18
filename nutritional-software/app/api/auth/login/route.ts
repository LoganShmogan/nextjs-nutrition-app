// Author: Logan

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

type UserRow = { id: number; username: string; password: string };

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    const db = getDb();
    const user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username.trim()) as UserRow | undefined;

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set("session_user_id", String(user.id), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
