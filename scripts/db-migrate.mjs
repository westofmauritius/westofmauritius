/**
 * Creates the database tables (db/schema.sql) in the Neon database given by
 * DATABASE_URL. Run once after creating the database, and again after the
 * schema changes:  DATABASE_URL=… npm run db:migrate
 */
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Set DATABASE_URL (from the Neon dashboard) first.");
  process.exit(1);
}
const sql = neon(url);
const statements = readFileSync("db/schema.sql", "utf8")
  .replace(/--.*$/gm, "")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);
for (const statement of statements) await sql.query(statement);
console.log(`Database ready (${statements.length} statements).`);
