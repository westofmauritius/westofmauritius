import type {
  AdminRow,
  HouseholdRow,
  InstallerRegionRow,
  InstallerReviewRow,
  InstallerRow,
  LeadAssignmentRow,
  PlatformSettingsRow,
  QuoteRequestRow,
  QuoteRow,
  ReviewRow,
} from "../data/schema";
import type { Region } from "../regions";

/**
 * DEMO DATA. None of these companies, people or reviews are real.
 *
 * Every row is marked `is_demo: true` where the table has the column, every
 * company and person name contains "Demo", and every e-mail address uses
 * the reserved example.com domain. Used by the in-memory store (development
 * and end-to-end tests) and by `npm run db:seed` for a staging database.
 * Never load it into the live database (LAUNCH_CHECKLIST.md).
 */

export const DEMO_ADMIN_EMAIL = "admin@example.com";
export const DEMO_HOUSEHOLD_EMAIL = "household@example.com";
export const DEMO_INSTALLER_EMAIL = "installer.north@example.com";

const day = 24 * 60 * 60 * 1000;
const ago = (now: number, days: number) =>
  new Date(now - days * day).toISOString();

const id = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

type DemoInstaller = {
  n: number;
  slug: string;
  name: string;
  email: string;
  regions: Region[];
  years: number;
  certifications: string[];
};

const installers: DemoInstaller[] = [
  {
    n: 101,
    slug: "demo-nord-solaire",
    name: "Demo Nord Solaire Ltd",
    email: DEMO_INSTALLER_EMAIL,
    regions: [
      "pamplemousses",
      "riviere-du-rempart",
      "port-louis",
      "moka",
      "flacq",
    ],
    years: 9,
    certifications: ["Demo certificate A", "Demo certificate B"],
  },
  {
    n: 102,
    slug: "demo-lagon-energie",
    name: "Demo Lagon Énergie Ltée",
    email: "installer.west@example.com",
    regions: [
      "black-river",
      "plaines-wilhems",
      "port-louis",
      "savanne",
      "moka",
    ],
    years: 6,
    certifications: ["Demo certificate A"],
  },
  {
    n: 103,
    slug: "demo-sud-sunworks",
    name: "Demo Sud Sunworks Co",
    email: "installer.south@example.com",
    regions: ["grand-port", "savanne", "plaines-wilhems", "moka", "flacq"],
    years: 12,
    certifications: ["Demo certificate B", "Demo certificate C"],
  },
  {
    n: 104,
    slug: "demo-ile-pv",
    name: "Demo Île PV Services",
    email: "installer.island@example.com",
    regions: [
      "port-louis",
      "pamplemousses",
      "riviere-du-rempart",
      "flacq",
      "grand-port",
      "savanne",
      "black-river",
      "plaines-wilhems",
      "moka",
      "rodrigues",
    ],
    years: 3,
    certifications: ["Demo certificate A"],
  },
];

export function demoData(now = Date.now()) {
  const admins: AdminRow[] = [
    { email: DEMO_ADMIN_EMAIL, name: "Demo admin", created_at: ago(now, 90) },
  ];

  const installerRows: InstallerRow[] = installers.map((i) => ({
    id: id(i.n),
    slug: i.slug,
    company_name: i.name,
    brn: `DEMO-${i.n}`,
    contact_name: `Demo contact ${i.n}`,
    contact_email: i.email,
    phone: "+230 5000 0000",
    whatsapp: "+230 5000 0000",
    website: null,
    address: "Demo address, Mauritius",
    description_en:
      "Demo company for testing Soley. This is not a real installer.",
    description_fr:
      "Entreprise de démonstration pour tester Soley. Ce n’est pas un vrai installateur.",
    years_in_business: i.years,
    certifications: i.certifications,
    ceb_registered: true,
    locale: i.n % 2 ? "en" : "fr",
    status: "approved",
    active: true,
    monthly_lead_cap: null,
    approved_at: ago(now, 60),
    last_offered_at: ago(now, 10 + i.n - 100),
    is_demo: true,
    created_at: ago(now, 70),
    updated_at: ago(now, 60),
  }));

  // One application waiting in the vetting queue.
  installerRows.push({
    id: id(105),
    slug: "demo-new-applicant",
    company_name: "Demo New Applicant Ltd",
    brn: "DEMO-105",
    contact_name: "Demo applicant",
    contact_email: "installer.applicant@example.com",
    phone: "+230 5000 0001",
    whatsapp: null,
    website: null,
    address: "Demo address, Mauritius",
    description_en: "Demo application waiting for review.",
    description_fr: "Candidature de démonstration en attente d’examen.",
    years_in_business: 2,
    certifications: [],
    ceb_registered: false,
    locale: "en",
    status: "applied",
    active: true,
    monthly_lead_cap: null,
    approved_at: null,
    last_offered_at: null,
    is_demo: true,
    created_at: ago(now, 2),
    updated_at: ago(now, 2),
  });

  const installerRegions: InstallerRegionRow[] = [
    ...installers.flatMap((i) =>
      i.regions.map((region) => ({ installer_id: id(i.n), region })),
    ),
    { installer_id: id(105), region: "moka" },
  ];

  const installerReviews: InstallerReviewRow[] = installers.map((i) => ({
    installer_id: id(i.n),
    checklist: {
      registration: true,
      insurance: true,
      certificates: true,
      references: true,
      siteVisit: true,
      cebProcess: true,
    },
    site_visit_date: ago(now, 62).slice(0, 10),
    site_visit_by: "Demo admin",
    decision_note: "Demo vetting record.",
    updated_by: DEMO_ADMIN_EMAIL,
    updated_at: ago(now, 60),
  }));

  const households: HouseholdRow[] = [
    {
      id: id(201),
      email: DEMO_HOUSEHOLD_EMAIL,
      name: "Demo Household",
      phone: "+230 5000 0002",
      whatsapp: "+230 5000 0002",
      preferred_contact: "whatsapp",
      locale: "en",
      is_demo: true,
      erased_at: null,
      created_at: ago(now, 20),
      updated_at: ago(now, 20),
    },
    {
      id: id(202),
      email: "past.customer@example.com",
      name: "Demo Past Customer",
      phone: "+230 5000 0003",
      whatsapp: null,
      preferred_contact: "phone",
      locale: "fr",
      is_demo: true,
      erased_at: null,
      created_at: ago(now, 120),
      updated_at: ago(now, 120),
    },
  ];

  const baseRequest = {
    town: "Demo town",
    property_type: "house",
    ownership: "owner",
    roof_type: "concrete_flat",
    shading: "none",
    desired_kwp: null,
    grant_interest: true,
    notes: null,
    max_installers: 3,
    installed_at: null,
    quote_reminder_sent_at: null,
    is_demo: true,
  } as const;

  const requests: QuoteRequestRow[] = [
    {
      ...baseRequest,
      id: id(301),
      reference: "SOL-DEMO1",
      household_id: id(201),
      status: "quoted",
      region: "moka",
      roof_area_m2: 60,
      monthly_bill_mur: 3500,
      battery_interest: "unsure",
      timeline: "3_months",
      financing: "dbm_loan",
      chosen_quote_id: null,
      chosen_at: null,
      created_at: ago(now, 12),
      updated_at: ago(now, 5),
    },
    {
      ...baseRequest,
      id: id(302),
      reference: "SOL-DEMO2",
      household_id: id(202),
      status: "installed",
      region: "pamplemousses",
      roof_area_m2: 45,
      monthly_bill_mur: 2800,
      battery_interest: "no",
      timeline: "asap",
      financing: "cash",
      chosen_quote_id: id(502),
      chosen_at: ago(now, 100),
      installed_at: ago(now, 80),
      created_at: ago(now, 115),
      updated_at: ago(now, 80),
    },
  ];

  const assignment = (
    n: number,
    request: number,
    installer: number,
    status: LeadAssignmentRow["status"],
    offeredDaysAgo: number,
    responseHours: number,
    feeMonth: string | null,
  ): LeadAssignmentRow => ({
    id: id(n),
    quote_request_id: id(request),
    installer_id: id(installer),
    status,
    assigned_by: "auto",
    offered_at: ago(now, offeredDaysAgo),
    responded_at: new Date(
      now - offeredDaysAgo * day + responseHours * 60 * 60 * 1000,
    ).toISOString(),
    decline_reason: null,
    fee_mur: feeMonth ? 750 : null,
    billed_month: feeMonth,
    invoice_id: null,
    reminder_sent_at: null,
  });

  const month = (daysAgo: number) => ago(now, daysAgo).slice(0, 7);
  const assignments: LeadAssignmentRow[] = [
    assignment(401, 301, 101, "quoted", 12, 3, month(12)),
    assignment(402, 301, 103, "quoted", 12, 20, month(12)),
    assignment(403, 301, 104, "quoted", 12, 6, month(12)),
    assignment(404, 302, 101, "won", 115, 2, month(115)),
    assignment(405, 302, 104, "lost", 115, 30, month(115)),
  ];

  const quote = (
    n: number,
    assignmentN: number,
    request: number,
    installer: number,
    values: Partial<QuoteRow>,
    createdDaysAgo: number,
  ): QuoteRow => ({
    id: id(n),
    assignment_id: id(assignmentN),
    quote_request_id: id(request),
    installer_id: id(installer),
    price_mur: 200_000,
    system_kwp: 3.5,
    panel_brand: "Demo Panel Brand",
    panel_model: "DP-450",
    panel_count: 8,
    panel_watt: 450,
    inverter_brand: "Demo Inverter Brand",
    inverter_model: "DI-4K",
    inverter_kw: 4,
    battery_brand: null,
    battery_kwh: null,
    panel_warranty_years: 25,
    inverter_warranty_years: 10,
    workmanship_warranty_years: 5,
    battery_warranty_years: null,
    yearly_production_kwh: 4900,
    start_weeks: 4,
    duration_days: 2,
    includes_ceb_application: true,
    valid_until: new Date(now + 30 * day).toISOString().slice(0, 10),
    notes: "Demo quote for testing. Not a real offer.",
    created_at: ago(now, createdDaysAgo),
    updated_at: ago(now, createdDaysAgo),
    ...values,
  });

  const quotes: QuoteRow[] = [
    quote(501, 401, 301, 101, { price_mur: 215_000, system_kwp: 3.6 }, 10),
    quote(
      503,
      402,
      301,
      103,
      {
        price_mur: 345_000,
        system_kwp: 4,
        panel_count: 9,
        battery_brand: "Demo Battery Brand",
        battery_kwh: 5,
        battery_warranty_years: 10,
        workmanship_warranty_years: 10,
        yearly_production_kwh: 5600,
        start_weeks: 6,
        duration_days: 3,
      },
      8,
    ),
    quote(
      504,
      403,
      301,
      104,
      {
        price_mur: 189_000,
        system_kwp: 3.2,
        panel_count: 7,
        panel_warranty_years: 20,
        workmanship_warranty_years: 2,
        yearly_production_kwh: 4400,
        start_weeks: 2,
      },
      7,
    ),
    quote(502, 404, 302, 101, { price_mur: 170_000, system_kwp: 3 }, 110),
  ];

  const reviews: ReviewRow[] = [
    {
      id: id(601),
      quote_request_id: id(302),
      installer_id: id(101),
      household_id: id(202),
      rating: 5,
      title: "Demo review",
      body: "Demo review text for testing the layout. Not a real customer.",
      author_display_name: "Demo customer, Pamplemousses",
      status: "approved",
      moderated_by: DEMO_ADMIN_EMAIL,
      moderated_at: ago(now, 75),
      moderation_note: null,
      is_demo: true,
      created_at: ago(now, 78),
    },
  ];

  const platformSettings: PlatformSettingsRow[] = [
    {
      id: true,
      lead_price_mur: 750,
      default_monthly_cap: 20,
      auto_routing: true,
      updated_by: DEMO_ADMIN_EMAIL,
      updated_at: ago(now, 30),
    },
  ];

  return {
    admins,
    installers: installerRows,
    installer_regions: installerRegions,
    installer_reviews: installerReviews,
    households,
    quote_requests: requests,
    lead_assignments: assignments,
    quotes,
    reviews,
    platform_settings: platformSettings,
  };
}
