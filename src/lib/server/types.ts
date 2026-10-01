import type { ContactData, LeadData } from "@/lib/forms/validation";

/** Rows as stored and as shown in the admin. */
export type LeadRow = Omit<LeadData, "locale"> & {
  id: number;
  createdAt: string;
  locale: string;
  consentVersion: string;
  status: string;
};

export type ContactRow = Omit<ContactData, "locale"> & {
  id: number;
  createdAt: string;
  locale: string;
};

export type SubscriberRow = {
  id: number;
  createdAt: string;
  email: string;
  locale: string;
  confirmedAt: string | null;
  unsubscribedAt: string | null;
};

export type LeadFilters = {
  q?: string;
  budget?: string;
  timeframe?: string;
  area?: string;
  country?: string;
  /** ISO dates (YYYY-MM-DD), inclusive. */
  from?: string;
  to?: string;
};

export type RateKind = "lead" | "contact" | "newsletter" | "admin-login";

/**
 * Everything the site stores. Two implementations: Neon Postgres in
 * production, and an in-memory one for local development and tests.
 */
export interface Store {
  readonly kind: "neon" | "memory";
  saveLead(
    lead: LeadData & { consentVersion: string; ipHash: string },
  ): Promise<void>;
  saveContact(message: ContactData & { ipHash: string }): Promise<void>;
  /** Returns the subscriber's token; an existing address keeps its token. */
  saveSubscriber(sub: {
    email: string;
    locale: string;
    consentVersion: string;
    token: string;
    ipHash: string;
  }): Promise<{ token: string; alreadyConfirmed: boolean }>;
  confirmSubscriber(token: string): Promise<boolean>;
  unsubscribe(token: string): Promise<boolean>;
  listLeads(filters: LeadFilters, limit?: number): Promise<LeadRow[]>;
  listContacts(limit?: number): Promise<ContactRow[]>;
  listSubscribers(limit?: number): Promise<SubscriberRow[]>;
  /** Records an event and returns how many there were in the last `minutes`, including this one. */
  hit(kind: RateKind, ipHash: string, minutes: number): Promise<number>;
}
