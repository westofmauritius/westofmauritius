import "server-only";
import { headers } from "next/headers";

/** The visitor's IP address as reported by Vercel's proxy. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
