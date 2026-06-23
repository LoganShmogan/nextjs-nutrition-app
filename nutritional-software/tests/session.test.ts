import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { getUserId, getActiveProfileId } from "@/lib/session";

function makeRequest(cookies: Record<string, string> = {}): NextRequest {
  const url = "http://localhost:3000/api/test";
  const cookieHeader = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");

  return new NextRequest(url, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });
}

describe("getUserId", () => {
  it("returns null when no session cookie is present", () => {
    const request = makeRequest();
    expect(getUserId(request)).toBeNull();
  });

  it("returns the user id as a number when cookie is valid", () => {
    const request = makeRequest({ session_user_id: "42" });
    expect(getUserId(request)).toBe(42);
  });

  it("returns null for non-numeric cookie value", () => {
    const request = makeRequest({ session_user_id: "abc" });
    expect(getUserId(request)).toBeNull();
  });

  it("returns null for zero", () => {
    const request = makeRequest({ session_user_id: "0" });
    expect(getUserId(request)).toBeNull();
  });

  it("returns null for negative values", () => {
    const request = makeRequest({ session_user_id: "-5" });
    expect(getUserId(request)).toBeNull();
  });

  it("returns null for empty string", () => {
    const request = makeRequest({ session_user_id: "" });
    expect(getUserId(request)).toBeNull();
  });

  it("returns null for Infinity", () => {
    const request = makeRequest({ session_user_id: "Infinity" });
    expect(getUserId(request)).toBeNull();
  });

  it("parses integer from float-like string", () => {
    const request = makeRequest({ session_user_id: "7.9" });
    expect(getUserId(request)).toBe(7);
  });
});

describe("getActiveProfileId", () => {
  it("returns null when no active_profile_id cookie is present", () => {
    const request = makeRequest();
    expect(getActiveProfileId(request)).toBeNull();
  });

  it("returns the profile id as a number when cookie is valid", () => {
    const request = makeRequest({ active_profile_id: "10" });
    expect(getActiveProfileId(request)).toBe(10);
  });

  it("returns null for non-numeric cookie value", () => {
    const request = makeRequest({ active_profile_id: "xyz" });
    expect(getActiveProfileId(request)).toBeNull();
  });

  it("returns null for zero", () => {
    const request = makeRequest({ active_profile_id: "0" });
    expect(getActiveProfileId(request)).toBeNull();
  });

  it("returns null for negative values", () => {
    const request = makeRequest({ active_profile_id: "-1" });
    expect(getActiveProfileId(request)).toBeNull();
  });

  it("works when both session and profile cookies are present", () => {
    const request = makeRequest({
      session_user_id: "5",
      active_profile_id: "12",
    });
    expect(getUserId(request)).toBe(5);
    expect(getActiveProfileId(request)).toBe(12);
  });
});
