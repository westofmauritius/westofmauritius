import { neon } from "@neondatabase/serverless";
import type { ContactRow, LeadRow, Store, SubscriberRow } from "./types";

/**
 * Store backed by Neon Postgres, over HTTPS (works on Cloudflare Workers).
 * Every query uses parameters ($1, $2 …): values are never pasted into SQL,
 * which rules out SQL injection.
 */
export function neonStore(url: string): Store {
  const sql = neon(url);
  const iso = (d: unknown) => (d ? new Date(d as string).toISOString() : null);

  return {
    kind: "neon",

    async saveLead(lead) {
      await sql.query(
        `insert into leads (locale, name, email, phone, country, budget, timeframe, areas, message,
           newsletter, consent_version, source, ip_hash)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          lead.locale,
          lead.name,
          lead.email,
          lead.phone,
          lead.country,
          lead.budget,
          lead.timeframe,
          lead.areas,
          lead.message,
          lead.newsletter,
          lead.consentVersion,
          lead.source,
          lead.ipHash,
        ],
      );
    },

    async saveContact(m) {
      await sql.query(
        `insert into contact_messages (locale, name, email, topic, message, ip_hash)
         values ($1,$2,$3,$4,$5,$6)`,
        [m.locale, m.name, m.email, m.topic, m.message, m.ipHash],
      );
    },

    async saveSubscriber(sub) {
      // A new address is inserted; an existing one keeps its token and is
      // re-activated if it had unsubscribed.
      const rows = (await sql.query(
        `insert into newsletter_subscribers (email, locale, consent_version, token, ip_hash)
         values ($1,$2,$3,$4,$5)
         on conflict (email) do update set unsubscribed_at = null
         returning token, confirmed_at`,
        [sub.email, sub.locale, sub.consentVersion, sub.token, sub.ipHash],
      )) as { token: string; confirmed_at: string | null }[];
      return {
        token: rows[0].token,
        alreadyConfirmed: rows[0].confirmed_at !== null,
      };
    },

    async confirmSubscriber(token) {
      const rows = await sql.query(
        `update newsletter_subscribers set confirmed_at = coalesce(confirmed_at, now())
         where token = $1 returning id`,
        [token],
      );
      return rows.length > 0;
    },

    async unsubscribe(token) {
      const rows = await sql.query(
        `update newsletter_subscribers set unsubscribed_at = now() where token = $1 returning id`,
        [token],
      );
      return rows.length > 0;
    },

    async listLeads(filters, limit = 1000) {
      const where: string[] = [];
      const params: unknown[] = [];
      const add = (clause: string, value: unknown) => {
        params.push(value);
        where.push(clause.replace("?", `$${params.length}`));
      };
      if (filters.q)
        add(
          "(name ilike ? or email ilike $" + (params.length + 1) + ")",
          `%${filters.q}%`,
        );
      if (filters.budget) add("budget = ?", filters.budget);
      if (filters.timeframe) add("timeframe = ?", filters.timeframe);
      if (filters.country) add("country = ?", filters.country);
      if (filters.area) add("? = any(areas)", filters.area);
      if (filters.from) add("created_at >= ?::date", filters.from);
      if (filters.to) add("created_at < (?::date + 1)", filters.to);
      params.push(limit);
      const rows = (await sql.query(
        `select * from leads ${where.length ? "where " + where.join(" and ") : ""}
         order by created_at desc limit $${params.length}`,
        params,
      )) as Record<string, unknown>[];
      return rows.map((r): LeadRow => ({
        id: Number(r.id),
        createdAt: iso(r.created_at)!,
        locale: String(r.locale),
        name: String(r.name),
        email: String(r.email),
        phone: String(r.phone),
        country: String(r.country),
        budget: String(r.budget),
        timeframe: String(r.timeframe),
        areas: (r.areas as string[]) ?? [],
        message: String(r.message),
        newsletter: Boolean(r.newsletter),
        source: String(r.source),
        consentVersion: String(r.consent_version),
        status: String(r.status),
      }));
    },

    async listContacts(limit = 1000) {
      const rows = (await sql.query(
        `select * from contact_messages order by created_at desc limit $1`,
        [limit],
      )) as Record<string, unknown>[];
      return rows.map((r): ContactRow => ({
        id: Number(r.id),
        createdAt: iso(r.created_at)!,
        locale: String(r.locale),
        name: String(r.name),
        email: String(r.email),
        topic: String(r.topic),
        message: String(r.message),
      }));
    },

    async listSubscribers(limit = 5000) {
      const rows = (await sql.query(
        `select id, created_at, email, locale, confirmed_at, unsubscribed_at
         from newsletter_subscribers order by created_at desc limit $1`,
        [limit],
      )) as Record<string, unknown>[];
      return rows.map((r): SubscriberRow => ({
        id: Number(r.id),
        createdAt: iso(r.created_at)!,
        email: String(r.email),
        locale: String(r.locale),
        confirmedAt: iso(r.confirmed_at),
        unsubscribedAt: iso(r.unsubscribed_at),
      }));
    },

    async hit(kind, ipHash, minutes) {
      // Record the event, tidy up old ones, and count recent ones in one round trip.
      const rows = (await sql.query(
        `with ins as (insert into rate_events (kind, ip_hash) values ($1, $2)),
              del as (delete from rate_events where created_at < now() - interval '1 day')
         select count(*)::int + 1 as n from rate_events
         where kind = $1 and ip_hash = $2 and created_at > now() - ($3 || ' minutes')::interval`,
        [kind, ipHash, String(minutes)],
      )) as { n: number }[];
      return rows[0].n;
    },
  };
}
