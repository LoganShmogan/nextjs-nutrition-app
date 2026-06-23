import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

function makeRequest(path: string, cookies: Record<string, string> = {}): NextRequest {
  const url = `http://localhost:3000${path}`;
  const cookieHeader = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");

  return new NextRequest(url, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });
}

describe("middleware", () => {
  it("allows the login page through without authentication", () => {
    const response = middleware(makeRequest("/"));
    expect(response.status).toBe(200);
  });

  it("allows auth API routes through without authentication", () => {
    const loginResponse = middleware(makeRequest("/api/auth/login"));
    expect(loginResponse.status).toBe(200);

    const signupResponse = middleware(makeRequest("/api/auth/signup"));
    expect(signupResponse.status).toBe(200);

    const logoutResponse = middleware(makeRequest("/api/auth/logout"));
    expect(logoutResponse.status).toBe(200);
  });

  it("redirects unauthenticated users to login for protected routes", () => {
    const response = middleware(makeRequest("/dashboard"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/");
  });

  it("allows authenticated users to access protected routes", () => {
    const response = middleware(makeRequest("/dashboard", { session_user_id: "1" }));
    expect(response.status).toBe(200);
  });

  it("redirects unauthenticated users from API routes", () => {
    const response = middleware(makeRequest("/api/food-log"));
    expect(response.status).toBe(307);
  });

  it("allows authenticated users to access API routes", () => {
    const response = middleware(makeRequest("/api/food-log", { session_user_id: "5" }));
    expect(response.status).toBe(200);
  });

  it("redirects unauthenticated users from profile page", () => {
    const response = middleware(makeRequest("/profile"));
    expect(response.status).toBe(307);
  });

  it("redirects unauthenticated users from analysis page", () => {
    const response = middleware(makeRequest("/analysis"));
    expect(response.status).toBe(307);
  });
});
