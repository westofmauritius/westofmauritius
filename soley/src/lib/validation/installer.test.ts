import { describe, expect, it } from "vitest";
import {
  certificationList,
  checkFiles,
  installerApplicationSchema,
  MAX_TOTAL_UPLOAD_BYTES,
} from "./installer";

const valid = {
  company_name: "Test Solar Ltd",
  brn: "C12345678",
  contact_name: "Test Person",
  contact_email: "Test@Example.com",
  phone: "+230 5123 4567",
  whatsapp: "",
  website: "example.com",
  address: "Royal Road, Moka",
  years_in_business: "7",
  regions: ["moka", "flacq"],
  certifications: "",
  ceb_registered: "on",
  description: "",
  locale: "fr",
  terms: "on",
};

const file = (type: string, size: number) =>
  new File([new Uint8Array(size)], "doc", { type });

describe("installer application", () => {
  it("accepts a complete application", () => {
    const parsed = installerApplicationSchema.parse(valid);
    expect(parsed.contact_email).toBe("test@example.com");
    expect(parsed.website).toBe("https://example.com");
    expect(parsed.years_in_business).toBe(7);
    expect(parsed.ceb_registered).toBe(true);
  });

  it("needs at least one region and the partner terms", () => {
    const result = installerApplicationSchema.safeParse({
      ...valid,
      regions: [],
      terms: "",
    });
    expect(result.success).toBe(false);
  });

  it("splits certificates into a clean list", () => {
    expect(certificationList("A\n\n B \nA")).toEqual(["A", "B"]);
  });

  it("checks file types, total size and the registration document", () => {
    expect(
      checkFiles(
        [{ kind: "registration", file: file("application/pdf", 100) }],
        {
          requireRegistration: true,
        },
      ),
    ).toEqual({});
    expect(
      checkFiles([{ kind: "insurance", file: file("application/zip", 100) }], {
        requireRegistration: true,
      }),
    ).toEqual({ doc_insurance: "fileType", doc_registration: "required" });
    expect(
      checkFiles(
        [
          {
            kind: "registration",
            file: file("image/png", MAX_TOTAL_UPLOAD_BYTES + 1),
          },
        ],
        { requireRegistration: true },
      ),
    ).toEqual({ doc_registration: "fileSize" });
  });
});
