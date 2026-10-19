import { describe, expect, it } from "vitest";
import { fieldErrors } from "./common";
import { contactStep, quoteRequestSchema, usageStep } from "./quote-request";

const valid = {
  property_type: "house",
  ownership: "owner",
  roof_type: "concrete_flat",
  roof_area_m2: "",
  shading: "none",
  monthly_bill_mur: "Rs 3,500",
  battery_interest: "unsure",
  desired_kwp: "",
  region: "moka",
  town: "Saint Pierre",
  timeline: "3_months",
  financing: "dbm_loan",
  grant_interest: "on",
  name: "Test Person",
  email: " Test@Example.com ",
  phone: "+230 5123 4567",
  whatsapp: "",
  preferred_contact: "whatsapp",
  notes: "",
  consent: "on",
};

describe("quote request validation", () => {
  it("accepts a complete form and normalises values", () => {
    const parsed = quoteRequestSchema.parse(valid);
    expect(parsed.monthly_bill_mur).toBe(3500);
    expect(parsed.email).toBe("test@example.com");
    expect(parsed.roof_area_m2).toBeUndefined();
    expect(parsed.whatsapp).toBeUndefined();
    expect(parsed.grant_interest).toBe(true);
    expect(parsed.consent).toBe(true);
  });

  it("requires consent", () => {
    const result = contactStep.safeParse({ ...valid, consent: undefined });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(fieldErrors(result.error).consent).toBe("consent");
  });

  it("rejects an invalid e-mail and phone number", () => {
    const result = contactStep.safeParse({
      ...valid,
      email: "nope",
      phone: "12",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrors(result.error);
      expect(errors.email).toBe("email");
      expect(errors.phone).toBe("phone");
    }
  });

  it("rejects an unrealistic bill", () => {
    const result = usageStep.safeParse({ ...valid, monthly_bill_mur: "50" });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(fieldErrors(result.error).monthly_bill_mur).toBe("tooSmall");
  });

  it("rejects an unknown region", () => {
    const result = quoteRequestSchema.safeParse({
      ...valid,
      region: "atlantis",
    });
    expect(result.success).toBe(false);
  });
});
