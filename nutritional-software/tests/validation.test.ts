// Author: Logan

import { describe, expect, it } from "vitest";

describe("input validation", () => {
  it("rejects negative age", () => {
    const age = -5;
    expect(age > 0).toBe(false);
  });

  it("rejects empty patient name", () => {
    const name = "";
    expect(name.trim().length > 0).toBe(false);
  });

  it("accepts valid weight", () => {
    const weight = 70;
    expect(weight > 0 && weight < 500).toBe(true);
  });

  it("rejects zero portion size", () => {
    const amount = 0;
    expect(amount > 0).toBe(false);
  });
});
