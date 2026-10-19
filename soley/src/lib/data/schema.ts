/**
 * Row types, one per database table (supabase/migrations). Column names are
 * kept in snake_case so rows go to and from the database unchanged.
 */

import type { Region } from "../regions";

export type RequestStatus =
  "new" | "assigned" | "quoted" | "chosen" | "installed" | "cancelled";
export type InstallerStatus =
  "applied" | "in_review" | "approved" | "rejected" | "suspended";
export type AssignmentStatus =
  "offered" | "accepted" | "declined" | "quoted" | "won" | "lost" | "withdrawn";
export type ReviewStatus = "pending" | "approved" | "rejected";
export type InvoiceStatus = "draft" | "sent" | "paid" | "void";
export type ContactMethod = "phone" | "whatsapp" | "email";

export type AdminRow = {
  email: string;
  name: string | null;
  created_at: string;
};

export type HouseholdRow = {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  whatsapp: string | null;
  preferred_contact: ContactMethod | null;
  locale: string;
  is_demo: boolean;
  erased_at: string | null;
  created_at: string;
  updated_at: string;
};

export type QuoteRequestRow = {
  id: string;
  reference: string;
  household_id: string;
  status: RequestStatus;
  region: Region;
  town: string | null;
  property_type: string;
  ownership: string;
  roof_type: string;
  roof_area_m2: number | null;
  shading: string;
  monthly_bill_mur: number;
  desired_kwp: number | null;
  battery_interest: string;
  timeline: string;
  financing: string;
  grant_interest: boolean;
  notes: string | null;
  max_installers: number;
  chosen_quote_id: string | null;
  chosen_at: string | null;
  installed_at: string | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
};

export type ConsentRow = {
  id: string;
  household_id: string | null;
  quote_request_id: string | null;
  purpose: string;
  text_version: string;
  locale: string;
  granted: boolean;
  created_at: string;
};

export type InstallerRow = {
  id: string;
  slug: string;
  company_name: string;
  brn: string | null;
  contact_name: string;
  contact_email: string;
  phone: string;
  whatsapp: string | null;
  website: string | null;
  address: string | null;
  description_en: string | null;
  description_fr: string | null;
  years_in_business: number | null;
  certifications: string[];
  ceb_registered: boolean;
  locale: string;
  status: InstallerStatus;
  active: boolean;
  monthly_lead_cap: number | null;
  approved_at: string | null;
  last_offered_at: string | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
};

export type InstallerRegionRow = { installer_id: string; region: Region };

export type InstallerDocumentRow = {
  id: string;
  installer_id: string;
  kind: string;
  file_name: string;
  storage_path: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
};

export type InstallerReviewRow = {
  installer_id: string;
  checklist: Record<string, boolean>;
  site_visit_date: string | null;
  site_visit_by: string | null;
  decision_note: string | null;
  updated_by: string | null;
  updated_at: string;
};

export type LeadAssignmentRow = {
  id: string;
  quote_request_id: string;
  installer_id: string;
  status: AssignmentStatus;
  assigned_by: string;
  offered_at: string;
  responded_at: string | null;
  decline_reason: string | null;
  fee_mur: number | null;
  billed_month: string | null;
  invoice_id: string | null;
  reminder_sent_at: string | null;
};

export type QuoteRow = {
  id: string;
  assignment_id: string;
  quote_request_id: string;
  installer_id: string;
  price_mur: number;
  system_kwp: number;
  panel_brand: string;
  panel_model: string | null;
  panel_count: number;
  panel_watt: number | null;
  inverter_brand: string;
  inverter_model: string | null;
  inverter_kw: number | null;
  battery_brand: string | null;
  battery_kwh: number | null;
  panel_warranty_years: number;
  inverter_warranty_years: number;
  workmanship_warranty_years: number;
  battery_warranty_years: number | null;
  yearly_production_kwh: number;
  start_weeks: number;
  duration_days: number;
  includes_ceb_application: boolean;
  valid_until: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ReviewRow = {
  id: string;
  quote_request_id: string;
  installer_id: string;
  household_id: string | null;
  rating: number;
  title: string | null;
  body: string;
  author_display_name: string;
  status: ReviewStatus;
  moderated_by: string | null;
  moderated_at: string | null;
  moderation_note: string | null;
  is_demo: boolean;
  created_at: string;
};

export type InvoiceRow = {
  id: string;
  number: string;
  installer_id: string;
  month: string;
  lead_count: number;
  total_mur: number;
  status: InvoiceStatus;
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
};

export type FactRow = {
  key: string;
  value: number | null;
  source_name: string | null;
  source_url: string | null;
  source_date: string | null;
  verified: boolean;
  updated_by: string | null;
  updated_at: string;
};

export type CalculatorSettingRow = {
  key: string;
  value: number;
  updated_by: string | null;
  updated_at: string;
};

export type PlatformSettingsRow = {
  id: true;
  lead_price_mur: number;
  default_monthly_cap: number;
  auto_routing: boolean;
  updated_by: string | null;
  updated_at: string;
};

export type AdminNoteRow = {
  id: string;
  subject_type: "installer" | "quote_request";
  subject_id: string;
  author: string;
  body: string;
  created_at: string;
};

/** Table name → row type. */
export type Tables = {
  admins: AdminRow;
  households: HouseholdRow;
  quote_requests: QuoteRequestRow;
  consents: ConsentRow;
  installers: InstallerRow;
  installer_regions: InstallerRegionRow;
  installer_documents: InstallerDocumentRow;
  installer_reviews: InstallerReviewRow;
  lead_assignments: LeadAssignmentRow;
  quotes: QuoteRow;
  reviews: ReviewRow;
  invoices: InvoiceRow;
  facts: FactRow;
  calculator_settings: CalculatorSettingRow;
  platform_settings: PlatformSettingsRow;
  admin_notes: AdminNoteRow;
};

export type TableName = keyof Tables;

/** Primary key column(s) per table, used by upserts. */
export const primaryKeys: { [T in TableName]: (keyof Tables[T])[] } = {
  admins: ["email"],
  households: ["id"],
  quote_requests: ["id"],
  consents: ["id"],
  installers: ["id"],
  installer_regions: ["installer_id", "region"],
  installer_documents: ["id"],
  installer_reviews: ["installer_id"],
  lead_assignments: ["id"],
  quotes: ["id"],
  reviews: ["id"],
  invoices: ["id"],
  facts: ["key"],
  calculator_settings: ["key"],
  platform_settings: ["id"],
  admin_notes: ["id"],
};
