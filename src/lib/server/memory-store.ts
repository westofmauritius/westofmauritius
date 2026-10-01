import type { ContactRow, LeadRow, Store, SubscriberRow } from "./types";

type MemoryData = {
  leads: LeadRow[];
  contacts: ContactRow[];
  subscribers: (SubscriberRow & { token: string; consentVersion: string })[];
  events: { kind: string; ipHash: string; at: number }[];
};

// Kept on globalThis so it survives hot reloads in development.
const g = globalThis as typeof globalThis & { __wmMemory?: MemoryData };
const data = (g.__wmMemory ??= {
  leads: [],
  contacts: [],
  subscribers: [],
  events: [],
});

const now = () => new Date().toISOString();

/**
 * In-memory store for local development and automated tests: no database
 * needed, everything is lost on restart. Never used in production (see
 * getStore).
 */
export const memoryStore: Store = {
  kind: "memory",

  async saveLead(lead) {
    data.leads.unshift({
      ...lead,
      id: data.leads.length + 1,
      createdAt: now(),
      status: "new",
    });
  },

  async saveContact(message) {
    data.contacts.unshift({
      ...message,
      id: data.contacts.length + 1,
      createdAt: now(),
    });
  },

  async saveSubscriber(sub) {
    const existing = data.subscribers.find((s) => s.email === sub.email);
    if (existing) {
      existing.unsubscribedAt = null;
      return {
        token: existing.token,
        alreadyConfirmed: existing.confirmedAt !== null,
      };
    }
    data.subscribers.unshift({
      id: data.subscribers.length + 1,
      createdAt: now(),
      email: sub.email,
      locale: sub.locale,
      token: sub.token,
      consentVersion: sub.consentVersion,
      confirmedAt: null,
      unsubscribedAt: null,
    });
    return { token: sub.token, alreadyConfirmed: false };
  },

  async confirmSubscriber(token) {
    const sub = data.subscribers.find((s) => s.token === token);
    if (!sub) return false;
    sub.confirmedAt ??= now();
    return true;
  },

  async unsubscribe(token) {
    const sub = data.subscribers.find((s) => s.token === token);
    if (!sub) return false;
    sub.unsubscribedAt = now();
    return true;
  },

  async listLeads(filters, limit = 1000) {
    const q = filters.q?.toLowerCase();
    return data.leads
      .filter(
        (l) => !q || l.name.toLowerCase().includes(q) || l.email.includes(q),
      )
      .filter((l) => !filters.budget || l.budget === filters.budget)
      .filter((l) => !filters.timeframe || l.timeframe === filters.timeframe)
      .filter((l) => !filters.country || l.country === filters.country)
      .filter((l) => !filters.area || l.areas.includes(filters.area))
      .filter((l) => !filters.from || l.createdAt.slice(0, 10) >= filters.from)
      .filter((l) => !filters.to || l.createdAt.slice(0, 10) <= filters.to)
      .slice(0, limit);
  },

  async listContacts(limit = 1000) {
    return data.contacts.slice(0, limit);
  },

  async listSubscribers(limit = 5000) {
    return data.subscribers.slice(0, limit).map((s) => ({
      id: s.id,
      createdAt: s.createdAt,
      email: s.email,
      locale: s.locale,
      confirmedAt: s.confirmedAt,
      unsubscribedAt: s.unsubscribedAt,
    }));
  },

  async hit(kind, ipHash, minutes) {
    const at = Date.now();
    data.events = data.events.filter((e) => at - e.at < 24 * 60 * 60 * 1000);
    data.events.push({ kind, ipHash, at });
    return data.events.filter(
      (e) =>
        e.kind === kind &&
        e.ipHash === ipHash &&
        at - e.at < minutes * 60 * 1000,
    ).length;
  },
};
