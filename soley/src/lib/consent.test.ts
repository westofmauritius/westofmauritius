import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import fr from "../../messages/fr.json";
import { consentVersions } from "./consent";

const fingerprint = (...texts: string[]) =>
  createHash("sha256").update(texts.join("\n")).digest("hex").slice(0, 12);

/**
 * Each consent text is tied to its version. If this test fails, a consent
 * text changed: bump its version in src/lib/consent.ts and record the new
 * version and fingerprint here.
 */
const recorded = {
  shareWithInstallers: { version: "2026-10-19.1", fingerprint: "75c06b62d031" },
};

describe("consent texts", () => {
  it("share with installers has a matching version", () => {
    expect({
      version: consentVersions.shareWithInstallers,
      fingerprint: fingerprint(
        en.quoteForm.consent.label,
        fr.quoteForm.consent.label,
      ),
    }).toEqual(recorded.shareWithInstallers);
  });
});
