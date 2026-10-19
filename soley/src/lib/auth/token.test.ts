import { describe, expect, it } from "vitest";
import { signToken, verifyToken } from "./token";

const secret = "test-secret-test-secret-test-secret";

describe("signed tokens", () => {
  it("round-trips a valid token", async () => {
    const token = await signToken(
      { email: "a@example.com", exp: Date.now() + 1000, purpose: "session" },
      secret,
    );
    expect((await verifyToken(token, secret, "session"))?.email).toBe(
      "a@example.com",
    );
  });

  it("rejects a tampered, expired, wrong-purpose or wrong-key token", async () => {
    const token = await signToken(
      { email: "a@example.com", exp: Date.now() + 1000, purpose: "link" },
      secret,
    );
    const [body, sig] = token.split(".");
    const forged = `${btoa(JSON.stringify({ email: "admin@example.com", exp: Date.now() + 1000, purpose: "link" }))}.${sig}`;
    expect(await verifyToken(forged, secret, "link")).toBeNull();
    expect(await verifyToken(`${body}.${sig}`, secret, "session")).toBeNull();
    expect(await verifyToken(token, "another-secret", "link")).toBeNull();
    expect(
      await verifyToken(token, secret, "link", Date.now() + 5000),
    ).toBeNull();
  });
});
