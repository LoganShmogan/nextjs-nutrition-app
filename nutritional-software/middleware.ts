import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the login page and all auth API routes through
  if (pathname === "/" || pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const userId = request.cookies.get("session_user_id")?.value;
  if (!userId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
