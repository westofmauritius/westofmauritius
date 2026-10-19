import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { citext } from "@electric-sql/pglite/contrib/citext";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Applies every migration to an in-process Postgres (PGlite) and checks the
 * security rules. Supabase's own pieces (the auth schema, roles and storage)
 * are stubbed with the same names, so the SQL runs unchanged.
 */

const supabaseStubs = `
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create function auth.email() returns text language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.email', true), '') $$;
  create schema storage;
  create table storage.buckets (id text primary key, name text, public boolean);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant usage on schema public to anon, authenticated;
`;

const migrationsDir = join(__dirname, "..", "migrations");
let db: PGlite;

/** Runs `sql` as a signed-in user (or anonymous visitor) with RLS applied. */
async function asUser<T>(email: string | null, sql: string): Promise<T[]> {
  await db.exec(`set role ${email ? "authenticated" : "anon"};`);
  await db.exec(
    `select set_config('request.jwt.claim.email', '${email ?? ""}', false);`,
  );
  try {
    return (await db.query<T>(sql)).rows;
  } finally {
    await db.exec("reset role;");
  }
}

beforeAll(async () => {
  db = new PGlite({ extensions: { citext, pgcrypto } });
  await db.exec(supabaseStubs);
  for (const file of readdirSync(migrationsDir).sort()) {
    await db.exec(readFileSync(join(migrationsDir, file), "utf8"));
  }
  await db.exec(`
    grant select on all tables in schema public to anon, authenticated;
    insert into admins (email) values ('admin@example.com');
    insert into households (id, email, name) values
      ('00000000-0000-4000-8000-000000000001', 'a@example.com', 'A'),
      ('00000000-0000-4000-8000-000000000002', 'b@example.com', 'B');
    insert into quote_requests (id, reference, household_id, region, property_type, ownership,
      roof_type, shading, monthly_bill_mur, battery_interest, timeline, financing) values
      ('00000000-0000-4000-8000-000000000011', 'SOL-AAAAA', '00000000-0000-4000-8000-000000000001',
       'moka', 'house', 'owner', 'concrete_flat', 'none', 3000, 'no', 'asap', 'cash'),
      ('00000000-0000-4000-8000-000000000012', 'SOL-BBBBB', '00000000-0000-4000-8000-000000000002',
       'moka', 'house', 'owner', 'concrete_flat', 'none', 3000, 'no', 'asap', 'cash');
    insert into installers (id, slug, company_name, contact_name, contact_email, phone, status) values
      ('00000000-0000-4000-8000-000000000021', 'one', 'One', 'One', 'one@example.com', '1', 'approved'),
      ('00000000-0000-4000-8000-000000000022', 'two', 'Two', 'Two', 'two@example.com', '2', 'applied');
    insert into lead_assignments (quote_request_id, installer_id, status) values
      ('00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000021', 'offered');
  `);
});

afterAll(async () => {
  await db?.close();
});

describe("database migrations", () => {
  it("enable Row Level Security on every table", async () => {
    const { rows } = await db.query<{ relname: string }>(`
      select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity`);
    expect(rows).toEqual([]);
  });

  it("create every table the brief asks for", async () => {
    const { rows } = await db.query<{ tablename: string }>(
      "select tablename from pg_tables where schemaname = 'public'",
    );
    const names = rows.map((r) => r.tablename);
    for (const table of [
      "households",
      "quote_requests",
      "installers",
      "installer_regions",
      "installer_documents",
      "lead_assignments",
      "quotes",
      "reviews",
      "invoices",
      "facts",
      "calculator_settings",
      "admin_notes",
    ]) {
      expect(names).toContain(table);
    }
  });

  it("show anonymous visitors only approved installers and nothing personal", async () => {
    expect(await asUser(null, "select * from households")).toEqual([]);
    expect(await asUser(null, "select * from quote_requests")).toEqual([]);
    const installers = await asUser<{ slug: string }>(
      null,
      "select slug from installers",
    );
    expect(installers.map((i) => i.slug)).toEqual(["one"]);
  });

  it("show a household only its own requests", async () => {
    const rows = await asUser<{ reference: string }>(
      "a@example.com",
      "select reference from quote_requests",
    );
    expect(rows.map((r) => r.reference)).toEqual(["SOL-AAAAA"]);
    const households = await asUser<{ name: string }>(
      "a@example.com",
      "select name from households",
    );
    expect(households.map((h) => h.name)).toEqual(["A"]);
  });

  it("show an installer only requests assigned to it, and contacts only once accepted", async () => {
    const rows = await asUser<{ reference: string }>(
      "one@example.com",
      "select reference from quote_requests",
    );
    expect(rows.map((r) => r.reference)).toEqual(["SOL-AAAAA"]);
    expect(await asUser("one@example.com", "select * from households")).toEqual(
      [],
    );
    await db.exec("update lead_assignments set status = 'accepted'");
    const households = await asUser<{ name: string }>(
      "one@example.com",
      "select name from households",
    );
    expect(households.map((h) => h.name)).toEqual(["A"]);
    expect(
      await asUser("two@example.com", "select * from quote_requests"),
    ).toEqual([]);
  });

  it("give admins everything", async () => {
    const rows = await asUser(
      "admin@example.com",
      "select * from quote_requests",
    );
    expect(rows).toHaveLength(2);
  });

  it("rate-limit with the database function", async () => {
    const hit = async () =>
      (
        await db.query<{ ok: boolean }>(
          "select rate_limit_hit('t', 60, 2) as ok",
        )
      ).rows[0]!.ok;
    expect([await hit(), await hit(), await hit()]).toEqual([
      true,
      true,
      false,
    ]);
  });
});
