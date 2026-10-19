import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Db, FileStore, SelectOptions, Where } from "./db";
import { primaryKeys, type TableName, type Tables } from "./schema";

const BUCKET = "installer-documents";

/**
 * The service-role client. It bypasses Row Level Security, so it must only
 * ever be used on the server, after the caller's role has been checked
 * (src/lib/auth). `server-only` makes importing it from client code a
 * build error.
 */
export function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// The query builder's generic types depend on a generated schema type; this
// adapter works with our own row types (schema.ts) instead, so the builder
// is used through this narrow, loosely typed view.
type Filterable = {
  eq(column: string, value: unknown): Filterable;
  in(column: string, values: unknown[]): Filterable;
  is(column: string, value: null): Filterable;
  ilike(column: string, value: string): Filterable;
  order(column: string, options: { ascending: boolean }): Filterable;
  limit(count: number): Filterable;
  select(columns?: string): Filterable;
  then: PromiseLike<{
    data: unknown;
    error: { message: string } | null;
  }>["then"];
};

function applyWhere(query: Filterable, where: Record<string, unknown> = {}) {
  let q = query;
  for (const [column, value] of Object.entries(where)) {
    if (value === null) q = q.is(column, null);
    else if (Array.isArray(value)) q = q.in(column, value);
    else q = q.eq(column, value);
  }
  return q;
}

async function run<T>(query: Filterable): Promise<T> {
  const { data, error } = await query;
  if (error) throw new Error(`Database error: ${error.message}`);
  return (data ?? []) as T;
}

export function createSupabaseDb(
  client: SupabaseClient = createServiceClient(),
): Db {
  const from = (table: TableName) =>
    client.from(table) as unknown as Filterable & {
      insert(rows: unknown): Filterable;
      upsert(rows: unknown, options: { onConflict: string }): Filterable;
      update(patch: unknown): Filterable;
      delete(): Filterable;
    };

  return {
    async select<T extends TableName>(
      table: T,
      where?: Where<Tables[T]>,
      options: SelectOptions<Tables[T]> = {},
    ) {
      let q = applyWhere(from(table).select("*"), where);
      if (options.orderBy)
        q = q.order(options.orderBy, {
          ascending: options.ascending !== false,
        });
      if (options.limit !== undefined) q = q.limit(options.limit);
      return run<Tables[T][]>(q);
    },
    async insert<T extends TableName>(table: T, rows: Tables[T] | Tables[T][]) {
      return run<Tables[T][]>(from(table).insert(rows).select("*"));
    },
    async upsert<T extends TableName>(table: T, rows: Tables[T] | Tables[T][]) {
      const onConflict = (primaryKeys[table] as string[]).join(",");
      return run<Tables[T][]>(
        from(table).upsert(rows, { onConflict }).select("*"),
      );
    },
    async update<T extends TableName>(
      table: T,
      where: Where<Tables[T]>,
      patch: Partial<Tables[T]>,
    ) {
      return run<Tables[T][]>(
        applyWhere(from(table).update(patch), where).select("*"),
      );
    },
    async remove<T extends TableName>(table: T, where: Where<Tables[T]>) {
      await run(applyWhere(from(table).delete(), where));
    },
    async rateLimitHit(key, windowSeconds, max) {
      const { data, error } = await client.rpc("rate_limit_hit", {
        p_key: key,
        p_window_seconds: windowSeconds,
        p_max: max,
      });
      if (error) throw new Error(`Rate limit error: ${error.message}`);
      return data === true;
    },
  };
}

export function createSupabaseFileStore(
  client: SupabaseClient = createServiceClient(),
): FileStore {
  const bucket = () => client.storage.from(BUCKET);
  return {
    async put(path, data, contentType) {
      const { error } = await bucket().upload(path, data, {
        contentType,
        upsert: false,
      });
      if (error) throw new Error(`Upload failed: ${error.message}`);
    },
    async get(path) {
      const { data, error } = await bucket().download(path);
      if (error || !data) return null;
      return { data: await data.arrayBuffer(), contentType: data.type };
    },
    async remove(paths) {
      if (paths.length === 0) return;
      await bucket().remove(paths);
    },
  };
}
