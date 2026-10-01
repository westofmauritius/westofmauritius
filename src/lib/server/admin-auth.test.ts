import { beforeEach, describe, expect, it, vi } from "vitest";

// "server-only" and next/headers are only available inside Next.js.
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined }),
}));

const { createSession, passwordMatches, verifySession, adminConfigured } =
  await import("./admin-auth");

describe("admin auth", () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = "correct horse battery staple";
    process.env.ADMIN_SESSION_SECRET = "x".repeat(40);
  });

  it("checks the password", async () => {
    expect(await passwordMatches("correct horse battery staple")).toBe(true);
    expect(await passwordMatches("wrong")).toBe(false);
    expect(await passwordMatches("")).toBe(false);
  });

  it("accepts its own sessions and rejects tampered ones", async () => {
    const { value } = await createSession();
    expect(await verifySession(value)).toBe(true);
    const [expires, signature] = value.split(".");
    expect(await verifySession(`${Number(expires) + 1}.${signature}`)).toBe(
      false,
    );
    expect(await verifySession(`${expires}.AAAA`)).toBe(false);
    expect(await verifySession(undefined)).toBe(false);
  });

  it("rejects sessions signed with another secret", async () => {
    const { value } = await createSession();
    process.env.ADMIN_SESSION_SECRET = "y".repeat(40);
    expect(await verifySession(value)).toBe(false);
  });

  it("stays off without a long enough secret", () => {
    process.env.ADMIN_SESSION_SECRET = "short";
    expect(adminConfigured()).toBe(false);
  });
});
