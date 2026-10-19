import {
  matches,
  type Db,
  type FileStore,
  type SelectOptions,
  type Where,
} from "./db";
import { primaryKeys, type TableName, type Tables } from "./schema";

type Store = { [T in TableName]: Tables[T][] };

const emptyStore = (): Store => ({
  admins: [],
  households: [],
  quote_requests: [],
  consents: [],
  installers: [],
  installer_regions: [],
  installer_documents: [],
  installer_reviews: [],
  lead_assignments: [],
  quotes: [],
  reviews: [],
  invoices: [],
  facts: [],
  calculator_settings: [],
  platform_settings: [],
  admin_notes: [],
});

// Rows are copied in and out so callers can never change stored data by
// accident (as with a real database).
const copy = <T>(value: T): T => structuredClone(value);

function sameKey<T extends TableName>(table: T, a: Tables[T], b: Tables[T]) {
  return primaryKeys[table].every((key) => a[key] === b[key]);
}

/**
 * An in-memory database for development, unit tests and the demo mode used
 * by the end-to-end tests. Data lives as long as the server process.
 */
export function createMemoryDb(initial?: Partial<Store>): Db {
  const store: Store = { ...emptyStore(), ...copy(initial ?? {}) };
  const hits = new Map<string, { windowStart: number; count: number }>();

  return {
    async select<T extends TableName>(
      table: T,
      where?: Where<Tables[T]>,
      options: SelectOptions<Tables[T]> = {},
    ) {
      let rows = (store[table] as Tables[T][]).filter((row) =>
        matches(row, where),
      );
      if (options.orderBy) {
        const key = options.orderBy;
        const direction = options.ascending === false ? -1 : 1;
        rows = [...rows].sort((a, b) => {
          const x = a[key] as unknown as string | number | null;
          const y = b[key] as unknown as string | number | null;
          if (x === y) return 0;
          if (x === null) return 1;
          if (y === null) return -1;
          return (x < y ? -1 : 1) * direction;
        });
      }
      if (options.limit !== undefined) rows = rows.slice(0, options.limit);
      return copy(rows);
    },

    async insert<T extends TableName>(table: T, rows: Tables[T] | Tables[T][]) {
      const list = Array.isArray(rows) ? rows : [rows];
      const target = store[table] as Tables[T][];
      for (const row of list) {
        if (target.some((existing) => sameKey(table, existing, row))) {
          throw new Error(`Duplicate key in ${table}`);
        }
      }
      target.push(...copy(list));
      return copy(list);
    },

    async upsert<T extends TableName>(table: T, rows: Tables[T] | Tables[T][]) {
      const list = Array.isArray(rows) ? rows : [rows];
      const target = store[table] as Tables[T][];
      for (const row of list) {
        const index = target.findIndex((existing) =>
          sameKey(table, existing, row),
        );
        if (index >= 0) target[index] = copy(row);
        else target.push(copy(row));
      }
      return copy(list);
    },

    async update<T extends TableName>(
      table: T,
      where: Where<Tables[T]>,
      patch: Partial<Tables[T]>,
    ) {
      const updated: Tables[T][] = [];
      const target = store[table] as Tables[T][];
      target.forEach((row, index) => {
        if (!matches(row, where)) return;
        const next = { ...row, ...copy(patch) };
        if ("updated_at" in next) {
          (next as { updated_at: string }).updated_at =
            new Date().toISOString();
        }
        target[index] = next;
        updated.push(next);
      });
      return copy(updated);
    },

    async remove<T extends TableName>(table: T, where: Where<Tables[T]>) {
      store[table] = (store[table] as Tables[T][]).filter(
        (row) => !matches(row, where),
      ) as Store[T];
    },

    async rateLimitHit(key: string, windowSeconds: number, max: number) {
      const now = Date.now();
      const windowStart = Math.floor(now / (windowSeconds * 1000));
      const entry = hits.get(key);
      if (!entry || entry.windowStart !== windowStart) {
        hits.set(key, { windowStart, count: 1 });
        return 1 <= max;
      }
      entry.count += 1;
      return entry.count <= max;
    },
  };
}

export function createMemoryFileStore(): FileStore {
  const files = new Map<string, { data: ArrayBuffer; contentType: string }>();
  return {
    async put(path, data, contentType) {
      files.set(path, { data: data.slice(0), contentType });
    },
    async get(path) {
      return files.get(path) ?? null;
    },
    async remove(paths) {
      for (const path of paths) files.delete(path);
    },
  };
}
